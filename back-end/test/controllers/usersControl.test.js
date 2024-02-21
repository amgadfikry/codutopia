import UsersControl from '../../server/controllers/usersControl.js';
import mongoDB from '../../databases/mongoDB.js';
import redisDB from '../../databases/redisDB.js';
import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// Test suite for the UsersControl class
describe('Unittest of UsersControl methods', () => {
  let res;
  let req;

  // Create a response object before each test suite
  beforeEach(() => {
    res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      header: function (name, value) {
        this.header = { name, value };
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
      locals: {
        user: {
          id: '60f3e3e3e3e3e3e3e3e3e3e3',
          email: 'email',
          role: 'role'
        },
        token: 'token'
      }
    };
    req = {
      body: {
        email: 'email',
        password: 'password',
        role: 'user',
        userName: 'userName',
        list: ['one', 'two', 'three']
      }
    };
  });

  // Reset the stubs after each test
  afterEach(() => {
    sinon.restore();
  });

  // Test suite for the register method
  describe('Register method', () => {
    // Test case for register method when the user already exists
    it('when user already exists', async () => {
      sinon.stub(mongoDB, 'getOne').returns({ email: 'email' });
      await UsersControl.register(req, res);
      expect(res.statusCode).to.equal(409);
      expect(res.data).to.deep.equal({ msg: 'User already exists' });
    });
    // Test case for register method when the user does not exist
    it('when user does not exist', async () => {
      sinon.stub(mongoDB, 'getOne').returns(null);
      sinon.stub(mongoDB, 'addOne').returns('newUser');
      await UsersControl.register(req, res);
      expect(res.statusCode).to.equal(201);
      expect(res.data).to.deep.equal({ msg: 'User created successfully', userID: 'newUser' });
    });
    // Test case for register method when there is an internal server error
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await UsersControl.register(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the login method
  describe('Login method', () => {
    // Test case for login method when the user does not exist
    it('when user does not exist', async () => {
      sinon.stub(mongoDB, 'getOne').returns(null);
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.deep.equal({ msg: 'Invalid credentials' });
    });
    // Test case for login method when the password is invalid
    it('when password is invalid', async () => {
      sinon.stub(mongoDB, 'getOne').returns({ password: await bcrypt.hash('password1', 10) });
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.deep.equal({ msg: 'Invalid credentials' });
    });
    // Test case for login method when the password is valid
    it('when password is valid', async () => {
      sinon.stub(mongoDB, 'getOne').returns({ password: await bcrypt.hash('password', 10), _id: 'id', email: 'email', role: 'role' });
      sinon.stub(jwt, 'sign').returns('token');
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Login successful' });
      expect(res.header).to.have.property('name', 'Authorization');
    });
    // Test case for login method when there is an internal server error
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the logout method
  describe('Logout method', () => {
    // Test case for logout method when successful
    it('when successful', async () => {
      sinon.stub(redisDB, 'del').returns(1);
      await UsersControl.logout(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Logout successful' });
    });
    // Test case for logout method when there is an internal server error
    it('when there is an internal server error', async () => {
      sinon.stub(redisDB, 'del').throws();
      await UsersControl.logout(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the getUser method
  describe('GetUser method', () => {
    // Test case for getUser method when successful
    it('when successful', () => {
      UsersControl.getUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'User found', data: res.locals.user });
    });
  });

  // Test suite for the getUserDetails method
  describe('GetUserDetails method', () => {
    // Test case for getUserDetails method when successful
    it('when successful', async () => {
      sinon.stub(mongoDB, 'getOne').returns(req.body);
      await UsersControl.getUserDetails(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'User found', data: req.body });
    });
    // Test case for getUserDetails method when there is an internal server error
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await UsersControl.getUserDetails(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the updateUser method
  describe('UpdateUser method', () => {
    // Test case for updateUser method when successful
    it('when successful', async () => {
      sinon.stub(mongoDB, 'updateOne').returns('ok');
      sinon.stub(redisDB, 'setHashMulti').returns(1);
      await UsersControl.updateUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'User updated successfully' });
    });
    // Test case for updateUser method when there is an internal server error
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'updateOne').throws();
      await UsersControl.updateUser(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the updatePassword method
  describe('UpdatePassword method', () => {
    // Test case for updatePassword method when the new password is the same as the old password
    it('when the new password is the same as the old password', async () => {
      sinon.stub(mongoDB, 'getOne').returns({ password: await bcrypt.hash('password', 10) });
      await UsersControl.updatePassword(req, res);
      expect(res.statusCode).to.equal(409);
      expect(res.data).to.deep.equal({ msg: 'New password is the same as the old password' });
    });
    // Test case for updatePassword method when the new password is different from the old password
    it('when the new password is different from the old password', async () => {
      sinon.stub(mongoDB, 'getOne').returns({ password: await bcrypt.hash('password1', 10) });
      sinon.stub(mongoDB, 'updateOne').returns('ok');
      await UsersControl.updatePassword(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Password updated successfully' });
    });
    // Test case for updatePassword method when there is an internal server error
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await UsersControl.updatePassword(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the deleteUser method
  describe('DeleteUser method', () => {
    // Test case for deleteUser method when successful
    it('when successful', async () => {
      sinon.stub(mongoDB, 'deleteOne').returns('ok');
      sinon.stub(redisDB, 'del').returns(1);
      await UsersControl.deleteUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'User deleted successfully' });
    });
    // Test case for deleteUser method when there is an internal server error
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'deleteOne').throws();
      await UsersControl.deleteUser(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });
});
