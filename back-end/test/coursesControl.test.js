import CoursesControl from '../server/controllers/coursesControl.js';
import mongoDB from '../databases/mongoDB.js';
import redisDB from '../databases/redisDB.js';
import { expect } from 'chai';
import sinon from 'sinon';
import { ObjectId } from 'mongodb';

// Create a sandbox for the test to run
const sandbox = sinon.createSandbox();

// Test suite for the CoursesControl class methods
describe('CoursesControl', () => {
  let res;

  // Create a response object before each test suite
  beforeEach(() => {
    res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      }
    };
  });

  // Test suite for the allCourses method
  describe('allCourses', () => {
    const req = {};
    // Test case for a successful request to get all courses
    it('allCourse method get all courses successfully', async () => {
      const courses = [{ name: 'course1' }, { name: 'course2' }];
      sinon.stub(mongoDB, 'getAll').returns(courses);
      await CoursesControl.allCourses(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.eql({ msg: 'Courses found', data: courses });
    });
    // Test case for an error when getting all courses
    it('allCourse method get all courses with error', async () => {
      sinon.stub(mongoDB, 'getAll').throws();
      await CoursesControl.allCourses(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.eql({ msg: 'Internal server error' });
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the coursesByCategory method
  describe('coursesByCategory', () => {
    const req = {
      params: {
        category: 'category'
      }
    };
    // Test case for a successful request to get courses by category
    it('coursesByCategory method get courses by category successfully', async () => {
      const courses = [{ name: 'course1' }, { name: 'course2' }];
      sinon.stub(mongoDB, 'getAll').returns(courses);
      await CoursesControl.coursesByCategory(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.eql({ msg: 'Courses found', data: courses });
    });
    // Test case for an error when getting courses by category
    it('coursesByCategory method get courses by category with error', async () => {
      sinon.stub(mongoDB, 'getAll').throws();
      await CoursesControl.coursesByCategory(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.eql({ msg: 'Internal server error' });
    });
    // Restore the stubs after each test
    afterEach(() => {
      sinon.restore();
    });
  });

  // Test suite for the coursesById method
  describe('coursesById', () => {
    const req = {
      params: {
        id: '1'
      }
    };
    // Test case for a successful request to get a course by id
    it('coursesById method get a course by id successfully', async () => {
      const course = { name: 'course1' };
      sinon.stub(mongoDB, 'getOne').returns(course);
      await CoursesControl.coursesById(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.eql({ msg: 'Course found', data: course });
    });
    // Test case for an error when getting a course by id
    it('coursesById method get a course by id with error', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await CoursesControl.coursesById(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.eql({ msg: 'Internal server error' });
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
