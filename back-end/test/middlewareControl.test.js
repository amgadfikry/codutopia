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
    // Test case for the middleware method when no token
    it('Middleware no token', async () => {
      req.headers.authorization = '';
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the middleware method when no user in redis
    it('Middleware no user in redis', async () => {
      sinon.stub(redisDB, 'getHashAll').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the middleware method when invalid token
    it('Middleware invalid token', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'email' });
      sinon.stub(jwt, 'verify').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the middleware method when no user in mongoDB
    it('Middleware no user in mongoDB', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'email' });
      sinon.stub(jwt, 'verify').returns({ email: 'email' });
      sinon.stub(mongoDB, 'getOne').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the middleware method when everything is valid
    it('Middleware valid', async () => {
      sinon.stub(redisDB, 'getHashAll').returns({ email: 'email' });
      sinon.stub(jwt, 'verify').returns({ email: 'email', id: 'id' });
      sinon.stub(mongoDB, 'getOne').returns({ fullName: 'fullName', userName: 'userName' });
      sinon.stub(redisDB, 'setHashMulti').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.be.undefined;
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the middleware method when no user
    it('Middleware no user', async () => {
      sinon.stub(redisDB, 'getHashAll').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
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