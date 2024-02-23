import axios from 'axios';
import { expect } from 'chai';
import mongoDB from '../../databases/mongoDB.js';
import redisDB from '../../databases/redisDB.js'


// Integration tests for users routes
describe('Integration tests for users routes', () => {
  let requestData;
  let responsesResult;
  let cookies;
  let url;
  let urlOptions;
  // Before ingesting the test, congigure databases and data or requests
  before(() => {
    // clean redis database
    requestData = {
      user: {
        userName: 'learner',
        password: 'learner',
        email: 'test@learner.com',
        fullName: 'learner test',
        role: 'learner',
      },
      instructor: {
        userName: 'instructor',
        password: 'instructor',
        email: 'test@instructor@com',
        fullName: 'instructor test',
        role: 'instructor',
      },
      course: {
        title: 'course',
        description: 'test course description',
        level: 'beginner',
        content: [],
        reviews: [],
      },
    };
    responsesResult = {};
    cookies = {};
    url = 'http://localhost:3000';
    urlOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': null,
      }
    }
  });

  // After ingesting the test, clean databases and data or requests
  after(async () => {
    // clean redis database
    await redisDB.redis.flushdb();
    // clear mongo database
    await mongoDB.db.dropDatabase();
  });

  // Test suit for register route
  describe('Register route', () => {
    // Test Case of student registration
    it('new student user successfully', async () => {
      const response = await axios.post(`${url}/users/register`, requestData.user);
      responsesResult.user = response.data.userID;
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('msg', 'User created successfully');
      expect(response.data).to.have.property('userID');
      expect(response.data.userID).to.be.a('string');
    });
    // Test Case of instructor registration
    it('new instructor user successfully', async () => {
      const response = await axios.post(`${url}/users/register`, requestData.instructor);
      responsesResult.instructor = response.data.userID;
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('msg', 'User created successfully');
      expect(response.data).to.have.property('userID');
      expect(response.data.userID).to.be.a('string');
    });
    // Test Case if register user email is already exist
    it('user email is already exist', async () => {
      try {
        const response = await axios.post(`${url}/users/register`, requestData.instructor);
      } catch (error) {
        expect(error.response.status).to.equal(409);
        expect(error.response.data).to.have.property('msg', 'User already exists');
      }
    });
  });

  // Test suit for login route
  describe("Login route", () => {
    // Test Case of student login successfully
    it('student login successfully', async () => {
      const response = await axios.post(`${url}/users/login`, {
        email: requestData.user.email,
        password: requestData.user.password,
        role: requestData.user.role,
      });
      cookies.authTokenUser = response.headers.authorization;
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Login successful');
    });
    // Test Case of instructor login
    it('instructor login successfully', async () => {
      const response = await axios.post(`${url}/users/login`, {
        email: requestData.instructor.email,
        password: requestData.instructor.password,
        role: requestData.instructor.role,
      });
      cookies.authTokenInstructor = response.headers.authorization;
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Login successful');
    });
    // Test Case of invalid credentials email
    it('invalid credentials email', async () => {
      try {
        const response = await axios.post(`${url}/users/login`, {
          email: 'email', password: requestData.user.password, role: requestData.user.role,
        });
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Invalid credentials');
      }
    });
    // Test Case of invalid credentials password
    it('invalid credentials password', async () => {
      try {
        const response = await axios.post(`${url}/users/login`, {
          email: requestData.user.email, password: 'password', role: requestData.user.role,
        });
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Invalid credentials');
      }
    });
    // Test Case of invalid credentials role
    it('invalid credentials role', async () => {
      try {
        const response = await axios.post(`${url}/users/login`, {
          email: requestData.user.email, password: requestData.user.password, role: requestData.instructor.role
        });
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Invalid credentials');
      }
    });
  });

  // Test suit for get user data brief route
  describe('Get user data brief route', () => {
    // Test Case of student get data brief
    it('student get data brief successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/users/brief`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'User found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('userName', requestData.user.userName);
      expect(response.data.data).to.have.property('email', requestData.user.email);
      expect(response.data.data).to.have.property('fullName', requestData.user.fullName);
      expect(response.data.data).to.have.property('role', requestData.user.role);
    });
    // Test case if not authorized user
    it('not authorized user', async () => {
      try {
        const response = await axios.get(`${url}/users/brief`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for get user details route
  describe('Get user details route', () => {
    // Test Case of student get details
    it('student get details successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/users/details`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'User found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('userName', requestData.user.userName);
      expect(response.data.data).to.have.property('email', requestData.user.email);
      expect(response.data.data).to.have.property('fullName', requestData.user.fullName);
      expect(response.data.data).to.have.property('role', requestData.user.role);
    });
    // Test case if not authorized user
    it('not authorized user', async () => {
      try {
        const response = await axios.get(`${url}/users/details`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for update user route
  describe('Update user route', () => {
    // Test Case of student update
    it('student update successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.put(`${url}/users/update`, {
        fullName: 'new learner test',
      }, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'User updated successfully');
      const userMongo = await axios.get(`${url}/users/details`, urlOptions);
      expect(userMongo.data.data).to.have.property('fullName', 'new learner test');
      const userRedis = await axios.get(`${url}/users/brief`, urlOptions);
      expect(userRedis.data.data).to.have.property('fullName', 'new learner test');
    });
    // Test Case if not authorized user
    it('not authorized user', async () => {
      try {
        const response = await axios.put(`${url}/users/update`, {
          fullName: 'new learner test',
        }, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for update user password route
  describe('Update user password route', () => {
    // Test Case of student update password
    it('student update password successfully', async () => {
      requestData.user.password = 'newPassword';
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.put(`${url}/users/updatePassword`, {
        password: requestData.user.password,
      }, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Password updated successfully');
    });
    // Test case if failed to login with old password
    it('failed to login with old password', async () => {
      try {
        const response = await axios.post(`${url}/users/login`, {
          email: requestData.user.email,
          password: 'learner',
          role: requestData.user.role,
        });
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Invalid credentials');
      }
    });
    // Test case if success to login with new password
    it('success to login with new password', async () => {
      const response = await axios.post(`${url}/users/login`, {
        email: requestData.user.email,
        password: requestData.user.password,
        role: requestData.user.role,
      });
      cookies.authTokenUser = response.headers.authorization;
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Login successful');
    });
    // Test case if same password
    it('same password', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      try {
        const response = await axios.put(`${url}/users/updatePassword`, {
          password: requestData.user.password,
        }, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(409);
        expect(error.response.data).to.have.property('msg', 'New password is the same as the old password');
      }
    });
    // Test Case if not authorized user
    it('not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = '';
        const response = await axios.put(`${url}/users/updatePassword`, {
          password: requestData.user.password,
        }, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for delete user route
  describe('Delete user route', () => {
    // Test Case of instuctor delete
    it('instructor delete successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.delete(`${url}/users/delete`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'User deleted successfully');
    });
    // Test Case if not authorized user
    it('not authorized user', async () => {
      try {
        const response = await axios.delete(`${url}/users/delete`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for logout route
  describe('Logout route', () => {
    // Test Case of instructor logout
    it('instructor logout successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.get(`${url}/users/logout`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Logout successful');
    });
    // Test Case if not authorized user
    it('not authorized user', async () => {
      try {
        const response = await axios.get(`${url}/users/logout`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });
});
