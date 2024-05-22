import { expect } from "chai";
import { userModel } from "../../databases/mongoDB.js";

// Test suite for the User Model in the database mongoDB
describe("User Model in mongoDB", () => {
  let user;
  let userId;
  let token;
  let invalidId;
  let course;

  // before running any tests prepare data uses for the tests
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
  });

  // after finish all tests empty users collection
  after(async () => {
    // delete all users from the users collection
    await userModel.user.deleteMany({});
  });


  // Test suite for the createUser method in the User Model
  describe("CreateUser method", () => {
    // Test case for create a new user with only required fields
    it('CreateUser method create a new user with only required fields', async () => {
      // call the createUser method with the user object data
      const result = await userModel.createUser(user);
      // check if the result is not null
      expect(result).to.not.equal(null);
      // set the userId to the result _id
      userId = result;
    });

    // Test case for create a user with the same userName
    it('CreateUser method not create a user with the same userName', async () => {
      try {
        // call the createUser method with the user object data
        await userModel.createUser(user);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User already exists');
      }
    });

    // Test case for create a user with the same email
    it('CreateUser method not create a user with the same email', async () => {
      try {
        // create a new user object with the same email
        const newUser = {
          userName: "newLearner",
          email: user.email,
          password: "123newLearner",
        }
        // call the createUser method with the new user object data
        await userModel.createUser(newUser);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User already exists');
      }
    });

    // Test case for create a user with missing email required fields
    it('CreateUser method not create a user with email missing required fields', async () => {
      try {
        // create a new user object with missing email required fields
        const newUser = {
          userName: "newLearner",
          password: "123"
        }
        // call the createUser method with the new user object data
        await userModel.createUser(newUser);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Missing email field');
      }
    });

    // Test case for create a user with missing userName required fields
    it('CreateUser method not create a user with userName missing required fields', async () => {
      try {
        // create a new user object with missing userName required fields
        const newUser = {
          email: user.email,
          password: "123"
        }
        // call the createUser method with the new user object data
        await userModel.createUser(newUser);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Missing userName field');
      }
    });

    // Test case for create a user with data not in schema of the user collection
    it('CreateUser method not create a user with data not in schema of the user collection', async () => {
      try {
        // create a new user object with data not in schema of the user collection
        const newUser = { ...user, invalid: 'invalidField' }
        // call the createUser method with the new user object data
        await userModel.createUser(newUser);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Fields not in schema: invalid');
      }
    });
  });


  // Test suite for the getUserById method in the User Model
  describe("GetUserById method", () => {
    // Test case for get a user by id that exists
    it('GetUserById method get a user by id that exists', async () => {
      // call the getUserById method with the userId
      const result = await userModel.getUserById(userId);
      // check if the result is an object
      expect(result).to.be.an('object');
      // check if the result has the userName, and email properties
      expect(result).to.have.property('userName');
      expect(result).to.have.property('email');
      // check if the result has the correct userName, email, and roles values
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      // check if the result has the profileCompleted property and value
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(40);
      // check password is undefined
      expect(result.password).to.equal(undefined);
    });

    // Test case for get a user by id that does not exist
    it('GetUserById method not get a user by id that does not exist', async () => {
      try {
        // call the getUserById method with an invalid userId
        await userModel.getUserById(invalidId);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for the getUserByField method in the User Model
  describe("GetUserByField method", () => {
    // Test case for get a user by userName that exists
    it('GetUserByField method get a user by userName that exists', async () => {
      // call the getUserByField method with the userName
      const result = await userModel.getUserByField({ userName: user.userName });
      // check if the result is an object
      expect(result).to.be.an('object');
      // check if the result has the userName, and email properties
      expect(result).to.have.property('userName');
      expect(result).to.have.property('email');
      // check if the result has the correct userName, email, and roles values
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      // check if the result has the profileCompleted property and value
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(40);
      // check password is undefined
      expect(result.password).to.equal(undefined);
    });

    // Test case for get a user by email that exists
    it('GetUserByField method get a user by email that exists', async () => {
      // call the getUserByField method with the email
      const result = await userModel.getUserByField({ email: user.email });
      // check if the result is an object
      expect(result).to.be.an('object');
      // check if the result has the userName, and email properties
      expect(result).to.have.property('userName');
      expect(result).to.have.property('email');
      // check if the result has the correct userName, email, and roles values
      expect(result.userName).to.equal(user.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      // check if the result has the profileCompleted property and value
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(40);
      // check password is undefined
      expect(result.password).to.equal(undefined);
    });

    // Test case for get a user by field that does not exist
    it('GetUserByField method not get a user by field that does not exist', async () => {
      try {
        // call the getUserByField method with an invalid field
        await userModel.getUserByField({ invalid: 'invalidField' });
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for get a user by userName that does not exist
    it('GetUserByField method not get a user by userName that does not exist', async () => {
      try {
        // call the getUserByField method with a userName that does not exist
        const result = await userModel.getUserByField({ userName: 'invalidUserName' });
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for the countRoleUsers method in the User Model
  describe("CountRoleUsers method", () => {
    // Test case for count the number of users with a role 'learner'
    it('CountRoleUsers method count the number of users with a role "learner"', async () => {
      // call the countRoleUsers method with the role 'learner'
      const result = await userModel.countRoleUsers('learner');
      // check if the result is a number
      expect(result).to.be.a('number');
      // check if the result is 1
      expect(result).to.equal(1);
    });

    // Test case for count the number of users with a role 'instructor'
    it('CountRoleUsers method count the number of users with a role "instructor"', async () => {
      // call the countRoleUsers method with the role 'instructor'
      const result = await userModel.countRoleUsers('instructor');
      // check if the result is a number
      expect(result).to.be.a('number');
      // check if the result is 0
      expect(result).to.equal(0);
    });

    // Test case for count the number of users with a role not exist
    it('CountRoleUsers method count the number of users with a role not exist', async () => {
      try {
        // call the countRoleUsers method with the role 'invalidRole'
        await userModel.countRoleUsers('invalidRole');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Invalid role');
      }
    });
  });


  // Test suite for the updateUserById method in the User Model
  describe("UpdateUserById method", () => {
    // Test case for update a user by id with new data
    it('UpdateUserById method update a user by id with new data', async () => {
      // create a new user object with new data
      const newUser = {
        phoneNumber: '1234567890',
        userName: 'newLearner',
      }
      // call the updateUserById method with the userId and the new user object data 
      const result = await userModel.updateUserById(userId, newUser);
      // check if the result is an object
      expect(result).to.be.an('object');
      // check if the result has the correct userName, email, phoneNumber, and roles values
      expect(result.userName).to.equal(newUser.userName);
      expect(result.email).to.equal(user.email);
      expect(result.roles[0]).to.equal('learner');
      expect(result.phoneNumber).to.equal(newUser.phoneNumber);
      // update the user object with the new data
      user.userName = newUser.userName;
      // check password is undefined
      expect(result.password).to.equal(undefined);
      // check if the result has the profileCompleted property and value
      expect(result).to.have.property('profileCompleted');
      expect(result.profileCompleted).to.equal(50);
    });

    // Test case for update a user by id with invalid id
    it('UpdateUserById method not update a user by id with invalid id', async () => {
      try {
        // call the updateUserById method with an invalid userId
        await userModel.updateUserById(invalidId, { userName: 'newLearner' });
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for update a user by id with invalid data
    it('UpdateUserById method not update a user by id with invalid data', async () => {
      try {
        // call the updateUserById method with invalid data
        await userModel.updateUserById(userId, { invalid: 'invalidData', invalid2: 'invalidData2' });
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Fields not in schema: invalid, invalid2');
      }
    });
  });


  // Test suite for the confimUser method in the User Model
  describe("ConfimUser method", () => {
    // Test case for confirm a user by id
    it('ConfimUser method confirm a user by id', async () => {
      // call the confimUser method with the userId
      const result = await userModel.confimUser(userId);
      // check if the result is true
      expect(result).to.equal(true);
    });

    // Test case for confirm a user by id with invalid id
    it('ConfimUser method not confirm a user by id with invalid id', async () => {
      try {
        // call the confimUser method with an invalid userId
        await userModel.confimUser('invalidUserId');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for the addNewRole method in the User Model
  describe("AddNewRole method", () => {
    // Test case for add a new role to a user by id
    it('AddNewRole method add a new role to a user by id', async () => {
      // call the addNewRole method with the userId and the role 'instructor'
      const result = await userModel.addNewRole(userId, 'instructor');
      // check if the result is array
      expect(result).to.be.an('array');
      // check if the result has the correct roles values
      expect(result).to.have.lengthOf(2);
      expect(result).deep.equal(['learner', 'instructor']);
      // update the user object with the new role
      user.roles = result;
    });

    // Test case if the role is already exist
    it('AddNewRole method not add a new role to a user by id if the role is already exist', async () => {
      const result = await userModel.addNewRole(userId, 'instructor');
      // check if the result is array
      expect(result).to.be.an('array');
      // check if the result has the correct roles values
      expect(result).to.have.lengthOf(2);
      expect(result).deep.equal(['learner', 'instructor']);
    });

    // Test case for add a new role to a user by id with invalid id
    it('AddNewRole method not add a new role to a user by id with invalid id', async () => {
      try {
        // call the addNewRole method with an invalid userId and the role 'instructor'
        await userModel.addNewRole('invalidUserId', 'instructor');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for add a new role to a user by id with invalid role
    it('AddNewRole method not add a new role to a user by id with invalid role', async () => {
      try {
        // call the addNewRole method with the userId and the role 'invalidRole'
        await userModel.addNewRole(userId, 'invalidRole');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Invalid role');
      }
    });
  });


  // Test suite for the checkUserPassword method in the User Model
  describe("CheckUserPassword method", () => {
    // Test case for check the user password is correct
    it('CheckUserPassword method check the user password is correct', async () => {
      // call the checkUserPassword method with the user email and password
      const result = await userModel.checkUserPassword(user.email, user.password);
      // check if the result user id is equal to the userId
      expect(result.toString()).to.equal(userId.toString());
    });

    // Test case for check the user password is incorrect
    it('CheckUserPassword method check the user password is incorrect', async () => {
      try {
        // call the checkUserPassword method with the user email and an incorrect password
        await userModel.checkUserPassword(user.email, 'incorrectPassword');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Password is incorrect');
      }
    });

    // Test case for check the user password with invalid email
    it('CheckUserPassword method not check the user password with invalid email', async () => {
      try {
        // call the checkUserPassword method with an invalid email and password
        await userModel.checkUserPassword('invalidEmail', user.password);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for the resetPasswordToken method in the User Model
  describe("ResetPasswordToken method", () => {
    // Test case for reset the user password token
    it('ResetPasswordToken method reset the user password token', async () => {
      // call the resetPasswordToken method with the user email
      const result = await userModel.resetPasswordToken(user.email);
      // check if the result is a string
      expect(result).to.be.a('string');
      // set the token to the result
      token = result;
    });

    // Test case for reset the user password token with invalid email
    it('ResetPasswordToken method not reset the user password token with invalid email', async () => {
      try {
        // call the resetPasswordToken method with an invalid email
        await userModel.resetPasswordToken('invalidEmail');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for the verifyByToken method in the User Model
  describe("VerifyByToken method", () => {
    // Test case for verify the reset password token
    it('VerifyByToken method verify the reset password token', async () => {
      // call the verifyByToken method with the token
      const result = await userModel.verifyByToken(token);
      // expect the result to be object
      expect(result).to.be.an('object');
      // check if the result is userId
      expect(result.toString()).to.equal(userId.toString());
    });

    // Test case for verify the reset password token with invalid token
    it('VerifyByToken method not verify the reset password token with invalid token', async () => {
      try {
        // call the verifyByToken method with an invalid token
        await userModel.verifyByToken('invalidToken');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('Token is invalid or expired');
      }
    });
  });


  // Test suite for the updatePassword method in the User Model
  describe("UpdatePassword method", () => {
    // Test case for update the user password
    it('UpdatePassword method update the user password', async () => {
      // call the updatePassword method with the userId and the new password
      user.password = '123newPassword';
      const result = await userModel.updatePassword(userId, user.password);
      // check if the result is a string with the expected message
      expect(result).to.equal('Password updated');
    });

    // Test case for update the user password with invalid id
    it('UpdatePassword method not update the user password with invalid id', async () => {
      try {
        // call the updatePassword method with an invalid userId and the new password
        await userModel.updatePassword('invalidUserId', user.password);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });

    // test case for check the user password is correct after update
    it('CheckUserPassword method check the user password is correct after update', async () => {
      // call the checkUserPassword method with the user email and new password
      const result = await userModel.checkUserPassword(user.email, user.password);
      // check if the result user id is equal to the userId
      expect(result.toString()).to.equal(userId.toString());
    });
  });


  // Test suite for the addCourseToEnrolledList method in the User Model
  describe("AddCourseToEnrolledList method", () => {
    // Test case for add a course to the enrolled list of the user
    it('AddCourseToEnrolledList method add a course to the enrolled list of the user', async () => {
      // call the addCourseToEnrolledList method with the userId and the course object data
      const result = await userModel.addCourseToEnrolledList(userId, course.courseId, course.paymentId);
      // check if the result is an array
      expect(result).to.be.an('object');
      // check if the result has the correct courseId and paymentId values
      expect(result.courseId).to.equal(course.courseId);
      expect(result.paymentId).to.equal(course.paymentId);
      // check if the result has the progress, createdAt, and updatedAt properties
      expect(result).to.have.property('progress');
      expect(result).to.have.property('createdAt');
      expect(result).to.have.property('updatedAt');
      // check if the result has the correct progress value
      expect(result.progress).to.equal(0);
    });

    // Test case for add a course to the enrolled list of the user with invalid id
    it('AddCourseToEnrolledList method not add a course to the enrolled list of the user with invalid id', async () => {
      try {
        // call the addCourseToEnrolledList method with an invalid userId and the course object data
        await userModel.addCourseToEnrolledList('invalidUserId', course);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for updateCourseProgress method in the User Model
  describe("UpdateCourseProgress method", () => {
    // Test case for update the course progress of the user
    it('UpdateCourseProgress method update the course progress of the user', async () => {
      // call the updateCourseProgress method with the userId, courseId, and the progress
      const result = await userModel.updateCourseProgress(userId, course.courseId, 10);
      // check if the result is an number
      expect(result).to.be.a('number');
      // check if the result is 10
      expect(result).to.equal(10);
      // update the course progress in the course object
      course.progress = result;
    });

    // Test case for update the course progress of the user with new progress
    it('UpdateCourseProgress method update the course progress of the user with new progress', async () => {
      // call the updateCourseProgress method with the userId, courseId, and the new progress
      const result = await userModel.updateCourseProgress(userId, course.courseId, 10);
      // check if the result is an number
      expect(result).to.be.a('number');
      // check if the result is 20
      expect(result).to.equal(20);
      // update the course progress in the course object
      course.progress = result;
    });

    // Test case for update the course progress of the user with invalid id
    it('UpdateCourseProgress method not update the course progress of the user with invalid id', async () => {
      try {
        // call the updateCourseProgress method with an invalid userId, courseId, and the progress
        await userModel.updateCourseProgress('invalidUserId', course.courseId, 50);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for the addCourseToWishlist method in the User Model
  describe("AddCourseToWishlist method", () => {
    // Test case for add a course to the wishlist of the user
    it('AddCourseToWishlist method add a course to the wishlist of the user', async () => {
      // call the addCourseToWishlist method with the userId and the courseId
      const result = await userModel.addCourseToWishlist(userId, course.courseId);
      // check if the result is string
      expect(result).to.be.a('string');
      // check if the result message is 'Course added to wishlist'
      expect(result).to.equal('Course added to wishlist');
    });

    // Test case for add a course to the wishlist of the user with invalid id
    it('AddCourseToWishlist method not add a course to the wishlist of the user with invalid id', async () => {
      try {
        // call the addCourseToWishlist method with an invalid userId and the courseId
        await userModel.addCourseToWishlist('invalidUserId', course.courseId);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test suite for the removeCourseFromWishlist method in the User Model
  describe("RemoveCourseFromWishlist method", () => {
    // Test case for remove a course from the wishlist of the user
    it('RemoveCourseFromWishlist method remove a course from the wishlist of the user', async () => {
      // call the removeCourseFromWishlist method with the userId and the courseId
      const result = await userModel.removeCourseFromWishlist(userId, course.courseId);
      // check if the result is string
      expect(result).to.be.a('string');
      // check if the result message is 'Course removed from wishlist'
      expect(result).to.equal('Course removed from list');
    });

    // Test case for remove a course from the wishlist removed before
    it('RemoveCourseFromWishlist method not remove a course from the wishlist removed before', async () => {
      // call the removeCourseFromWishlist method with the userId and the courseId
      const result = await userModel.removeCourseFromWishlist(userId, course.courseId);
      // check if the result is string
      expect(result).to.be.a('string');
      // check if the result message is 'Course removed from wishlist'
      expect(result).to.equal('Course removed from list');
    });

    // Test case for remove a course from the wishlist of the user with invalid id
    it('RemoveCourseFromWishlist method not remove a course from the wishlist of the user with invalid id', async () => {
      try {
        // call the removeCourseFromWishlist method with an invalid userId and the courseId
        await userModel.removeCourseFromWishlist('invalidUserId', course.courseId);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });


  // Test deleteUserById method in the User Model
  describe("DeleteUserById method", () => {
    // Test case for delete a user by id with invalid id
    it('DeleteUserById method not delete a user by id with invalid id', async () => {
      try {
        // call the deleteUserById method with an invalid userId
        await userModel.deleteUserById('invalidUserId');
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for delete a user by id
    it('DeleteUserById method delete a user by id', async () => {
      // call the deleteUserById method with the userId
      const result = await userModel.deleteUserById(userId);
      // check if the result is string
      expect(result).to.be.a('string');
      // check if the result message is 'User deleted'
      expect(result).to.equal('User deleted successfully');
    });

    // Test case for delete a user by id that deleted before
    it('DeleteUserById method not delete a user by id that deleted before', async () => {
      try {
        // call the deleteUserById method with the userId
        await userModel.deleteUserById(userId);
      } catch (error) {
        // check if the error message is the expected message
        expect(error.message).to.equal('User not found');
      }
    });
  });
});