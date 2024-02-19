import MiddlewareControl from "../server/controllers/middlewareControl.js";
import mongoDB from '../databases/mongoDB.js';
import redisDB from '../databases/redisDB.js';
import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { describe } from "node:test";

const sandbox = sinon.createSandbox();

// Test suite for the MiddlewareControl class
describe('MiddlewareControl', () => {
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

  // Test suite for the authMiddleware method
  describe('authMiddleware', () => {
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
    // Test case for the authMiddleware method when no token
    it('AuthMiddleware no token', async () => {
      req.headers.authorization = '';
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when no user in redis
    it('AuthMiddleware no user in redis', async () => {
      sinon.stub(redisDB, 'getHashAll').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when invalid token
    it('AuthMiddleware invalid token', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'email' });
      sinon.stub(jwt, 'verify').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when no user in mongoDB
    it('AuthMiddleware no user in mongoDB', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'email' });
      sinon.stub(jwt, 'verify').returns({ email: 'email' });
      sinon.stub(mongoDB, 'getOne').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when everything is valid
    it('AuthMiddleware valid', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'email' });
      sinon.stub(jwt, 'verify').returns({ email: 'email', id: 'id' });
      sinon.stub(mongoDB, 'getOne').returns({ fullName: 'fullName', userName: 'userName' });
      sinon.stub(redisDB, 'setHashMulti').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the authMiddleware method when no user
    it('AuthMiddleware no user', async () => {
      sinon.stub(redisDB, 'getHashAll').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when error
    it('AuthMiddleware error', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
      expect(next.calledOnce).to.be.false;
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the userRoleMiddleware method
  describe('userRoleMiddleware', () => {
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
    // Test case for the userRoleMiddleware method when no User role
    it('UserRoleMiddleware no User role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"admin\"]" });
      await MiddlewareControl.userRoleMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the userRoleMiddleware method when User role
    it('UserRoleMiddleware User role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"User\"]" });
      await MiddlewareControl.userRoleMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the userRoleMiddleware method when error
    it('UserRoleMiddleware error', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await MiddlewareControl.userRoleMiddleware(req, res, next);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
      expect(next.calledOnce).to.be.false;
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the instructorRoleMiddleware method
  describe('instructorRoleMiddleware', () => {
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
    // Test case for the instructorRoleMiddleware method when no Instructor role
    it('InstructorRoleMiddleware no Instructor role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"admin\"]" });
      await MiddlewareControl.instructorRoleMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the instructorRoleMiddleware method when Instructor role
    it('InstructorRoleMiddleware Instructor role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"Instructor\"]" });
      await MiddlewareControl.instructorRoleMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the instructorRoleMiddleware method when error
    it('InstructorRoleMiddleware error', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await MiddlewareControl.instructorRoleMiddleware(req, res, next);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
      expect(next.calledOnce).to.be.false;
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the userORInstructorMiddleware method
  describe('userORInstructorMiddleware', () => {
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
    // Test case for the userORInstructorMiddleware method when no User or Instructor role
    it('UserORInstructorMiddleware no User or Instructor role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"admin\"]" });
      await MiddlewareControl.userORInstructorMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the userORInstructorMiddleware method when User role
    it('UserORInstructorMiddleware User role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"User\"]" });
      await MiddlewareControl.userORInstructorMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the userORInstructorMiddleware method when Instructor role
    it('UserORInstructorMiddleware Instructor role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"Instructor\"]" });
      await MiddlewareControl.userORInstructorMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the userORInstructorMiddleware method when User and Instructor role
    it('UserORInstructorMiddleware User and Instructor role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"User\", \"Instructor\"]" });
      await MiddlewareControl.userORInstructorMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the userORInstructorMiddleware method when error
    it('UserORInstructorMiddleware error', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await MiddlewareControl.userORInstructorMiddleware(req, res, next);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
      expect(next.calledOnce).to.be.false;
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the adminRoleMiddleware method
  describe('adminRoleMiddleware', () => {
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
    // Test case for the adminRoleMiddleware method when no Admin role
    it('AdminRoleMiddleware no Admin role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"instructor\"]" });
      await MiddlewareControl.adminRoleMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the adminRoleMiddleware method when Admin role
    it('AdminRoleMiddleware Admin role', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ role: "[\"Admin\"]" });
      await MiddlewareControl.adminRoleMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the adminRoleMiddleware method when error
    it('AdminRoleMiddleware error', async () => {
      sinon.stub(redisDB, 'getHashAll').throws();
      await MiddlewareControl.adminRoleMiddleware(req, res, next);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
      expect(next.calledOnce).to.be.false;
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Restore all the functions after each test suite
  afterEach(() => {
    sandbox.restore();
  });
});