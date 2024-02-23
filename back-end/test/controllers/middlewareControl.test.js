import MiddlewareControl from "../../server/controllers/middlewareControl.js";
import mongoDB from '../../databases/mongoDB.js';
import redisDB from '../../databases/redisDB.js';
import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';



// Teqst suite for the MiddlewareControl class
describe('Unittest of MiddlewareControl methods', () => {
  let res;
  let req;
  let next;
  // Create a response object before each test suite
  beforeEach(() => {
    next = sinon.stub();
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
      locals: {},
    };
    req = {
      headers: {
        authorization: 'token',
      },
    };
  });

  // Restore all the functions after each test
  afterEach(() => {
    sinon.restore();
  });

  // Test suite for the authMiddleware method
  describe('AuthMiddleware method', () => {
    // Test case for the authMiddleware method when no token
    it('when no token provided', async () => {
      req.headers.authorization = '';
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when found user in redis
    it('when found user in redis', async () => {
      const user = { 'id': '123', 'role': 'user' };
      sinon.stub(redisDB, 'getHashAll').returns(user);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.locals.user).to.deep.equal(user);
      expect(res.locals.token).to.equal(req.headers.authorization);
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the authMiddleware method when not found user in redis and  not verified token
    it('when not found user in redis and not verified token', async () => {
      sinon.stub(redisDB, 'getHashAll').returns(null);
      sinon.stub(jwt, 'verify').returns(false);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when not found user in redis and verified token and not found user in mongoDB
    it('when not found user in redis and verified token and not found user in mongoDB', async () => {
      sinon.stub(redisDB, 'getHashAll').returns(null);
      sinon.stub(jwt, 'verify').returns({ id: '60f3e3e3e3e3e3e3e3e3e3e3', role: 'user' });
      sinon.stub(mongoDB, 'getOne').returns(null);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the authMiddleware method when not found user in redis and verified token and found user in mongoDB
    it('when not found user in redis and verified token and found user in mongoDB (success)', async () => {
      const user = { fullName: 'user', userName: 'user', role: 'user' };
      const tokenData = { id: '60f3e3e3e3e3e3e3e3e3e3e3', role: 'user' };
      sinon.stub(redisDB, 'getHashAll').returns(null);
      sinon.stub(jwt, 'verify').returns(tokenData);
      sinon.stub(mongoDB, 'getOne').returns(user);
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.locals.user).to.have.property('fullName', 'user');
      expect(res.locals.user).to.have.property('role', user.role);
      expect(res.locals.user).to.have.property('role', tokenData.role);
      expect(res.locals.token).to.equal(req.headers.authorization);
      expect(next.calledOnce).to.be.true;
    });
    // Test case for the authMiddleware method when error
    it('when there is an internal server error', async () => {
      sinon.stub(redisDB, 'getHashAll').throws('error');
      await MiddlewareControl.authMiddleware(req, res, next);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.have.property('msg', 'Internal server error');
      expect(next.calledOnce).to.be.false;
    });
  });

  // Test suite for the roleMiddleware method
  describe('RoleMiddleware method', () => {
    // Test case for the roleMiddleware method when user role is not the same as the role passed
    it('when user role is not the same as the role passed', () => {
      res.locals.user = { role: 'user' };
      MiddlewareControl.roleMiddleware(['admin'])(req, res, next);
      expect(res.statusCode).to.equal(401);
      expect(res.data).to.have.property('msg', 'Unauthorized');
      expect(next.calledOnce).to.be.false;
    });
    // Test case for the roleMiddleware method when user role is the same as the role passed
    it('when user role is the same as the role passed', () => {
      res.locals.user = { role: 'user' };
      MiddlewareControl.roleMiddleware(['user'])(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });
});
