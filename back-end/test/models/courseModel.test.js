import { expect } from 'chai';
import { courseModel } from '../../databases/mongoDB.js';
import mongoDB from '../../databases/mongoDB.js';

// Test suite for to test all the methods in the courseModel class
describe('CourseModel', () => {
  // Declare the course and courseId variables
  let course;
  let courseId;

  // Before hook to prepare the data before all the tests
  before(() => {
    // Create a new course object
    course = {
      title: 'Test course',
      description: 'This is a test course',
      authorId: '123456',
      price: 100,
      discount: 0,
      image: 'test.jpg',
    };
  });

  // After hook to clean up courses collection after all the tests done
  after(async () => {
    // Delete the courses from the database
    await courseModel.course.deleteMany({});
  });

  // Test suite for the createCourse method with all scenarios
  describe('Test suite for createCourse method', () => {
    // Test case for creating a new course with valid fields and return the created course data
    it('create a new course with valid fields and return the created course data', async () => {
      const result = await courseModel.createCourse(course);
      // check if the result is correct
      expect(result.title).to.equal(course.title);
      expect(result.description).to.equal(course.description);
      expect(result.authorId).to.equal(course.authorId);
      expect(result.price).to.equal(course.price);
      expect(result.discount).to.equal(course.discount);
      expect(result.image).to.equal(course.image);
      // assign the courseId
      courseId = result._id;
    });

    // Test case for creating a new course with missing required fields and throw an error
    it('create a new course with missing required fields and throw an error', async () => {
      try {
        // create temp object with missing required field
        const tempCourse = { ...course };
        delete tempCourse.title;
        await courseModel.createCourse(tempCourse);
      } catch (error) {
        expect(error.message).to.equal('Missing title field');
      }
    });

    // Test case for creating a new course with valid fields in a transaction with session with success transaction
    it('create 2 new course with valid fields in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // create 2 courses with valid fields for testing transaction
      await courseModel.createCourse(course, session);
      await courseModel.createCourse(course, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the courses are created
      const result = await courseModel.course.find({});
      expect(result.length).to.equal(3);
    });

    // Test case for creating a new course with missing required fields in a transaction with session with failed transaction
    it('create 2 new course with missing required fields in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // create 2 courses one with valid fields and one with missing required fields in session
        await courseModel.createCourse(course, session);
        const tempCourse = { ...course };
        delete tempCourse.title;
        // create a new course with missing required fields in session
        await courseModel.createCourse(tempCourse, session);
      } catch (error) {
        expect(error.message).to.equal('Missing title field');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the courses are not created
      const result = await courseModel.course.find({});
      expect(result.length).to.equal(3);
    });

  });


});