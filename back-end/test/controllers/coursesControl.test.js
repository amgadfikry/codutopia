import mongoDB from '../../databases/mongoDB.js';
import redisDB from '../../databases/redisDB.js';
import CoursesControl from "../../server/controllers/coursesControl.js";
import { expect } from "chai";
import sinon from "sinon";

describe("Unittest of CoursesControl methods", () => {
  let res;
  let req;
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
      },
      locals: {
        user: {
          id: "60f3e3e3e3e3e3e3e3e3e3e3",
          email: "email",
          role: "user",
          courses: `["60f3e3e3e3e3e3e3e3e3e3e3"]`,
        },
        token: "token",
      }
    };
    req = {
      body: {
        title: "title",
        description: "description",
        category: "category",
        instructor: "instructor",
        price: 100,
        rating: 5,
        students: 100,
        level: ["beginner", "intermediate", "advanced"],
        numberOfStudent: 10,
      },
      params: {
        id: "60f3e3e3e3e3e3e3e3e3e3e3",
        page: 1,
        limit: 10,
      },
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // Test suite for the allCourses method
  describe('AllCourses method', () => {
    // Test case for allCourses method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'getAll').returns([req.body]);
      await CoursesControl.allCourses(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Courses found', data: [req.body] });
    });
    // Test case for allCourses method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getAll').throws();
      await CoursesControl.allCourses(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the coursePagination method
  describe('CoursePagination method', () => {
    // Test case for coursePagination method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'pagination').returns([req.body]);
      await CoursesControl.coursePagination(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Courses found', data: [req.body] });
    });
    // Test case for coursePagination method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'pagination').throws();
      await CoursesControl.coursePagination(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the coursesBySearch method
  describe('CoursesBySearch method', () => {
    // Test case for coursesBySearch method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'getAll').returns([req.body]);
      await CoursesControl.coursesBySearch(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Courses found', data: [req.body] });
    });
    // Test case for coursesBySearch method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getAll').throws();
      await CoursesControl.coursesBySearch(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the coursesBySearchPagination method
  describe('CoursesBySearchPagination method', () => {
    // Test case for coursesBySearchPagination method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'pagination').returns([req.body]);
      await CoursesControl.coursesBySearchPagination(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Courses found', data: [req.body] });
    });
    // Test case for coursesBySearchPagination method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'pagination').throws();
      await CoursesControl.coursesBySearchPagination(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the coursesById method
  describe('CoursesById method', () => {
    // Test case for coursesById method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'getOne').returns(req.body);
      await CoursesControl.coursesById(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Course found', data: req.body });
    });
    // Test case for coursesById method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getOne').throws();
      await CoursesControl.coursesById(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the coursesByInstructorId method
  describe('CoursesByInstructorId method', () => {
    // Test case for coursesByInstructorId method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'getAll').returns([req.body]);
      await CoursesControl.coursesByInstructorId(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Courses found', data: [req.body] });
    });
    // Test case for coursesByInstructorId method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getAll').throws();
      await CoursesControl.coursesByInstructorId(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the enrolledCourses method
  describe('EnrolledCourses method', () => {
    // Test case for enrolledCourses method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'getOne').returns(['60f3e3e3e3e3e3e3e3e3e3e3']);
      sinon.stub(mongoDB, 'getFromList').returns([req.body]);
      await CoursesControl.enrolledCourses(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Courses found', data: [req.body] });
    });
    // Test case for enrolledCourses method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'getFromList').throws();
      await CoursesControl.enrolledCourses(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the createCourse method
  describe('CreateCourse method', () => {
    // Test case for createCourse method with a successful response
    it('when a successful response', async () => {
      res.locals.user.role = "instructor";
      sinon.stub(mongoDB, 'addOne').returns("60f3e3e3e3e3e3e3e3e3e3e3");
      sinon.stub(mongoDB, 'updateOne').returns('ok');
      sinon.stub(redisDB, 'setHashMulti').returns('ok');
      await CoursesControl.createCourse(req, res);
      expect(res.statusCode).to.equal(201);
      expect(res.data).to.deep.equal({ msg: 'Course created', courseId: "60f3e3e3e3e3e3e3e3e3e3e3" });
    });
    // Test case for createCourse method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'addOne').throws();
      await CoursesControl.createCourse(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the updateCourse method
  describe('UpdateCourse method', () => {
    // Test case for updateCourse method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'updateOne').returns('ok');
      await CoursesControl.updateCourse(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Course updated' });
    });
    // Test case for updateCourse method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'updateOne').throws();
      await CoursesControl.updateCourse(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the deleteCourse method
  describe('DeleteCourse method', () => {
    // Test case for deleteCourse method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'deleteOne').returns('ok');
      sinon.stub(mongoDB, 'updateMany').returns('ok');
      await CoursesControl.deleteCourse(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Course deleted' });
    });
    // Test case for deleteCourse method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'deleteOne').throws();
      await CoursesControl.deleteCourse(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the enrollCourse method
  describe('EnrollCourse method', () => {
    // Test case for enrollCourse method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'updateOne').returns('ok');
      sinon.stub(redisDB, 'setHashMulti').returns('ok');
      await CoursesControl.enrollCourse(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Course enrolled' });
    });
    // Test case for enrollCourse method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'updateOne').throws();
      await CoursesControl.enrollCourse(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });

  // Test suite for the unenrollCourse method
  describe('UnenrollCourse method', () => {
    // Test case for unenrollCourse method with a successful response
    it('when a successful response', async () => {
      sinon.stub(mongoDB, 'updateOne').returns('ok');
      sinon.stub(redisDB, 'setHashMulti').returns('ok');
      await CoursesControl.unenrollCourse(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'Course unenrolled' });
    });
    // Test case for unenrollCourse method with an error response
    it('when there is an internal server error', async () => {
      sinon.stub(mongoDB, 'updateOne').throws();
      await CoursesControl.unenrollCourse(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Internal server error' });
    });
  });
});