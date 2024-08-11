import mongoDB, { courseModel, userModel, reviewModel, lessonModel, lessonContentModel, quizModel, paymentModel }
  from "../../databases/mongoDB.js";
import oracleStorage from "../../oracleStorage/oracleStorage.js";
import emailUtils from "../../utils/emailUtils.js";
import jwtToken from '../../utils/jwtToken.js';
import * as userService from "../../services/userService.js";
import sinon from "sinon";
import { expect } from "chai";


// Test suite for userService functions
describe('userService', () => {
  // variables for user data, return data
  let userData;
  let returnData;

  // beforeEach hook to create user data and mock all transactions methods
  beforeEach(() => {
    // Create user data
    userData = {
      userName: 'testUser',
      email: 'test@gmail.com',
      password: 'testPassword',
    };
    // Create return data
    returnData = {
      ...userData,
      _id: '56cb91bdc3464f14678934ca',
      confirmed: false,
      roles: ['learner'],
      firstName: null,
      lastName: null,
      phoneNumber: null,
      address: null,
      avatar: null,
      enrolled: [],
      wishList: [],
      createdList: [],
    };
    // Mock the startSession, commitTransaction, and abortTransaction functions
    sinon.stub(mongoDB, "startSession").returns('session');
    sinon.stub(mongoDB, "commitTransaction").returns('commit');
    sinon.stub(mongoDB, "abortTransaction").returns('abort');
  });

  // afterEach hook to restore all stubs
  afterEach(() => {
    sinon.restore();
  });


  // Test suite for register function
  describe('register', () => {
    let createUserStub;
    let generateConfirmationTokenStub;
    let sendConfirmationEmailStub;
    let getUserByFieldStub;
    let addNewRoleStub;

    // beforeEach hook to mock createUser, generateConfirmationToken, and sendConfirmationEmail functions
    beforeEach(() => {
      // Mock the createUser, generateConfirmationToken, and sendConfirmationEmail functions
      createUserStub = sinon.stub(userModel, "createUser").returns(returnData);
      generateConfirmationTokenStub = sinon.stub(userModel, "generateConfirmationToken").returns(123456);
      sendConfirmationEmailStub = sinon.stub(emailUtils, "sendConfirmationEmail").returns('email');
      getUserByFieldStub = sinon.stub(userModel, "getUserByField").returns(returnData);
      addNewRoleStub = sinon.stub(userModel, "addNewRole").returns('added');
    });

    // Test case for create user successfully with valid data not existing user and all methods called correctly
    it('create user successfully with valid data not existing user and all methods called correctly', async () => {
      // Call the register function
      const result = await userService.register(userData);
      // Verify that all methods were called correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
      expect(userModel.generateConfirmationToken.calledOnceWith(returnData._id, 'session')).to.be.true;
      expect(emailUtils.sendConfirmationEmail.calledOnceWith(returnData.userName, 123456, returnData.email)).to.be.true;
      expect(userModel.getUserByField.notCalled).to.be.true;
      expect(userModel.addNewRole.notCalled).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      // Verify the result
      expect(result).to.equal('User created. Please check your email to confirm your account.');
    });

    // Test case for create user successfully with valid data existing user and same role and errorin createUser function 
    it('create user successfully with valid data existing user and same role and all methods called correctly', async () => {
      // Change the createUser function to throw an error with message 'User already exists'
      createUserStub.throws(new Error('User already exists'));
      // add roles field to userData object with value ['learner']
      userData.roles = ['learner'];
      // Call the register function
      try {
        await userService.register(userData);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
        expect(userModel.generateConfirmationToken.notCalled).to.be.true;
        expect(emailUtils.sendConfirmationEmail.notCalled).to.be.true;
        expect(userModel.getUserByField.calledOnceWith({ email: userData.email }, 'session')).to.be.true;
        expect(userModel.addNewRole.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the result
        expect(error.message).to.equal('User already exists');
      }
    });

    // Test case for create user successfully with valid data existing user and different role and error in createUser function
    it('create user successfully with valid data existing user and different role and all methods called correctly', async () => {
      // Change the createUser function to throw an error with message 'User already exists'
      createUserStub.throws(new Error('User already exists'));
      // add roles field to userData object with value ['instructor']
      userData.roles = ['instructor'];
      // Call the register function
      const result = await userService.register(userData);
      // Verify that all methods were called correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
      expect(userModel.generateConfirmationToken.notCalled).to.be.true;
      expect(emailUtils.sendConfirmationEmail.notCalled).to.be.true;
      expect(userModel.getUserByField.calledOnceWith({ email: userData.email }, 'session')).to.be.true;
      expect(userModel.addNewRole.calledOnceWith(returnData._id, userData.roles[0], 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // Verify the result
      expect(result).to.equal('User Account updated with the new role.');
    });

    // Test case for create user successfully with valid data existing user and different role and error in addNewRole function
    it('create user successfully with valid data existing user and different role and error in addNewRole function', async () => {
      // Change the addNewRole function to throw an error with message 'Role adding error'
      createUserStub.throws(new Error('User already exists'));
      addNewRoleStub.throws(new Error('Role adding error'));
      // add roles field to userData object with value ['instructor']
      userData.roles = ['instructor'];
      // Call the register function
      try {
        await userService.register(userData);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
        expect(userModel.generateConfirmationToken.notCalled).to.be.true;
        expect(emailUtils.sendConfirmationEmail.notCalled).to.be.true;
        expect(userModel.getUserByField.calledOnceWith({ email: userData.email }, 'session')).to.be.true;
        expect(userModel.addNewRole.calledOnceWith(returnData._id, userData.roles[0], 'session')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the error
        expect(error.message).to.equal('Role adding error');
      }
    });

    // Test case for create user successfully with valid data existing user and different role and error in getUserByField function
    it('create user successfully with valid data existing user and different role and error in getUserByField function', async () => {
      // Change the getUserByField function to throw an error with message 'User not found'
      createUserStub.throws(new Error('User already exists'));
      getUserByFieldStub.throws(new Error('User not found'));
      // add roles field to userData object with value ['instructor']
      userData.roles = ['instructor'];
      // Call the register function
      try {
        await userService.register(userData);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
        expect(userModel.generateConfirmationToken.notCalled).to.be.true;
        expect(emailUtils.sendConfirmationEmail.notCalled).to.be.true;
        expect(userModel.getUserByField.calledOnceWith({ email: userData.email }, 'session')).to.be.true;
        expect(userModel.addNewRole.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the error
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for create user with an error in createUser function and throw an error
    it('create user with an error in createUser function and throw an error', async () => {
      // Change the createUser function to throw an error
      createUserStub.throws(new Error('Missing data'));
      try {
        // Call the register function
        await userService.register(userData);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
        expect(userModel.generateConfirmationToken.notCalled).to.be.true;
        expect(emailUtils.sendConfirmationEmail.notCalled).to.be.true;
        expect(userModel.getUserByField.notCalled).to.be.true;
        expect(userModel.addNewRole.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the error
        expect(error.message).to.equal('Missing data');
      }
    });

    // Test case for create user with an error in generateConfirmationToken function and throw an error
    it('create user with an error in generateConfirmationToken function and throw an error', async () => {
      // Change the generateConfirmationToken function to throw an error
      generateConfirmationTokenStub.throws(new Error('Token generation error'));
      try {
        // Call the register function
        await userService.register(userData);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
        expect(userModel.generateConfirmationToken.calledOnceWith(returnData._id, 'session')).to.be.true;
        expect(emailUtils.sendConfirmationEmail.notCalled).to.be.true;
        expect(userModel.getUserByField.notCalled).to.be.true;
        expect(userModel.addNewRole.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the error
        expect(error.message).to.equal('Token generation error');
      }
    });

    // Test case for create user with an error in sendConfirmationEmail function and throw an error
    it('create user with an error in sendConfirmationEmail function and throw an error', async () => {
      // Change the sendConfirmationEmail function to throw an error
      sendConfirmationEmailStub.throws(new Error('Email sending error'));
      try {
        // Call the register function
        await userService.register(userData);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.createUser.calledOnceWith(userData, 'session')).to.be.true;
        expect(userModel.generateConfirmationToken.calledOnceWith(returnData._id, 'session')).to.be.true;
        expect(emailUtils.sendConfirmationEmail.calledOnceWith(returnData.userName, 123456, returnData.email)).to.be.true;
        expect(userModel.getUserByField.notCalled).to.be.true;
        expect(userModel.addNewRole.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the error
        expect(error.message).to.equal('Email sending error');
      }
    });
  });


  // Test suite for confirmUser function
  describe('confirmUser', () => {

    // Test case for confirm user account successfully with valid data and all methods called correctly
    it('confirm user account successfully with valid data and all methods called correctly', async () => {
      // Mock the confirmUser function
      sinon.stub(userModel, "confirmUser").returns('confirmed');
      // Call the confirmUser function
      const result = await userService.confirmUser(returnData._id, 123456);
      // Verify that all methods were called correctly
      expect(userModel.confirmUser.calledOnceWith(returnData._id, 123456)).to.be.true;
      // Verify the result
      expect(result).to.equal('User account confirmed.');
    });

    // Test case for confirm user account with an error in confirmUser function and throw an error
    it('confirm user account with an error in confirmUser function and throw an error', async () => {
      // Mock the confirmUser function
      sinon.stub(userModel, "confirmUser").throws(new Error('Confirmation error'));
      try {
        // Call the confirmUser function
        await userService.confirmUser(returnData._id, 123456);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(userModel.confirmUser.calledOnceWith(returnData._id, 123456)).to.be.true;
        // Verify the error
        expect(error.message).to.equal('Confirmation error');
      }
    });
  });


  // Test suite for login function
  describe('login', () => {
    let checkUserPasswordStub;
    let generateTokenStub;

    // beforeEach hook to mock checkUserPassword and generateToken functions
    beforeEach(() => {
      // Mock the checkUserPassword and generateToken functions
      checkUserPasswordStub = sinon.stub(userModel, "checkUserPassword").returns(returnData);
      generateTokenStub = sinon.stub(jwtToken, "generateToken").returns('token');
    });

    // Test case for login successfully with valid data and all methods called correctly and remember me flag is false
    it('login successfully with valid data and all methods called correctly and remember me flag is false', async () => {
      // Call the login function
      const result = await userService.login(returnData.email, 'testPassword', 'learner', false);
      // Verify that all methods were called correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(userModel.checkUserPassword.calledOnceWith(returnData.email, 'testPassword', 'session')).to.be.true;
      expect(jwtToken.generateToken.calledOnceWith({ userId: returnData._id, role: 'learner' }, '1d')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // Verify the result
      expect(result).to.equal('token');
    });

    // Test case for login successfully with valid data and all methods called correctly and remember me flag is true
    it('login successfully with valid data and all methods called correctly and remember me flag is true', async () => {
      // Call the login function
      const result = await userService.login(returnData.email, 'testPassword', 'learner', true);
      // Verify that all methods were called correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(userModel.checkUserPassword.calledOnceWith(returnData.email, 'testPassword', 'session')).to.be.true;
      expect(jwtToken.generateToken.calledOnceWith({ userId: returnData._id, role: 'learner' }, '7d')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // Verify the result
      expect(result).to.equal('token');
    });

    // Test case for login with an error in checkUserPassword function and throw an error
    it('login with an error in checkUserPassword function and throw an error', async () => {
      // Change the checkUserPassword function to throw an error
      checkUserPasswordStub.throws(new Error('User not found'));
      try {
        // Call the login function
        await userService.login(returnData.email, 'testPassword', 'learner', false);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.checkUserPassword.calledOnceWith(returnData.email, 'testPassword', 'session')).to.be.true;
        expect(jwtToken.generateToken.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the error
        expect(error.message).to.equal('User not found');
      }
    });

    // Test case for login with an error in generateToken function and throw an error
    it('login with an error in generateToken function and throw an error', async () => {
      // Change the generateToken function to throw an error
      generateTokenStub.throws(new Error('Token generation error'));
      try {
        // Call the login function
        await userService.login(returnData.email, 'testPassword', 'learner', false);
      } catch (error) {
        // Verify that all methods were called correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(userModel.checkUserPassword.calledOnceWith(returnData.email, 'testPassword', 'session')).to.be.true;
        expect(jwtToken.generateToken.calledOnceWith({ userId: returnData._id, role: 'learner' }, '1d')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Verify the error
        expect(error.message).to.equal('Token generation error');
      }
    });
  });

}).timeout(5000);
