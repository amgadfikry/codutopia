import mongoDB, { courseModel, userModel, reviewModel, lessonModel, lessonContentModel, quizModel, paymentModel }
  from "../../databases/mongoDB.js";
import oracleStorage from "../../oracleStorage/oracleStorage.js";
import emailUtils from "../../utils/emailUtils.js";
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




}).timeout(5000);
