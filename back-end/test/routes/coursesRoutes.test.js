import axios from 'axios';
import { expect } from 'chai';
import mongoDB from '../../databases/mongoDB.js';
import redisDB from '../../databases/redisDB.js'
import { ObjectId } from 'mongodb';

// Integration tests for users routes
describe('Integration tests for courses routes', () => {
  let requestData;
  let responsesResult = {};
  let cookies = {};
  let url = 'http://localhost:3000';
  let urlOptions;
  // Before ingesting the test, congigure databases and data or requests
  before(async () => {
    // clean redis database
    urlOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': null,
      }
    };
    requestData = {
      user: { userName: 'learner', password: 'learner', email: 'test@com', role: 'learner' },
      instructor: { userName: 'instr', password: 'instr', email: 'test@com', role: 'instructor' },
      course: { title: 'course', description: 'description', level: 'beginner' },
    };
    // create new user
    let response = await axios.post(`${url}/users/register`, requestData.user);
    responsesResult.user = response.data.userID;
    // create new instructor
    response = await axios.post(`${url}/users/register`, requestData.instructor);
    responsesResult.instructor = response.data.userID;
    // login user
    response = await axios.post(`${url}/users/login`, {
      email: requestData.user.email,
      password: requestData.user.password,
      role: requestData.user.role,
    });
    cookies.authTokenUser = response.headers.authorization;
    // login instructor
    response = await axios.post(`${url}/users/login`, {
      email: requestData.instructor.email,
      password: requestData.instructor.password,
      role: requestData.instructor.role,
    });
    cookies.authTokenInstructor = response.headers.authorization;
  });

  // After ingesting the test, clean databases and data or requests
  after(async () => {
    // clean redis database
    await redisDB.redis.flushdb();
    // clear mongo database
    await mongoDB.db.dropDatabase();
  });

  // Test suit for create new course route
  describe('Create new course route', () => {
    // Test Case of instructor create new course
    it('instructor create new course successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.post(`${url}/courses/create`, requestData.course, urlOptions);
      responsesResult.course = response.data.courseId;
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('msg', 'Course created');
      expect(response.data).to.have.property('courseId');
      expect(response.data.courseId).to.be.a('string');
    });
    // Test caes check the course added to the instructor createdCourses list in the mongo
    it('check the course added to the instructor createdCourses list in the mongo', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.get(`${url}/users/details`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('courses');
      expect(response.data.data.courses).to.be.an('array');
      expect(response.data.data.courses).to.include(responsesResult.course);
    });
    // Test Case if not authorized user
    it('not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = cookies.authTokenUser;
        const response = await axios.post(`${url}/courses/create`, requestData.course, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for get all courses route
  describe('Get all courses route', () => {
    // Test Case of get all courses
    it('get all courses successfully', async () => {
      // add new two courses to the database
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const course1 = await axios.post(`${url}/courses/create`, { ...requestData.course, title: 'course1' }, urlOptions);
      responsesResult.course1 = course1.data.courseId;
      const course2 = await axios.post(`${url}/courses/create`, { ...requestData.course, title: 'course2' }, urlOptions);
      responsesResult.course2 = course2.data.courseId;
      urlOptions.headers.Authorization = null;
      const response = await axios.get(`${url}/courses/all`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Courses found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(3);
    });
  });

  // Test suit for get all courses pagination route
  describe('Get all courses pagination route', () => {
    // Test Case of get all courses pagination
    it('get all courses pagination successfully', async () => {
      const response = await axios.get(`${url}/courses/page/1/limit/2`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Courses found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(2);
      const response2 = await axios.get(`${url}/courses/page/2/limit/2`, urlOptions);
      expect(response2.status).to.equal(200);
      expect(response2.data).to.have.property('msg', 'Courses found');
      expect(response2.data).to.have.property('data');
      expect(response2.data.data).to.be.an('array');
      expect(response2.data.data.length).to.equal(1);
    });
  });

  // Test suit for get course by search text route
  describe('Get course by search text route', () => {
    // Test Case of get course by search text
    it('get course by search criteria successfully', async () => {
      const response = await axios.get(`${url}/courses/search/course`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Courses found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(3);
    });
  });

  // Test suit for get course by search critria pagination route
  describe('Get course by search critria pagination route', () => {
    // Test Case of get course by search critria pagination
    it('get course by search critria pagination successfully', async () => {
      const response = await axios.post(`${url}/courses/search/page/1/limit/2`, { level: 'beginner' }, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Courses found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(2);
      const response2 = await axios.post(`${url}/courses/search/page/2/limit/2`, { level: 'beginner' }, urlOptions);
      expect(response2.status).to.equal(200);
      expect(response2.data).to.have.property('msg', 'Courses found');
      expect(response2.data).to.have.property('data');
      expect(response2.data.data).to.be.an('array');
      expect(response2.data.data.length).to.equal(1);
    });
  });

  // Test suit for get course by id route
  describe('Get course by id route', () => {
    // Test Case of get course by id as instructor
    it('get course by id as instructor successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.get(`${url}/courses/${responsesResult.course}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Course found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('title', requestData.course.title);
    });
    // Test Case of get course by id as learner
    it('get course by id as learner successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/courses/${responsesResult.course}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Course found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('title', requestData.course.title);
    });
    // Test Case of get course by id as not authorized user
    it('get course by id as not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = null;
        const response = await axios.get(`${url}/courses/${responsesResult.course}`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for get course by instructor id route
  describe('Get course by instructor id route', () => {
    // Test Case of get course by instructor id as instructor
    it('get course by instructor id as instructor successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.get(`${url}/courses/instructor/${responsesResult.instructor}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Courses found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(3);
      expect(response.data.data[0]).to.have.property('title', requestData.course.title);
    });
    // Test Case of get course by instructor id as learner
    it('get course by instructor id as learner successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/courses/instructor/${responsesResult.instructor}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Courses found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(3);
      expect(response.data.data[0]).to.have.property('title', requestData.course.title);
    });
    // Test Case of get course by instructor id as not authorized user
    it('get course by instructor id as not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = null;
        const response = await axios.get(`${url}/courses/instructor/${responsesResult.instructor}`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for update course route
  describe('Update course route', () => {
    // Test Case of update course
    it('update course successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.put(`${url}/courses/update/${responsesResult.course}`, { title: 'newTitle' }, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Course updated');
    });
    // Test Case of check the course updated in the database
    it('check the course updated in the database', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/courses/${responsesResult.course}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Course found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('title', 'newTitle');
    });
    // Test Case of not authorized user
    it('not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = cookies.authTokenUser;
        const response = await axios.put(`${url}/courses/update/${responsesResult.course}`, { title: 'newTitle' }, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for enroll course route
  describe('Enroll course route', () => {
    // Test Case of enroll course
    it('enroll course successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/courses/enroll/${responsesResult.course}`, urlOptions);
      await axios.get(`${url}/courses/enroll/${responsesResult.course1}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Course enrolled');
    });
    // Test Case of check the course added to the user courses list in the mongo
    it('check the course added to the user courses list in the mongo', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/users/details`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('courses');
      expect(response.data.data.courses).to.be.an('array');
      expect(response.data.data.courses.length).to.equal(2);
      expect(response.data.data.courses[0].courseId).to.equal(responsesResult.course);
      expect(response.data.data.courses[1].courseId).to.equal(responsesResult.course1);
      expect(response.data.data.courses[0]).to.have.property('progress', 0);
      expect(response.data.data.courses[0]).to.have.property('score', 0);
    });
    // Test Case of not authorized user
    it('not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = cookies.authTokenInstructor;
        const response = await axios.get(`${url}/courses/enroll/${responsesResult.course}`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for get all enrolled courses route
  describe('Get all enrolled courses route', () => {
    // Test Case of get all enrolled courses
    it('get all enrolled courses successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/courses/enrolled/all`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Courses found');
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.be.an('array');
      expect(response.data.data.length).to.equal(2);
      expect(response.data.data[0].title).to.equal('newTitle');
      expect(response.data.data[1].title).to.equal('course1');
    });
    // Test Case of not authorized user
    it('not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = cookies.authTokenInstructor;
        const response = await axios.get(`${url}/courses/enrolled/all`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for unenroll course route
  describe('Unenroll course route', () => {
    // Test Case of unenroll course
    it('unenroll course successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.delete(`${url}/courses/unenroll/${responsesResult.course}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Course unenrolled');
    });
    // Test Case of check the course removed from the user courses list in the mongo
    it('check the course removed from the user courses list in the mongo', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/users/details`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('courses');
      expect(response.data.data.courses).to.be.an('array');
      expect(response.data.data.courses.length).to.equal(1);
      expect(response.data.data.courses[0].courseId).to.equal(responsesResult.course1);
    });
    // Test Case of not authorized user
    it('not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = cookies.authTokenInstructor;
        const response = await axios.delete(`${url}/courses/unenroll/${responsesResult.course}`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });

  // Test suit for delete course route
  describe('Delete course route', () => {
    // Test Case of delete course
    it('delete course successfully', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.delete(`${url}/courses/delete/${responsesResult.course}`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('msg', 'Course deleted');
    });
    // Test Case of check the course removed from the instructor createdCourses list in the mongo
    it('check the course removed from the instructor createdCourses list in the mongo', async () => {
      urlOptions.headers.Authorization = cookies.authTokenInstructor;
      const response = await axios.get(`${url}/users/details`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('courses');
      expect(response.data.data.courses).to.be.an('array');
      expect(response.data.data.courses.length).to.equal(2);
      expect(response.data.data.courses).to.not.include(responsesResult.course);
    });
    // Test Case of check the course removed from the learner courses list in the mongo
    it('check the course removed from the learner courses list in the mongo', async () => {
      urlOptions.headers.Authorization = cookies.authTokenUser;
      const response = await axios.get(`${url}/users/details`, urlOptions);
      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('courses');
      expect(response.data.data.courses).to.be.an('array');
      expect(response.data.data.courses.length).to.equal(1);
      expect(response.data.data.courses).to.not.include(responsesResult.course);
    });
    // Test Case of not authorized user
    it('not authorized user', async () => {
      try {
        urlOptions.headers.Authorization = cookies.authTokenUser;
        const response = await axios.delete(`${url}/courses/delete/${responsesResult.course}`, urlOptions);
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data).to.have.property('msg', 'Unauthorized');
      }
    });
  });
});