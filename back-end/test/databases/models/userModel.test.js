import { expect } from "chai";
import mongoDB, { userModel } from "../../../databases/mongoDB.js";
import bcrypt from "bcrypt";

// Test suite for to test all the methods in the UserModel class
describe("UserModel", () => {
  // Declare the variables to be used across all tests
  let userData;
  let userId;

  // BeforeEach hook to prepare the data before each test
  beforeEach(() => {
    // create learner user object with userName, email, and password
    userData = {
      userName: "learner",
      email: "learner@email.com",
      password: "123learner",
    }
  });

  // After each hook to clean up users collection after each test
  afterEach(async () => {
    await userModel.user.deleteMany({});
  });


  // Test suite for the createUser method with all scenarios
  describe("Test suite for CreateUser method", () => {

    // Test case for create a new user with only required fields and return the created object
    it('create a new user with only required fields and return the created object', async () => {
      const result = await userModel.createUser(userData);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(userData.userName);
      expect(result.email).to.equal(userData.email);
      expect(result.roles[0]).to.equal('learner');
      expect(result).have.property('firstName');
      expect(result).have.property('lastName');
      expect(result).have.property('phoneNumber');
      expect(result).have.property('address');
      expect(result).have.property('avatar');
      expect(result.wishList).to.be.an('array');
      expect(result.enrolled).to.be.an('array');
      expect(result).not.to.have.property('password');
      expect(result).not.to.have.property('resetPasswordToken');
      expect(result).not.to.have.property('resetPasswordExpires');
      expect(result).to.have.property('profileCompleted');
      expect(result).not.to.have.property('createdList');
      expect(result.confirmed).to.equal(false);
    });

    // Test case for create a user with the same userName and throw an error 'User already exists'
    it('create a user with the same userName and throw an error "User already exists"', async () => {
      try {
        await userModel.createUser(userData);
        await userModel.createUser(userData);
      }
      catch (error) {
        expect(error.message).to.equal('User already exists');
      }
    });

    // Test case for create a user with the same email and throw an error 'User already exists'
    it('create a user with the same email and throw an error "User already exists"', async () => {
      try {
        await userModel.createUser(userData);
        userData.userName = "newLearner";
        await userModel.createUser(userData);
      }
      catch (error) {
        expect(error.message).to.equal('User already exists');
      }
    });

    // Test case for create a user with missing email required fields and throw an error 'Missing email field'
    it('create a user with email missing required fields and throw an error "Missing email field"', async () => {
      try {
        delete userData.email;
        await userModel.createUser(userData);
      }
      catch (error) {
        expect(error.message).to.equal('Missing email field');
      }
    });

    // Test case for create a user with instructor role and return the created object
    it('create a user with instructor role and return the created object', async () => {
      // add instructor role to the user object
      userData.roles = ['instructor'];
      const result = await userModel.createUser(userData);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(userData.userName);
      expect(result.email).to.equal(userData.email);
      expect(result.roles[0]).to.equal('instructor');
      expect(result).not.have.property('enrolled');
      expect(result).not.have.property('wishList');
      expect(result).to.have.property('createdList');
    });

    // Test case for create a user with valid data through session and in successful transaction
    it('create a user with valid data through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // create a new user in a transaction with the session
      await userModel.createUser(userData, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the users are created
      const users = await userModel.user.find({})
      expect(users.length).to.equal(1);
    });

    // Test case for create a user with invalid data through session and in failed transaction
    it('create a user with invalid data through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // create a two new users in a transaction with the session both with same data
        await userModel.createUser(userData, session);
        await userModel.createUser(userData, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User already exists');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the users are not created
      const users = await userModel.user.find({})
      expect(users.length).to.equal(0);
    });
  });


  // Test suite for the getUserById method with all scenarios
  describe("Test suite for GetUserById method", () => {

    // before each hook create a new user object and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for get a user by id that exists and return the user object
    it('get a user by id that exists and return the user object', async () => {
      const result = await userModel.getUserById(userId);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result).to.have.property('userName');
      expect(result).to.have.property('email');
      expect(result.userName).to.equal(userData.userName);
      expect(result.email).to.equal(userData.email);
      expect(result.roles[0]).to.equal('learner');
      expect(result).to.have.property('profileCompleted');
      expect(result.confirmed).to.equal(false);
      expect(result).not.to.have.property('password');
      expect(result).not.to.have.property('resetPasswordToken');
      expect(result).not.to.have.property('resetPasswordExpires');
    });

    // Test case for get a user by id that does not exist and throw an error 'User not found'
    it('get a user by id that does not exist and throw an error "User not found"', async () => {
      try {
        await userModel.getUserById('621f7b9e6f3b7d1d9e9f9d4b');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for get a user by valid id through session and in successful transaction
    it('get a user by valid id through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // get the user by id in a transaction with the session
      await userModel.getUserById(userId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for get a user by invalid id through session and in failed transaction
    it('get a user by invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // get the user by invalid id in a transaction with the session
        await userModel.getUserById(userData, session);
        await userModel.getUserById('621f7b9e6f3b7d1d9e9f9d4b', session);
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


  // Test suite for the getUserByField method with all scenarios
  describe("Test suite for GetUserByField method", () => {

    // before hook create a new user object and get the user id 
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for get a user by userName that exists and return the user object
    it('get a user by userName that exists and return the user object', async () => {
      const result = await userModel.getUserByField({ userName: userData.userName });
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(userData.userName);
      expect(result.email).to.equal(userData.email);
      expect(result).to.have.property('profileCompleted');
      expect(result).not.to.have.property('password');
    });

    // Test case for get a user by email that exists and return the user object
    it('get a user by email that exists and return the user object', async () => {
      const result = await userModel.getUserByField({ email: userData.email });
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(userData.userName);
      expect(result.email).to.equal(userData.email);
      expect(result).to.have.property('profileCompleted');
      expect(result).not.to.have.property('password');
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
      // get the user by userName in a transaction with the session 
      await userModel.getUserByField({ userName: userData.userName }, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for get a user by invalid field through session and in failed transaction
    it('get a user by invalid field through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // get the user by invalid field in a transaction with the session
        await userModel.getUserByField({ email: userData.email }, session);
        await userModel.getUserByField({ invalid: 'invalidField' }, session);
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


  // Test suite for the countRoleUsers method with all scenarios
  describe("Test suite for CountRoleUsers method", () => {

    // beforeEach hook create a new learner and instructor user object
    beforeEach(async () => {
      await userModel.createUser(userData);
      const instructorData = { ...userData, userName: 'instructor', email: 'instructor@mail', roles: ['instructor'] };
      await userModel.createUser(instructorData);
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
      // count the number of users with a role 'learner' in a transaction
      await userModel.countRoleUsers('learner', session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for count the number of users with a role not exist through session and in failed transaction
    it('count the number of users with a role not exist through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // count the number of users with a role not exist
        await userModel.countRoleUsers('invalidRole', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Invalid role');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the updateUserById method with all scenarios
  describe("Test suite for UpdateUserById method", () => {

    // beforeEach hook create a new user object and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for update a user by id with new data and return the updated user object
    it('update a user by id with new data and return the updated user object', async () => {
      // update the user object with new data
      const updatedUser = { firstName: 'FirstName', lastName: 'newLastName' }
      const result = await userModel.updateUserById(userId, updatedUser);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(userData.userName);
      expect(result.email).to.equal(userData.email);
      expect(result.firstName).to.equal(updatedUser.firstName);
      expect(result.lastName).to.equal(updatedUser.lastName);
      expect(result).not.to.have.property('password');
      expect(result).not.to.have.property('resetPasswordToken');
      expect(result).not.to.have.property('resetPasswordExpires');
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(60);
    });

    // Test case for update a user by id with invalid id and throw an error 'Failed to update user'
    it('update a user by id with invalid id and throw an error "Failed to update user"', async () => {
      try {
        await userModel.updateUserById('621f7b9e6f3b7d1d9e9f9d5b', { userName: 'newLearner' });
      }
      catch (error) {
        expect(error.message).to.equal('Failed to update user');
      }
    });

    // Test case for update a user by id with new data through session and in successful transaction
    it('update a user by id with new data through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // update the user by id with new userName twice in a transaction with the session
      await userModel.updateUserById(userId, { userName: 'updatedLearner1' }, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user are updated
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.userName).to.equal('updatedLearner1');
    });

    // Test case for update a user by id with invalid id through session and in failed transaction
    it('update a user by id with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // update the user twice one with valid id and one with invalid id in a transaction with the session
        await userModel.updateUserById(userId, { userName: 'newLearner' }, session);
        await userModel.updateUserById('621f7b9e6f3b7d1d9e9f9d5b', { userName: 'updatedLearner2' }, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Failed to update user');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user are not updated
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.userName).to.equal(userData.userName);
    });
  });


  // Test suite for generateConfirmationToken method with all scenarios
  describe("Test suite for GenerateConfirmationToken method", () => {

    // before each hook create a new user object and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for generate a confirmation token for a user by id and return the token
    it('generate a confirmation token for a user by id and return the token', async () => {
      const token = await userModel.generateConfirmationToken(userId);
      // check if the token is correct
      expect(token).to.be.a('string');
    });

    // Test case for generate a confirmation token for a user by invalid id and throw an error 'User not found'
    it('generate a confirmation token for a user by invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.generateConfirmationToken('621f7b9e6f3b7d1d9e9f9d5b');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for generate a confirmation token for a user by id through session and in successful transaction
    it('generate a confirmation token for a user by id through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // generate a confirmation token for a user by id in a transaction with the session
      await userModel.generateConfirmationToken(userId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for generate a confirmation token for a user by invalid id through session and in failed transaction
    it('generate a confirmation token for a user by invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // generate a confirmation token for a user by invalid id in a transaction with the session
        await userModel.generateConfirmationToken('621f7b9e6f3b7d1d9e9f9d5b', session);
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


  // Test suite for the confimUser method with all scenarios
  describe("Test suite for ConfimUser method", () => {
    let token;

    // beforeEach hook create a new user object and create a confirmation token
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      token = await userModel.generateConfirmationToken(result._id);
      userId = result._id;
    });

    // Test case for confirm a user by token and return true
    it('confirm a user by token and return true', async () => {
      const result = await userModel.confimUser(token);
      // check if the result is true
      expect(result).to.equal(true);
      // check if the user is confirmed
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.confirmed).to.equal(true);
    });

    // Test case for confirm a user by token with invalid token and throw an error 'User not found'
    it('confirm a user by token with invalid token and throw an error "User not found"', async () => {
      try {
        await userModel.confimUser('621f7b9e6f3b7d1d9e9f9d5b');
      } catch (error) {
        expect(error.message).to.equal('User not found');
      }
      // check if the user is not confirmed
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.confirmed).to.equal(false);
    });

    // Test case for confirm a user by token through session and in successful transaction
    it('confirm a user by token through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // confirm the user by token in a transaction with the session
      await userModel.confimUser(token, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user is confirmed
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.confirmed).to.equal(true);
    });

    // Test case for confirm a user by token with invalid token through session and in failed transaction
    it('confirm a user by token with invalid token through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // confirm the user by invalid token in a transaction with the session
        await userModel.confimUser('621f7b9e6f3b7d1d9e9f9d5b', session);
        await userModel.confimUser(token, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user is not confirmed
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.confirmed).to.equal(false);
    });
  });


  // Test suite for the addNewRole method with all scenarios
  describe("Test suite for AddNewRole method", () => {

    // before hook create a new learner and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for add a new instructor role to a learner user by id and return the updated roles array
    it('add a new instructor role to a learner user by id and return the updated roles array', async () => {
      const result = await userModel.addNewRole(userId, 'instructor');
      // check if the result is correct
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result).deep.equal(['learner', 'instructor']);
    });

    // Test case for add a new role to a user by id if the role is already exist and return the updated roles array
    it('add a new role to a user by id if the role is already exist and return the updated roles array', async () => {
      const result = await userModel.addNewRole(userId, 'learner');
      // check if the result is correct
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result).deep.equal(['learner']);
    });

    // Test case for add a new role to a user by id with invalid id and throw an error 'User not found'
    it('add a new role to a user by id with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.addNewRole('621f7b9e6f3b7d1d9e9f9d5b', 'instructor');
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
      const result = await userModel.user.findOne({ _id: userId });
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
        await userModel.addNewRole('621f7b9e6f3b7d1d9e9f9d5b', 'instructor', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user has the new role
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.roles).to.have.lengthOf(1);
      expect(result.roles).deep.equal(['learner']);
    });
  });


  // Test suite for the checkUserPassword method with all scenarios
  describe("Test suite for CheckUserPassword method", () => {

    // beforeEach hook create a new user object and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for check the user password in case the user password is correct and return the user id
    it('check the user password in case the user password is correct and return the user id', async () => {
      const result = await userModel.checkUserPassword(userData.email, userData.password);
      // check if the result is correct
      expect(result.toString()).to.equal(userId.toString());
    });

    // Test case for check the user password in case the user password is incorrect and throw an error 'Password is incorrect'
    it('check the user password is case the user password is incorrect and throw an error "Password is incorrect"', async () => {
      try {
        await userModel.checkUserPassword(userData.email, 'incorrectPassword');
      }
      catch (error) {
        expect(error.message).to.equal('Password is incorrect');
      }
    });

    // Test case for check the user password in case the user email is incorrect and throw an error 'User not found'
    it('check the user password in case the user email is incorrect and throw an error "User not found"', async () => {
      try {
        await userModel.checkUserPassword('invalidEmail', userData.password);
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
      await userModel.checkUserPassword(userData.email, userData.password, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for check the user password in case the user password is incorrect through session and in failed transaction
    it('check the user password in case the user password is incorrect through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // check the user password with incorrect password in a transaction with the session
        await userModel.checkUserPassword(userData.email, 'incorrectPassword', session);
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
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for reset the user password token with the user email and return the token
    it('reset the user password token with the user email and return the token', async () => {
      const result = await userModel.resetPasswordToken(userData.email);
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
      await userModel.resetPasswordToken(userData.email, session);
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
    let token;

    // before hook create a new user object and get the user id and generate a reset password token
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
      token = await userModel.resetPasswordToken(userData.email);
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
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for update the user password with the userId and the new password and return the message Password updated successfully
    it('update the user password with the userId and the new password and return the message Password updated', async () => {
      const result = await userModel.updatePassword(userId, '123newPassword');
      // check if the result is correct
      expect(result).to.equal('Password updated successfully');
      // check if the user password is updated
      const user = await userModel.user.findOne({ _id: userId });
      const match = await bcrypt.compare('123newPassword', user.password);
      expect(match).to.equal(true);
    });

    // Test case for update the user password with invalid id and throw an error 'User not found'
    it('update the user password with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.updatePassword('621f7b9e6f3b7d1d9e9f9d5b', '123newPassword');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
      // check if the user password is not updated
      const user = await userModel.user.findOne({ _id: userId });
      const match = await bcrypt.compare(userData.password, user.password);
      expect(match).to.equal(true);
    });

    // Test case for update the user password with the userId and the new password through session and in successful transaction
    it('update the user password with the userId and the new password through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // update the user password in a transaction with the session
      await userModel.updatePassword(userId, '123newPassword', session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user password is updated
      const user = await userModel.user.findOne({ _id: userId });
      const match = await bcrypt.compare('123newPassword', user.password);
      expect(match).to.equal(true);
    });

    // Test case for update the user password with invalid id through session and in failed transaction
    it('update the user password with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // update the user password with invalid id in a transaction with the session
        await userModel.updatePassword(userId, '123newPassword', session);
        await userModel.updatePassword('621f7b9e6f3b7d1d9e9f9d5b', '123newPassword', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user password is not updated
      const user = await userModel.user.findOne({ _id: userId });
      const match = await bcrypt.compare(userData.password, user.password);
      expect(match).to.equal(true);
    });
  });


  // Test suite for the addCourseToEnrolledList method with all scenarios
  describe("Test suite for AddCourseToEnrolledList method", () => {
    let courseId, paymentId;

    // before hook create a new user object and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
      courseId = '60b8d295f8d9f3608c8d9f66';
      paymentId = '60b8d295f8d9f3608c8d9f67';
    });

    // Test case for add a course to the enrolled list of the user and return the course object data
    it('AddCourseToEnrolledList method add a course to the enrolled list of the user', async () => {
      const result = await userModel.addCourseToEnrolledList(userId, courseId, paymentId);
      // check if the result is correct
      expect(String(result)).to.equal(String(courseId));
      // check if the course is added to the enrolled list
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.enrolled.length).to.equal(1);
    });

    // Test case for add a course to the enrolled list of the user with invalid id and throw an error 'User not found'
    it('add a course to the enrolled list of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.addCourseToEnrolledList('621f7b9e6f3b7d1d9e9f9d5b', courseId, paymentId);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
      // check if the course is not added to the enrolled list
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.enrolled.length).to.equal(0);
    });

    // Test case for add a course to the enrolled list of the user through session and in successful transaction
    it('add a course to the enrolled list of the user through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // add a course to the enrolled list in a transaction with the session
      await userModel.addCourseToEnrolledList(userId, courseId, paymentId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course is added to the enrolled list
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.enrolled.length).to.equal(1);
    });

    // Test case for add a course to the enrolled list of the user with invalid id through session and in failed transaction
    it('add a course to the enrolled list of the user with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // add a course with invalid id to the enrolled list
        await userModel.addCourseToEnrolledList('621f7b9e6f3b7d1d9e9f9d5b', courseId, paymentId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not added to the enrolled list
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.enrolled.length).to.equal(0);
    });
  });


  // Test suite for updateCourseProgress method with all scenarios
  describe("Test suite for UpdateCourseProgress method", () => {
    let courseId;

    // before hook create a new user object and get the user id and add a course to the enrolled list
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
      courseId = '60b8d295f8d9f3608c8d9f66';
      await userModel.addCourseToEnrolledList(userId, courseId, '60b8d295f8d9f3608c8d9f67');
    });

    // Test case for update the course progress of the user successfully and return the new progress
    it('update the course progress of the user successfully and return the new progress', async () => {
      const result = await userModel.updateCourseProgress(userId, courseId, 10);
      // check if the result is correct
      expect(result).to.be.a('number');
      expect(result).to.equal(10);
    });

    // Test case for update the course progress of the user with invalid id and throw an error 'User not found'
    it('update the course progress of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.updateCourseProgress('621f7b9e6f3b7d1d9e9f9d5b', courseId, 10);
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
      await userModel.updateCourseProgress(userId, courseId, 50, session);
      await userModel.updateCourseProgress(userId, courseId, 10, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course progress is updated
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.enrolled[0].progress).to.equal(60);
    });

    // Test case for update the course progress of the user with invalid id through session and in failed transaction
    it('update the course progress of the user with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // update the course progress with invalid id in a transaction with the session
        await userModel.updateCourseProgress(userId, courseId, 50, session);
        await userModel.updateCourseProgress('621f7b9e6f3b7d1d9e9f9d5b', courseId, 10, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course progress is not updated
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.enrolled[0].progress).to.equal(0);
    });
  });


  // Test suite for the addCourseToWishlistorCreatedList method with all scenarios
  describe("Test suite for AddCourseToWishlistorCreatedList method", () => {
    let instructorId, courseId;

    // before hook create a new learner and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
      courseId = '60b8d295f8d9f3608c8d9f50';
      const instructorData = { ...userData, userName: 'instructor', email: 'ins@gmail.com', roles: ['instructor'] };
      const result2 = await userModel.createUser(instructorData);
      instructorId = result2._id;
    });

    // Test case for add a course to the wishlist of the learner user and return the message 'Course added to wishlist successfully'
    it('add a course to the wishlist of the learner user and return the message "Course added to wishlist successfully"', async () => {
      const result = await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', courseId);
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course added to wishList successfully');
      // check if the course is added to the wishlist
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.wishList.length).to.equal(1);
    });

    // Test case for add a course to the createdList of instructor and return the message 'Course added to createdList successfully'
    it('add a course to the createdList of instructor and return the message "Course added to createdList successfully"', async () => {
      const result = await userModel.addCourseToWishlistorCreatedList(instructorId, 'createdList', courseId);
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course added to createdList successfully');
      // check if the course is added to the createdList
      const user = await userModel.user.findOne({ _id: instructorId });
      expect(user.createdList.length).to.equal(1);
    });

    // Test case for add a course to the wishlist with instructor id and throw an error 'User is not a learner'
    it('add a course to the wishlist with instructor id and throw an error "User is not a learner"', async () => {
      try {
        await userModel.addCourseToWishlistorCreatedList(instructorId, 'wishList', courseId);
      }
      catch (error) {
        expect(error.message).to.equal('User is not a learner');
      }
      // check if the course is not added to the wishlist
      const user = await userModel.user.findOne({ _id: instructorId });
      expect(user.wishList.length).to.equal(0);
    });

    // Test case for add a course to the createdList with learner id and throw an error 'User is not an instructor'
    it('add a course to the createdList with learner id and throw an error "User is not an instructor"', async () => {
      try {
        await userModel.addCourseToWishlistorCreatedList(userId, 'createdList', courseId);
      }
      catch (error) {
        expect(error.message).to.equal('User is not an instructor');
      }
      // check if the course is not added to the createdList
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.createdList.length).to.equal(0);
    });

    // Test case for add a course to the wishlist of the user with invalid id and throw an error 'User not found'
    it('add a course to the wishlist of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.addCourseToWishlistorCreatedList('621f7b9e6f3b7d1d9e9f9d5b', 'wishList', courseId);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
      // check if the course is not added to the wishlist
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.wishList.length).to.equal(0);
    });

    // Test case for add a course through session and in successful transaction
    it('add a course through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // add a course to the wishlist of the user in a transaction with the session
      await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', courseId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course is added to the wishlist
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.wishList.length).to.equal(1);
    });

    // Test case for add a course with through session and in failed transaction
    it('add a course with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // add a course with invalid list type in a transaction with the session
        await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', courseId, session);
        await userModel.addCourseToWishlistorCreatedList(userId, 'createdList', courseId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User is not an instructor')
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not added to the wishlist
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.wishList.length).to.equal(0);
    });
  });


  // Test suite for the removeCourseFromList method with all scenarios
  describe("Test suite for RemoveCourseFromList method", () => {
    let instructorId, courseId;

    // before hook create a new learner and instructor user object, add a course to the wishlist, createdList and enrolled list
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
      courseId = '60b8d295f8d9f3608c8d9f50';
      const instructorData = { ...userData, userName: 'instructor', email: 'in@email.com', roles: ['instructor'] };
      const result2 = await userModel.createUser(instructorData);
      instructorId = result2._id;

      await userModel.addCourseToWishlistorCreatedList(userId, 'wishList', courseId);
      await userModel.addCourseToWishlistorCreatedList(instructorId, 'createdList', courseId);
      await userModel.addCourseToEnrolledList(userId, courseId, '60b8d295f8d9f3608c8d9f67');
    });

    // Test case for remove a course from the wishlist of the learner user and return the message 'Course removed from wishList'
    it('remove a course from the wishlist of the learner user and return the message "Course removed from wishlist"', async () => {
      const result = await userModel.removeCourseFromList(userId, 'wishList', courseId);
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course removed from wishList');
      // check if the course is removed from the wishlist
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.wishList.length).to.equal(0);
    });

    // Test case for remove a course from wishlist of the instructor user and return the message 'User is not a learner'
    it('remove a course from wishlist of the instructor user and return the message "User is not a learner"', async () => {
      try {
        await userModel.removeCourseFromList(instructorId, 'wishList', courseId);
      }
      catch (error) {
        expect(error.message).to.equal('User is not a learner');
      }
    });

    // Test case for remove a course from createdList of the instructor user and return the message 'Course removed from createdList'
    it('remove a course from createdList of the instructor user and return the message "Course removed from createdList"', async () => {
      const result = await userModel.removeCourseFromList(instructorId, 'createdList', courseId);
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course removed from createdList');
      // check if the course is removed from the createdList
      const user = await userModel.user.findOne({ _id: instructorId });
      expect(user.createdList.length).to.equal(0);
    });

    // Test case for remove a course from createdList of the learner user and return the message 'User is not an instructor'
    it('remove a course from createdList of the learner user and return the message "User is not an instructor"', async () => {
      try {
        await userModel.removeCourseFromList(userId, 'createdList', courseId);
      }
      catch (error) {
        expect(error.message).to.equal('User is not an instructor');
      }
    });

    // Test case for remove a course from the enrolled list of the learner and return the message 'Course removed from enrolled list'
    it('remove a course from the enrolled list of the learner and return the message "Course removed from enrolled list"', async () => {
      const result = await userModel.removeCourseFromList(userId, 'enrolled', courseId);
      // check if the result is correct
      expect(result).to.be.a('string');
      expect(result).to.equal('Course removed from enrolled');
      // check if the course is removed from the enrolled list
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.enrolled.length).to.equal(0);
    });

    // Test case for remove a course from the enrolled list of the instructor and return the message 'User is not a learner'
    it('remove a course from the enrolled list of the instructor and return the message "User is not a learner"', async () => {
      try {
        await userModel.removeCourseFromList(instructorId, 'enrolled', courseId);
      }
      catch (error) {
        expect(error.message).to.equal('User is not a learner');
      }
    });

    // Test case for remove a course from the wishlist of the user with invalid id and throw an error 'User not found'
    it('remove a course from the wishlist of the user with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.removeCourseFromList('621f7b9e6f3b7d1d9e9f9d5b', 'wishList', courseId);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
      // check if the course is not removed from the wishlist
      const user = await userModel.user.findOne({ _id: userId });
      expect(user.wishList.length).to.equal(1);
    });

    // Test case for remove a course through session and in successful transaction
    it('remove a course through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // remove a course from the wishlist in a transaction with the session
      await userModel.removeCourseFromList(userId, 'wishList', courseId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the course is removed from the wishlist
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.wishList.length).to.equal(0);
    });

    // Test case for remove a course with invalid id through session and in failed transaction
    it('remove a course with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // remove course in wishlist then remove a course with invalid id in a transaction with the session
        await userModel.removeCourseFromList(userId, 'wishList', courseId, session);
        await userModel.removeCourseFromList('621f7b9e6f3b7d1d9e9f9d5b', 'wishList', courseId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not removed from the wishlist
      const result = await userModel.user.findOne({ _id: userId });
      expect(result.wishList.length).to.equal(1);
    });
  });


  // Test suite for the deleteUserById method with all scenarios
  describe("DeleteUserById method", () => {

    // before hook create a new learner and get the user id
    beforeEach(async () => {
      const result = await userModel.createUser(userData);
      userId = result._id;
    });

    // Test case for delete a user by id with valid id and return the message 'User deleted successfully'
    it('delete a user by id with valid id and return the message "User deleted successfully"', async () => {
      const result = await userModel.deleteUserById(userId);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userName).to.equal(userData.userName);
      expect(result).not.to.have.property('password');
      expect(result).have.property('profileCompleted');
      // check if the user is deleted
      const count = await userModel.user.find({})
      expect(count.length).to.equal(0);
    });

    // Test case for delete a user by id with invalid id and throw an error 'User not found'
    it('delete a user by id with invalid id and throw an error "User not found"', async () => {
      try {
        await userModel.deleteUserById('621f7b9e6f3b7d1d9e9f9d5b');
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
      }
      // check if the user is not deleted
      const count = await userModel.user.find({})
      expect(count.length).to.equal(1);
    });

    // Test case for delete a user by id through session and in successful transaction
    it('delete a user by id through session and in successful transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      // delete the user in a transaction with the session
      await userModel.deleteUserById(userId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the user is deleted
      const count = await userModel.user.find({})
      expect(count.length).to.equal(0);
    });

    // Test case for delete a user by id with invalid id through session and in failed transaction
    it('delete a user by id with invalid id through session and in failed transaction', async () => {
      // create a session
      const session = await mongoDB.startSession();
      try {
        // delete the user with invalid id in a transaction with the session
        await userModel.deleteUserById(userId, session);
        await userModel.deleteUserById('621f7b9e6f3b7d1d9e9f9d5b', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('User not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the user is not deleted
      const count = await userModel.user.find({})
      expect(count.length).to.equal(1);
    });
  });

}).timeout(15000);