import UsersControl from '../server/controllers/usersControl.js';
import mongoDB from '../databases/mongoDB.js';
import redisDB from '../databases/redisDB.js';
import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Create a sandbox for the test to run
const sandbox = sinon.createSandbox();

// Test suite for the UsersControl class
describe('UsersControl', () => {
  let res;

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
      }
    };
  });

  // Test suite for the register method
  describe('register', () => {
    let req;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        body: {
          userName: 'test',
          password: 'test',
          fullName: 'test test',
          email: 'test@test',
          role: 'Techer',
          phoneNumber: '123456789'
        }
      };
    });
    // Test case for the register method when user does not exist
    it('User does not exist', async () => {
      sinon.stub(mongoDB, 'getOne').returns(null);
      sinon.stub(mongoDB, 'addOne').returns('123');
      await UsersControl.register(req, res);
      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('msg', 'User created successfully');
      expect(res.data).to.have.property('userID', '123');
    });
    // Test case for the register method when user exists
    it('User exists', async () => {
      sinon.stub(mongoDB, 'getOne').returns(req.body);
      await UsersControl.register(req, res);
      expect(res.statusCode).to.equal(409);
      expect(res.data).to.have.property('msg', 'User already exists');
    });
    // Test case for the register method when user exists with different role
    it('User exists with different role', async () => {
      const newUser = {
        ...req.body,
        role: ['student'],
        _id: '123'
      };
      sinon.stub(mongoDB, 'getOne').returns(newUser);
      sinon.stub(mongoDB, 'updateOne').returns('123');
      await UsersControl.register(req, res);
      expect(res.statusCode).to.equal(201);
      expect(res.data).to.have.property('msg', 'User created successfully');
      expect(res.data).to.have.property('userID', newUser._id);
    });
    // Test case for the register method when an error occurs
    it('When an error occurs in server', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await UsersControl.register(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the login method
  describe('login', () => {
    let req;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        body: {
          email: 'test@test',
          password: 'test',
          fullName: 'test test',
          userName: 'test',
          role: 'Techer',
          _id: 123
        }
      };
    });
    // Test case for the login method when user does not exist
    it('User does not exist', async () => {
      sinon.stub(mongoDB, 'getOne').returns(null);
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Invalid credentials');
    });
    // Test case for the login method when user exists but role is different
    it('User exists but role is different', async () => {
      const user = {
        ...req.body,
        role: ['student']
      };
      sinon.stub(mongoDB, 'getOne').returns(user);
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Invalid credentials');
    });
    // Test case for the login method when user exists and password is invalid
    it('User exists and password is invalid', async () => {
      const user = {
        ...req.body,
        password: '123'
      };
      sinon.stub(mongoDB, 'getOne').returns(user);
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Invalid credentials');
    });
    // Test case for the login method when user exists and password is valid
    it('User exists and password is valid', async () => {
      const user = {
        ...req.body,
        password: await bcrypt.hash('test', 10)
      };
      sinon.stub(mongoDB, 'getOne').returns(user);
      sinon.stub(jwt, 'sign').returns('token');
      sinon.stub(redisDB, 'setHashMulti').returns('OK');
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.have.property('msg', 'Login successful');
      expect(res.header).to.have.property('name', 'Authorization');
      expect(res.header).to.have.property('value', 'token');
    });
    // Test case for the login method when an error occurs
    it('When an error occurs in server', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await UsersControl.login(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the logout method
  describe('logout', () => {
    let req;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        headers: {
          authorization: 'token'
        }
      };
    });
    // Test case for the logout method when successful
    it('Logout successful', async () => {
      sinon.stub(redisDB, 'del').returns('OK');
      await UsersControl.logout(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.have.property('msg', 'Logout successful');
    });
    // Test case for the logout method when an error occurs
    it('When an error occurs in server', async () => {
      sinon.stub(redisDB, 'del').throws();
      await UsersControl.logout(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the getUser method
  describe('getUser', () => {
    let req;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        headers: {
          authorization: 'token'
        }
      };
    });
    // Test case for the getUser method when successful
    it('Get user successful', async () => {
      sinon.stub(redisDB, 'getHashAll').returns('user');
      await UsersControl.getUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).have.property('msg', 'User found');
      expect(res.data).have.property('data', 'user');
    });
    // Test case for the getUser method when an error occurs
    it('When an error occurs in server', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await UsersControl.getUser(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the getUserDetails method
  describe('getUserDetails', () => {
    let req;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        headers: {
          authorization: 'token'
        }
      };
    });
    // Test case for the getUserDetails method when successful
    it('Get user details successful', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ id: '123' });
      sinon.stub(mongoDB, 'getOne').returns('user');
      await UsersControl.getUserDetails(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).have.property('msg', 'User found');
      expect(res.data).have.property('data', 'user');
    });
    // Test case for the getUserDetails method when an error occurs
    it('When an error occurs in server', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await UsersControl.getUserDetails(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the updateUser method
  describe('updateUser', () => {
    let req;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        headers: {
          authorization: 'token'
        },
        body: {
          userName: 'testtest'
        }
      };
    });
    // Test case for the updateUser method when successful update exists one and not full name
    it('Update user successful exist property and not full name', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'test@test' });
      sinon.stub(mongoDB, 'updateOne').returns('OK');
      await UsersControl.updateUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).have.property('msg', 'User updated successfully');
    });
    // Test case for the updateUser method when successful update exists one and full name
    it('Update user successful exist property and full name', async () => {
      req.body.fullName = 'test test';
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'test@test' });
      sinon.stub(mongoDB, 'updateOne').returns('OK');
      sinon.stub(redisDB, 'setHashMulti').returns('OK');
      await UsersControl.updateUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).have.property('msg', 'User updated successfully');
      expect(redisDB.setHashMulti.calledOnce).to.be.true;
    });
    // Test case for the updateUser method when successful update not exists one
    it('Update user successful not exist property', async () => {
      req.body.other = 'test@test';
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'test@test' });
      sinon.stub(mongoDB, 'updateOne').returns('OK');
      await UsersControl.updateUser(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).have.property('msg', 'User updated successfully');
    });
    // Test case for the updateUser method when an error occurs
    it('When an error occurs in server', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await UsersControl.updateUser(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the updatePassword method
  describe('updatePassword', () => {
    let req;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        headers: {
          authorization: 'token'
        },
        body: {
          password: '1234'
        }
      };
    });
    // Test case for the updatePassword method when successful
    it('Update password successful', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'test@test' });
      sinon.stub(mongoDB, 'getOne').returns({ password: 'test' });
      sinon.stub(mongoDB, 'updateOne').returns('OK');
      await UsersControl.updatePassword(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).have.property('msg', 'Password updated successfully');
      expect(mongoDB.updateOne.calledOnce).to.be.true;
    });
    // Test case for the updatePassword method when same password
    it('Update password same password', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'test@test' });
      sinon.stub(mongoDB, 'getOne').returns({ password: await bcrypt.hash('1234', 10) });
      sinon.stub(mongoDB, 'updateOne').returns('OK');
      await UsersControl.updatePassword(req, res);
      expect(res.statusCode).to.equal(409);
      expect(res.data).have.property('msg', 'New password is the same as the old password');
    });
    // Test case for the updatePassword method when an error occurs
    it('When an error occurs in server', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await UsersControl.updatePassword(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the middleware method
  describe('middleware', () => {
    let req;
    let next;
    // Create a request object before each test
    beforeEach(() => {
      req = {
        headers: {
          authorization: 'token'
        }
      };
      next = sinon.stub();
    });
    // Test case for the middleware method when successful
    it('Middleware successful', async () => {
      sinon.stub(redisDB, 'getHashAll').returns('user');
      await UsersControl.middleware(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the middleware method when no token
    it('Middleware no token', async () => {
      req.headers.authorization = '';
      await UsersControl.middleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the middleware method when no user
    it('Middleware no user', async () => {
      sinon.stub(redisDB, 'getHashAll').returns(null);
      await UsersControl.middleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // restore the sandbox after each test suite
  afterEach(() => {
    sandbox.restore();
  });
});
