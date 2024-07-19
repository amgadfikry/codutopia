import { expect } from "chai";
import mongoDB, { userModel } from "../../../databases/mongoDB.js";

// Test suite for to test all the methods in the UserModel class
describe("User Model in mongoDB", () => {
  // Declare the variables to be used across all tests
  let user;
  let userId;
  let instructorId;
  let token;
  let invalidId;
  let course;
  let instructor;

  // Before hook to prepare the data before all test start
  before(() => {
    // create learner user object with userName, email, and password
    user = {
      userName: "learner",
      email: "learner@email.com",
      password: "123learner",
    }
    // create invalid id
    invalidId = '60b8d295f8d9f3608c8d9f36'
    // create course object with courseId and paymentId
    course = {
      courseId: '60b8d295f8d9f3608c8d9f37',
      paymentId: '60b8d295f8d9f3608c8d9f38',
    }
    // create instructor user object with userName, email, and password
    instructor = {
      userName: "instructor",
      email: "instructor@mail.com",
      password: "123instructor",
      roles: ['instructor'],
    }
  });

  // After hook to clean up users collection after all tests are done
  after(async () => {
    await userModel.user.deleteMany({});
  });


  // Test suite for the createUser method with all scenarios
  describe("Test suite for CreateUser method", () => {

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for create a new user with only required fields and return the created object
    it('create a new user with only required fields and return the created object', async () => {
      const result = await userModel.createUser(user);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      expect(result).have.property('firstName');
      expect(result).have.property('lastName');
      expect(result).have.property('phoneNumber');
      expect(result).have.property('address');
      expect(result).have.property('avatar');
    });

    // Test case for create a user with the same userName and throw an error 'User already exists'
    it('create a user with the same userName and throw an error "User already exists"', async () => {
      try {
        await userModel.createUser(user);
      }
      catch (error) {
        expect(error.message).to.equal('User already exists');
      }
    });

    // Test case for create a user with the same email and throw an error 'User already exists'
    it('create a user with the same email and throw an error "User already exists"', async () => {
      try {
        // create tempUser object with the same email and different userName
        const tempUser = {
          userName: "newLearner",
          email: user.email,
          password: "123newLearner",
        }
        await userModel.createUser(tempUser);
      }
      catch (error) {
        expect(error.message).to.equal('User already exists');
      }
    });

    // Test case for create a user with missing email required fields and throw an error 'Missing email field'
    it('create a user with email missing required fields and throw an error "Missing email field"', async () => {
      try {
        // create a tempUser object with missing email required fields
        const tempUser = {
          userName: "newLearner",
          password: "123"
        }
        await userModel.createUser(tempUser);
      }
      catch (error) {
        expect(error.message).to.equal('Missing email field');
      }
    });

    // Test case for create a user with instructor role and return the created object
    it('create a user with instructor role and return the created object', async () => {
      const result = await userModel.createUser(instructor);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(instructor.userName);
      expect(result.email).to.equal(instructor.email);
      expect(result.roles[0]).to.equal('instructor');
      expect(result).have.property('firstName');
    });

    // Test case for create a user with valid data through session and in successful transaction
    it('create a user with valid data through session and in successful transaction', async () => {
      // create a two new users object with valid data
      const newUser1 = { userName: "newLearner1", email: "newlearner1@mail.com", password: "123newLearner1", }
      const newUser2 = { userName: "newLearner2", email: "newlearner2@mail.com", password: "123newLearner2", }
      // create a session
      const session = await mongoDB.startSession();
      // create two new users in a transaction with the session
      await userModel.createUser(newUser1, session);
      await userModel.createUser(newUser2, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the users are created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(4);
    });

    // Test case for create a user with invalid data through session and in failed transaction
    it('create a user with invalid data through session and in failed transaction', async () => {
      // create a new users object with valid data
      const newUser = { userName: "newLearner3", email: "newlearner3@mail.com", password: "123newLearner3", }
      // create a session
      const session = await mongoDB.startSession();
      try {
        // create a two new users in a transaction with the session both with same data
        await userModel.createUser(newUser, session);
        await userModel.createUser(newUser, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User already exists');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the users are not created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(4);
    });
  });


  // Test suite for the getUserById method with all scenarios
  describe("Test suite for GetUserById method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for get a user by id that exists and return the user object
    it('get a user by id that exists and return the user object', async () => {
      const result = await userModel.getUserById(userId);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result).to.have.property('userName');
      expect(result).to.have.property('email');
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(40);
      expect(result.password).to.equal(undefined);
      expect(result.resetPasswordToken).to.equal(undefined);
      expect(result.resetPasswordExpires).to.equal(undefined);
    });

    // Test case for get a user by id that does not exist and throw an error 'User not found'
    it('get a user by id that does not exist and throw an error "User not found"', async () => {
      try {
        await userModel.getUserById(invalidId);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for get a user by valid id through session and in successful transaction
    it('get a user by valid id through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // get the user by id in a transaction with the session and create a new user object
      await userModel.getUserById(userId, session);
      const newUser = { userName: "newLearner", email: "newlearner@mail", password: "123newLearner", }
      await userModel.createUser(newUser, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the users are created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(2);
    });

    // Test case for get a user by invalid id through session and in failed transaction
    it('get a user by invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // get the user by invalid id in a transaction with the session with create a new user object
        await userModel.getUserById(invalidId, session);
        const newUser = { userName: "newLearner2", email: "newlearner2@mail", password: "123newLearner2", }
        await userModel.createUser(newUser, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the users are not created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(2);
    });
  });


  // Test suite for the getUserByField method with all scenarios
  describe("Test suite for GetUserByField method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for get a user by userName that exists and return the user object
    it('get a user by userName that exists and return the user object', async () => {
      const result = await userModel.getUserByField({ userName: user.userName });
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(40);
      expect(result.password).to.equal(undefined);
    });

    // Test case for get a user by email that exists and return the user object
    it('get a user by email that exists and return the user object', async () => {
      const result = await userModel.getUserByField({ email: user.email });
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(40);
      expect(result.password).to.equal(undefined);
    });

    // Test case for get a user by field that does not exist and throw an error 'User not found'
    it('get a user by field that does not exist and throw an error "User not found"', async () => {
      try {
        await userModel.getUserByField({ invalid: 'invalidField' });
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for get a user by userName that does not exist and throw an error 'User not found'
    it('get a user by userName that does not exist and throw an error "User not found"', async () => {
      try {
        const result = await userModel.getUserByField({ userName: 'invalidUserName' });
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for get a user by userName that exists through session and in successful transaction
    it('get a user by userName that exists through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // get the user by userName in a transaction with the session and create a new user object
      await userModel.getUserByField({ userName: user.userName }, session);
      const newUser = { userName: "newLearner", email: "newlearner@mail", password: "123newLearner", }
      await userModel.createUser(newUser, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the users are created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(2);
    });

    // Test case for get a user by invalid field through session and in failed transaction
    it('get a user by invalid field through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // get the user by invalid field in a transaction with the session with create a new user object
        await userModel.getUserByField({ invalid: 'invalidField' }, session);
        const newUser = { userName: "newLearner2", email: "newlearner2@mail", password: "123newLearner2", }
        await userModel.createUser(newUser, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the users are not created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(2);
    });
  });


  // Test suite for the countRoleUsers method with all scenarios
  describe("Test suite for CountRoleUsers method", () => {

    // before hook create a new learner and instructor user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
      const result2 = await userModel.createUser(instructor);
      instructorId = result2._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for count the number of users with a role 'learner' and return the number of learners users
    it('count the number of users with a role "learner" and return the number of learners users', async () => {
      const result = await userModel.countRoleUsers('learner');
      // check if the result is correct
      expect(result).to.be.a('number');
      expect(result).to.equal(1);
    });

    // Test case for count the number of users with a role 'instructor' and return the number of instructors users
    it('count the number of users with a role "instructor" and return the number of instructors users', async () => {
      const result = await userModel.countRoleUsers('instructor');
      // check if the result is correct
      expect(result).to.be.a('number');
      expect(result).to.equal(1);
    });

    // Test case for count the number of users with a role not exist and throw an error 'Invalid role'
    it('count the number of users with a role not exist and throw an error "Invalid role"', async () => {
      try {
        await userModel.countRoleUsers('invalidRole');
      }
      catch (error) {
        expect(error.message).to.equal('Invalid role');
      }
    });

    // Test case for count the number of users with a role 'learner' through session and in successful transaction
    it('count the number of users with a role "learner" through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // count the number of users with a role 'learner' in a transaction with the session and create a new user object
      await userModel.countRoleUsers('learner', session);
      const newUser = { userName: "newLearner", email: "newlearner@mail", password: "123newLearner", }
      await userModel.createUser(newUser, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the users are created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(3);
    });

    // Test case for count the number of users with a role not exist through session and in failed transaction
    it('count the number of users with a role not exist through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // count the number of users with a role not exist in a transaction with the session with create a new user object
        await userModel.countRoleUsers('invalidRole', session);
        const newUser = { userName: "newLearner2", email: "newlearner2@mail", password: "123newLearner2", }
        await userModel.createUser(newUser, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Invalid role');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the users are not created
      const users = await userModel.user.find({}).countDocuments();
      expect(users).to.equal(3);
    });
  });


  // Test suite for the updateUserById method with all scenarios
  describe("Test suite for UpdateUserById method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for update a user by id with new data and return the updated user object
    it('update a user by id with new data and return the updated user object', async () => {
      // update the user object with new data
      const updatedUser = { firstName: 'FirstName', lastName: 'newLastName' }
      const result = await userModel.updateUserById(userId, updatedUser);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.firstName).to.equal(updatedUser.firstName);
      expect(result.lastName).to.equal(updatedUser.lastName);
      expect(result.password).to.equal(undefined);
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(60);
    });

    // Test case for update a user by id with invalid id and throw an error 'User not found'
    it('update a user by id with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.updateUserById(invalidId, { userName: 'newLearner' });
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for update a user by id with new data through session and in successful transaction
    it('update a user by id with new data through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // update the user by id with new userName twice in a transaction with the session
      await userModel.updateUserById(userId, { userName: 'updatedLearner1' }, session);
      await userModel.updateUserById(userId, { userName: 'updatedLearner2' }, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user are updated
      const result = await userModel.getUserById(userId);
      expect(result.userName).to.equal('updatedLearner2');
    });

    // Test case for update a user by id with invalid id through session and in failed transaction
    it('update a user by id with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // update the user twice one with valid id and one with invalid id in a transaction with the session
        await userModel.updateUserById(userId, { userName: 'newLearner' }, session);
        await userModel.updateUserById(invalidId, { userName: 'newLearner' }, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user are not updated
      const result = await userModel.getUserById(userId);
      expect(result.userName).to.equal('updatedLearner2');
    });
  });


  // Test suite for the confimUser method with all scenarios
  describe("Test suite for ConfimUser method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for confirm a user by id with valid id and return true
    it('confirm a user by id with valid id and return true', async () => {
      const result = await userModel.confimUser(userId);
      // check if the result is true
      expect(result).to.equal(true);
    });

    // Test case for confirm a user by id with invalid id throw an error 'User not found'
    it('confirm a user by id with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.confimUser(invalidId);
      } catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for confirm a user by id with valid id through session and in successful transaction
    it('confirm a user by id with valid id through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // confirm the user by id in a transaction with the session
      await userModel.confimUser(userId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user is confirmed
      const result = await userModel.getUserById(userId);
      expect(result.confirmed).to.equal(true);
    });

    // Test case for confirm a user by id with invalid id through session and in failed transaction
    it('confirm a user by id with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // confirm the user by invalid id in a transaction with the session
        await userModel.confimUser(userId, session);
        await userModel.confimUser(invalidId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user is not confirmed
      const result = await userModel.getUserById(userId);
      expect(result.confirmed).to.equal(true);
    });
  });


  // Test suite for the addNewRole method with all scenarios
  describe("Test suite for AddNewRole method", () => {

    // before hook create a new learner and instructor user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
      const result2 = await userModel.createUser(instructor);
      instructorId = result2._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for add a new instructor role to a learner user by id and return the updated roles array
    it('add a new instructor role to a learner user by id and return the updated roles array', async () => {
      const result = await userModel.addNewRole(userId, 'instructor');
      // check if the result is correct
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result).deep.equal(['learner', 'instructor']);
    });

    // Test case for add a new learner role to an instructor user by id and return the updated roles array
    it('add a new learner role to an instructor user by id and return the updated roles array', async () => {
      const result = await userModel.addNewRole(instructorId, 'learner');
      // check if the result is correct
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result).deep.equal(['instructor', 'learner']);
    });

    // Test case for add a new role to a user by id if the role is already exist and return the updated roles array
    it('add a new role to a user by id if the role is already exist and return the updated roles array', async () => {
      const result = await userModel.addNewRole(userId, 'instructor');
      // check if the result is correct
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result).deep.equal(['learner', 'instructor']);
    });

    // Test case for add a new role to a user by id with invalid id and throw an error 'User not found'
    it('add a new role to a user by id with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.addNewRole(invalidId, 'instructor');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for add a new role to a user by id with invalid role and throw an error 'Invalid role'
    it('add a new role to a user by id with invalid role and throw an error "Invalid role"', async () => {
      try {
        await userModel.addNewRole(userId, 'invalidRole');
      }
      catch (error) {
        expect(error.message).to.equal('Invalid role');
      }
    });

    // Test case for add a new role to a user by id through session and in successful transaction
    it('add a new role to a user by id through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // add a new role to a user by id in a transaction with the session
      await userModel.addNewRole(userId, 'instructor', session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user has the new role
      const result = await userModel.getUserById(userId);
      expect(result.roles).to.have.lengthOf(2);
      expect(result.roles).deep.equal(['learner', 'instructor']);
    });

    // Test case for add a new role to a user by id with invalid id through session and in failed transaction
    it('add a new role to a user by id with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // add a new role to a user by invalid id in a transaction with the session
        await userModel.addNewRole(userId, 'instructor', session);
        await userModel.addNewRole(invalidId, 'instructor', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user has the new role
      const result = await userModel.getUserById(userId);
      expect(result.roles).to.have.lengthOf(2);
      expect(result.roles).deep.equal(['learner', 'instructor']);
    });
  });


  // Test suite for the checkUserPassword method with all scenarios
  describe("Test suite for CheckUserPassword method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for check the user password in case the user password is correct and return the user id
    it('check the user password in case the user password is correct and return the user id', async () => {
      const result = await userModel.checkUserPassword(user.email, user.password);
      // check if the result is correct
      expect(result.toString()).to.equal(userId.toString());
    });

    // Test case for check the user password in case the user password is incorrect and throw an error 'Password is incorrect'
    it('check the user password is case the user password is incorrect and throw an error "Password is incorrect"', async () => {
      try {
        await userModel.checkUserPassword(user.email, 'incorrectPassword');
      }
      catch (error) {
        expect(error.message).to.equal('Password is incorrect');
      }
    });

    // Test case for check the user password in case the user email is incorrect and throw an error 'User not found'
    it('check the user password in case the user email is incorrect and throw an error "User not found"', async () => {
      try {
        await userModel.checkUserPassword('invalidEmail', user.password);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for check the user password in case the user password is correct through session and in successful transaction
    it('check the user password in case the user password is correct through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // check the user password in a transaction with the session
      await userModel.checkUserPassword(user.email, user.password, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for check the user password in case the user password is incorrect through session and in failed transaction
    it('check the user password in case the user password is incorrect through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // check the user password with incorrect password in a transaction with the session
        await userModel.checkUserPassword(user.email, 'incorrectPassword', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Password is incorrect');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the resetPasswordToken method with all scenarios
  describe("Test suite for ResetPasswordToken method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for reset the user password token with the user email and return the token
    it('reset the user password token with the user email and return the token', async () => {
      const result = await userModel.resetPasswordToken(user.email);
      expect(result).to.be.a('string');
    });

    // Test case for reset the user password token with invalid email and throw an error 'User not found'
    it('reset the user password token with invalid email and throw an error "User not found"', async () => {
      try {
        await userModel.resetPasswordToken('invalidEmail');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for reset the user password token with the user email through session and in successful transaction
    it('reset the user password token with the user email through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // reset the user password token in a transaction with the session
      await userModel.resetPasswordToken(user.email, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for reset the user password token with invalid email through session and in failed transaction
    it('reset the user password token with invalid email through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // reset the user password token with invalid email in a transaction with the session
        await userModel.resetPasswordToken('invalidEmail', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the verifyByToken method with all scenarios
  describe("Test suite for VerifyByToken method", () => {

    // before hook create a new user object and get the user id and generate a reset password token
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
      token = await userModel.resetPasswordToken(user.email);
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for verify the reset password token with valid token and return the user id
    it('verify the reset password token with valid token and return the user id', async () => {
      const result = await userModel.verifyByToken(token);
      // expect the result is correct
      expect(result).to.be.an('object');
      expect(result.toString()).to.equal(userId.toString());
    });

    // Test case for verify the reset password token with invalid token and throw an error 'Token is invalid or expired'
    it('verify the reset password token with invalid token and throw an error "Token is invalid or expired"', async () => {
      try {
        await userModel.verifyByToken('invalidToken');
      }
      catch (error) {
        expect(error.message).to.equal('Token is invalid or expired');
      }
    });

    // Test case for verify the reset password token with valid token through session and in successful transaction
    it('verify the reset password token with valid token through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // verify the reset password token in a transaction with the session
      await userModel.verifyByToken(token, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for verify the reset password token with invalid token through session and in failed transaction
    it('verify the reset password token with invalid token through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // verify the reset password token with invalid token in a transaction with the session
        await userModel.verifyByToken('invalidToken', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Token is invalid or expired');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the updatePassword method with all scenarios
  describe("Test suite for UpdatePassword method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for update the user password with the userId and the new password and return the message Password updated successfully
    it('update the user password with the userId and the new password and return the message Password updated', async () => {
      const result = await userModel.updatePassword(userId, '123newPassword');
      // check if the result is correct
      expect(result).to.equal('Password updated successfully');
    });

    // Test case for update the user password with invalid id and throw an error 'User not found'
    it('update the user password with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.updatePassword(invalidId, '123newPassword');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // test case for check the user password is correct after update and return the user id
    it('check the user password is correct after update and return the user id', async () => {
      const result = await userModel.checkUserPassword(user.email, '123newPassword');
      // check if the result is correct
      expect(result.toString()).to.equal(userId.toString());
    });

    // Test case for update the user password with the userId and the new password through session and in successful transaction
    it('update the user password with the userId and the new password through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // update the user password in a transaction with the session
      await userModel.updatePassword(userId, '123newPassword', session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for update the user password with invalid id through session and in failed transaction
    it('update the user password with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // update the user password with invalid id in a transaction with the session
        await userModel.updatePassword(invalidId, '123newPassword', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the addCourseToEnrolledList method with all scenarios
  describe("Test suite for AddCourseToEnrolledList method", () => {

    // before hook create a new user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for add a course to the enrolled list of the user and return the course object data
    it('AddCourseToEnrolledList method add a course to the enrolled list of the user', async () => {
      const result = await userModel.addCourseToEnrolledList(userId, course.courseId, course.paymentId);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.courseId).to.equal(course.courseId);
      expect(result.paymentId).to.equal(course.paymentId);
      expect(result).to.have.property('progress');
      expect(result.progress).to.equal(0);
      expect(result).to.have.property('createdAt');
      expect(result).to.have.property('updatedAt');
    });

    // Test case for add a course to the enrolled list of the user with invalid id and throw an error 'User not found'
    it('add a course to the enrolled list of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.addCourseToEnrolledList(invalidId, course.courseId, course.paymentId);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for add a course to the enrolled list of the user through session and in successful transaction
    it('add a course to the enrolled list of the user through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // create a new course object and add it to the enrolled list
      const newCourse = { courseId: '60b8d295f8d9f3608c8d9f50', paymentId: '60b8d295f8d9f3608c8d9f85' }
      await userModel.addCourseToEnrolledList(userId, newCourse.courseId, newCourse.paymentId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course is added to the enrolled list
      const result = await userModel.getUserById(userId);
      expect(result.enrolled.length).to.equal(2);
      expect(result.enrolled[0].courseId).to.equal(course.courseId);
      expect(result.enrolled[1].courseId).to.equal(newCourse.courseId);
    });

    // Test case for add a course to the enrolled list of the user with invalid id through session and in failed transaction
    it('add a course to the enrolled list of the user with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // create course object and add it and then add a course with invalid id to the enrolled list
        const newCourse = { courseId: '60b8d295f8d9f3608c8d9f55', paymentId: '60b8d295f8d9f3608c8d9f60' }
        await userModel.addCourseToEnrolledList(userId, newCourse.courseId, newCourse.paymentId, session);
        await userModel.addCourseToEnrolledList(invalidId, course.courseId, course.paymentId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not added to the enrolled list
      const result = await userModel.getUserById(userId);
      expect(result.enrolled.length).to.equal(2);
    });
  });


  // Test suite for updateCourseProgress method with all scenarios
  describe("Test suite for UpdateCourseProgress method", () => {

    // before hook create a new user object and get the user id and add a course to the enrolled list
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
      await userModel.addCourseToEnrolledList(userId, course.courseId, course.paymentId);
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for update the course progress of the user successfully and return the new progress
    it('update the course progress of the user successfully and return the new progress', async () => {
      const result = await userModel.updateCourseProgress(userId, course.courseId, 10);
      // check if the result is correct
      expect(result).to.be.a('number');
      expect(result).to.equal(10);
    });

    // Test case for update the course progress of the user with new progress and return the new progress
    it('update the course progress of the user with new progress and return the new progress', async () => {
      const result = await userModel.updateCourseProgress(userId, course.courseId, 10);
      // check if the result is correct
      expect(result).to.be.a('number');
      expect(result).to.equal(20);
    });

    // Test case for update the course progress of the user with invalid id and throw an error 'User not found'
    it('update the course progress of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.updateCourseProgress(invalidId, course.courseId, 10);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for update the course progress of the user through session and in successful transaction
    it('update the course progress of the user through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // update the course progress in a transaction with the session
      await userModel.updateCourseProgress(userId, course.courseId, 30, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course progress is updated
      const result = await userModel.getUserById(userId);
      expect(result.enrolled[0].progress).to.equal(50);
    });

    // Test case for update the course progress of the user with invalid id through session and in failed transaction
    it('update the course progress of the user with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // update the course progress with invalid id in a transaction with the session
        await userModel.updateCourseProgress(userId, course.courseId, 10, session);
        await userModel.updateCourseProgress(invalidId, course.courseId, 10, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course progress is not updated
      const result = await userModel.getUserById(userId);
      expect(result.enrolled[0].progress).to.equal(50);
    });
  });


  // Test suite for the addCourseToWishlistorCreatedList method with all scenarios
  describe("Test suite for AddCourseToWishlistorCreatedList method", () => {

    // before hook create a new learner and instructor user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
      const result2 = await userModel.createUser(instructor);
      instructorId = result2._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for add a course to the wishlist of the learner user and return the message 'Course added to wishlist successfully'
    it('add a course to the wishlist of the learner user and return the message "Course added to wishlist successfully"', async () => {
      const result = await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', '60b8d295f8d9f3608c8d9f50');
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course added to wishList successfully');
    });

    // Test case for add a course to the createdList of instructor and return the message 'Course added to createdList successfully'
    it('add a course to the createdList of instructor and return the message "Course added to createdList successfully"', async () => {
      const result = await userModel.addCourseToWishlistorCreatedList(instructorId, 'createdList', '60b8d295f8d9f3608c8d9f50');
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course added to createdList successfully');
    });

    // Test case for add a course to the wishlist with instructor id and throw an error 'User is not a learner'
    it('add a course to the wishlist with instructor id and throw an error "User is not a learner"', async () => {
      try {
        await userModel.addCourseToWishlistorCreatedList(instructorId, 'wishList', '60b8d295f8d9f3608c8d9f56');
      }
      catch (error) {
        expect(error.message).to.equal('User is not a learner');
      }
    });

    // Test case for add a course to the createdList with learner id and throw an error 'User is not an instructor'
    it('add a course to the createdList with learner id and throw an error "User is not an instructor"', async () => {
      try {
        await userModel.addCourseToWishlistorCreatedList(userId, 'createdList', '60b8d295f8d9f3608c8d9f50');
      }
      catch (error) {
        expect(error.message).to.equal('User is not an instructor');
      }
    });

    // Test case for add a course to the wishlist of the user with invalid id and throw an error 'User not found'
    it('add a course to the wishlist of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.addCourseToWishlistorCreatedList(invalidId, 'wishList', '60b8d295f8d9f3608c8d9f50');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for add a course through session and in successful transaction
    it('add a course through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // add a course to the wishlist of the user in a transaction with the session
      await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', '60b8d295f8d9f3608c8d9f56', session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course is added to the wishlist
      const result = await userModel.getUserById(userId);
      expect(result.wishList.length).to.equal(2);
    });

    // Test case for add a course with through session and in failed transaction
    it('add a course with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // add a course with invalid list type in a transaction with the session
        await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', '60b8d295f8d9f3608c8d9f56', session);
        await userModel.addCourseToWishlistorCreatedList(userId, 'createdList', '60b8d295f8d9f3608c8d9f56', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User is not an instructor')
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not added to the wishlist
      const result = await userModel.getUserById(userId);
      expect(result.wishList.length).to.equal(2);
    });
  });


  // Test suite for the removeCourseFromList method with all scenarios
  describe("Test suite for RemoveCourseFromList method", () => {

    // before hook create a new learner and instructor user object, add a course to the wishlist, createdList and enrolled list
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
      const result2 = await userModel.createUser(instructor);
      instructorId = result2._id;

      await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', '60b8d295f8d9f3608c8d9f50');
      await userModel.addCourseToWishlistorCreatedList(instructorId, 'createdList', '60b8d295f8d9f3608c8d9f50');
      await userModel.addCourseToEnrolledList(userId, '60b8d295f8d9f3608c8d9f50', '60b8d295f8d9f3608c8d9f85');
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for remove a course from the wishlist of the learner user and return the message 'Course removed from wishList'
    it('remove a course from the wishlist of the learner user and return the message "Course removed from wishlist"', async () => {
      const result = await userModel.removeCourseFromList(userId, 'wishList', '60b8d295f8d9f3608c8d9f50');
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course removed from wishList');
    });

    // Test case for remove a course from wishlist of the instructor user and return the message 'User is not a learner'
    it('remove a course from wishlist of the instructor user and return the message "User is not a learner"', async () => {
      try {
        await userModel.removeCourseFromList(instructorId, 'wishList', '60b8d295f8d9f3608c8d9f50');
      }
      catch (error) {
        expect(error.message).to.equal('User is not a learner');
      }
    });

    // Test case for remove a course from createdList of the instructor user and return the message 'Course removed from createdList'
    it('remove a course from createdList of the instructor user and return the message "Course removed from createdList"', async () => {
      const result = await userModel.removeCourseFromList(instructorId, 'createdList', '60b8d295f8d9f3608c8d9f50');
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course removed from createdList');
    });

    // Test case for remove a course from createdList of the learner user and return the message 'User is not an instructor'
    it('remove a course from createdList of the learner user and return the message "User is not an instructor"', async () => {
      try {
        await userModel.removeCourseFromList(userId, 'createdList', '60b8d295f8d9f3608c8d9f50');
      }
      catch (error) {
        expect(error.message).to.equal('User is not an instructor');
      }
    });

    // Test case for remove a course from the enrolled list of the learner and return the message 'Course removed from enrolled list'
    it('remove a course from the enrolled list of the learner and return the message "Course removed from enrolled list"', async () => {
      const result = await userModel.removeCourseFromList(userId, 'enrolled', '60b8d295f8d9f3608c8d9f50');
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course removed from enrolled');
    });

    // Test case for remove a course from the enrolled list of the instructor and return the message 'User is not a learner'
    it('remove a course from the enrolled list of the instructor and return the message "User is not a learner"', async () => {
      try {
        await userModel.removeCourseFromList(instructorId, 'enrolled', '60b8d295f8d9f3608c8d9f50');
      }
      catch (error) {
        expect(error.message).to.equal('User is not a learner');
      }
    });

    // Test case for remove a course from the wishlist of the user with invalid id and throw an error 'User not found'
    it('remove a course from the wishlist of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.removeCourseFromList(invalidId, 'wishList', '60b8d295f8d9f3608c8d9f50');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for remove a course through session and in successful transaction
    it('remove a course through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // add 2 course to the wishlist of the user in a transaction with the session and then remove one
      await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', '60b8d295f8d9f3608c8d9f56', session);
      await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', '60b8d295f8d9f3608c8d9f57', session);
      await userModel.removeCourseFromList(userId, 'wishList', '60b8d295f8d9f3608c8d9f56', session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course is removed from the wishlist
      const result = await userModel.getUserById(userId);
      expect(result.wishList.length).to.equal(1);
    });

    // Test case for remove a course with invalid id through session and in failed transaction
    it('remove a course with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // remove course in wishlist then remove a course with invalid id in a transaction with the session
        await userModel.removeCourseFromList(userId, 'wishList', '60b8d295f8d9f3608c8d9f57', session);
        await userModel.removeCourseFromList(invalidId, 'wishList', '60b8d295f8d9f3608c8d9f57', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not removed from the wishlist
      const result = await userModel.getUserById(userId);
      expect(result.wishList.length).to.equal(1);
    });
  });


  // Test suite for the deleteUserById method with all scenarios
  describe("DeleteUserById method", () => {

    // before hook create a new learner and instructor user object and get the user id
    before(async () => {
      const result = await userModel.createUser(user);
      userId = result._id;
      const result2 = await userModel.createUser(instructor);
      instructorId = result2._id;
    });

    // after hook to clean up users collection after test suite is done
    after(async () => {
      await userModel.user.deleteMany({});
    });

    // Test case for delete a user by id with valid id and return the message 'User deleted successfully'
    it('delete a user by id with valid id and return the message "User deleted successfully"', async () => {
      const result = await userModel.deleteUserById(userId);
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('User deleted successfully');
    });

    // Test case for delete a user by id with invalid id and throw an error 'User not found'
    it('delete a user by id with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.deleteUserById(userId);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for delete a user by id through session and in successful transaction
    it('delete a user by id through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // delete the user in a transaction with the session
      await userModel.deleteUserById(instructorId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user is deleted
      const result = await userModel.countRoleUsers('instructor');
      expect(result).to.equal(0);
    });

    // Test case for delete a user by id with invalid id through session and in failed transaction
    it('delete a user by id with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // delete the user with invalid id in a transaction with the session
        await userModel.deleteUserById(userId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user is not deleted
      const result = await userModel.countRoleUsers('learner');
      expect(result).to.equal(0);
    });
  });
}).timeout(15000);