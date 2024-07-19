import { expect } from 'chai';
import mongoDB, { courseModel } from '../../../databases/mongoDB.js';

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
      tags: ['test', 'course', 'tag'],
      authorId: '621f7b9e6f3b7d1d9e9f9d4b',
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

    // after hook to clean up courses collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

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

    // Test case for creating a new course with tages less than 3 and throw an error tag field must have at least 3 tags
    it('create a new course with tags less than 3 and throw an error tag field must have at least 3 tags', async () => {
      try {
        // create temp object with tags less than 3
        const tempCourse = { ...course };
        tempCourse.tags = ['test', 'tag'];
        await courseModel.createCourse(tempCourse);
      } catch (error) {
        expect(error.message).to.equal('Tags field must have at least 3 tags');
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


  // Test suite for the getCourse method with all scenarios
  describe('Test suite for getCourse method', () => {

    // before hook to create a new course with valid fields and assign the courseId
    before(async () => {
      // create a new course with valid fields for testing getCourseByName method
      const result = await courseModel.createCourse(course);
      courseId = result._id;
    });

    // after hook to clean up courses collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for getting a course by id with valid courseId and return the course data
    it('get a course by id with valid courseId and return the course data', async () => {
      const result = await courseModel.getCourse(courseId);
      // check if the result is correct
      expect(result.title).to.equal(course.title);
      expect(result.description).to.equal(course.description);
      expect(result.authorId).to.equal(course.authorId);
      expect(result.price).to.equal(course.price);
      expect(result.discount).to.equal(course.discount);
      expect(result.image).to.equal(course.image);
      expect(result.tags).to.deep.equal(course.tags);
      expect(result.sumReviews).to.equal(0);
      expect(result.courseAvgRating).to.equal(0);
      expect(result.students).to.eql([]);
    });

    // Test case for getting a course by id with invalid courseId and throw an error course not found
    it('get a course by id with invalid courseId and throw an error course not found', async () => {
      try {
        // get a course with invalid courseId
        await courseModel.getCourse('621f7b9e6f3b7d1d9e9f9d4b');
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for getting a course by id in a transaction with session with success transaction
    it('get a course by id in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // get the course by id in session
      await courseModel.getCourse(courseId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting a course by id in a transaction with session with failed transaction
    it('get a course by id in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // get the course by id in session
        await courseModel.getCourse('621f7b9e6f3b7d1d9e9f9d4b', session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });

  });


  // Test suite for the getAllCoursesPagination method with all scenarios
  describe('Test suite for getAllCoursesPagination method', () => {

    // before hook to create 3 new courses with valid fields
    before(async () => {
      // create 3 courses with valid fields
      for (let i = 0; i < 3; i++) {
        const result = await courseModel.createCourse(course);
        courseId = result._id;
      }
    });

    // after hook to clean up courses collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for getting all courses with pagination and return list of courses
    it('get all courses with pagination and return list of courses', async () => {
      // get first 2 courses with pagination (page 1 and limit 2)
      const result = await courseModel.getAllCoursesPagination(1, 2);
      // check if the result is correct
      expect(result.length).to.equal(2);
      // get second page of courses with pagination (page 2 and limit 2)
      const result2 = await courseModel.getAllCoursesPagination(2, 2);
      // check if the result is correct
      expect(result2.length).to.equal(1);
    });

    // Test case for getting all courses with pagination and return empty list
    it('get all courses with pagination and return empty list', async () => {
      // get third page of courses with pagination (page 3 and limit 2)
      const result = await courseModel.getAllCoursesPagination(3, 2);
      // check if the result is correct
      expect(result.length).to.equal(0);
    });

    // Test case for getting all courses with pagination in a transaction with session with success transaction
    it('get all courses with pagination in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // get all courses with pagination in session and get course of them
      await courseModel.getAllCoursesPagination(1, 2, session);
      await courseModel.getCourse(courseId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting all courses with pagination in a transaction with session with failed transaction
    it('get all courses with pagination in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // get all courses with pagination in session and get course by invalid courseId
        await courseModel.getAllCoursesPagination(1, 2, session);
        await courseModel.getCourse('621f7b9e6f3b7d1d9e9f9d4b', session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });


  });


  // Test suite for the getCoursesByListOfIds method with all scenarios
  describe('Test suite for getCoursesByListOfIds method', () => {
    // variable to list of courseIds
    let coursesIds = [];

    // before hook to create 3 new courses with valid fields and assign to list of courseIds
    before(async () => {
      // create 3 courses with valid fields for testing getCoursesByListOfIds method
      for (let i = 0; i < 3; i++) {
        const result = await courseModel.createCourse(course);
        coursesIds.push(result._id);
      }
    });

    // after hook to clean up courses collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for getting courses by list of ids with valid courseIds and return list of courses
    it('get courses by list of ids with valid courseIds and return list of courses', async () => {
      // get the courses by list of ids
      const result = await courseModel.getCoursesByListOfIds(coursesIds);
      // check if the result is correct
      expect(result.length).to.equal(3);
    });

    // Test case for getting courses by list of ids with invalid courseId inside the list and return list of courses
    it('get courses by list of ids with invalid courseId inside the list and return list of courses', async () => {
      // add invalid courseId to the list
      coursesIds.push('621f7b9e6f3b7d1d9e9f9d4b');
      // get the courses by list of invalid ids
      const result = await courseModel.getCoursesByListOfIds(coursesIds);
      expect(result.length).to.equal(3);
    });

    // Test case for getting courses by list of ids with empty list and return empty list
    it('get courses by list of ids with empty list and return empty list', async () => {
      // get the courses by empty list of ids
      const result = await courseModel.getCoursesByListOfIds([]);
      expect(result.length).to.equal(0);
    });

    // Test case for getting courses by list of ids in a transaction with session with success transaction
    it('get courses by list of ids in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // get the courses by list of ids in session and get course of them
      await courseModel.getCoursesByListOfIds(coursesIds, session);
      await courseModel.getCourse(coursesIds[0], session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting courses by list of ids in a transaction with session with failed transaction
    it('get courses by list of ids in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // get the courses by list of ids in session and get course by invalid courseId
        await courseModel.getCoursesByListOfIds(coursesIds, session);
        await courseModel.getCourse('621f7b9e6f3b7d1d9e9f9d4b', session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the filterCourses method with all scenarios
  describe('Test suite for filterCourses method', () => {
    // variable to list of courseIds
    let coursesIds = [];

    // before hook to create 3 new courses with valid fields and assign to list of courseIds
    before(async () => {
      // create 3 courses with valid fields for testing filterCourses method
      const course1 = { ...course, title: 'Test course1', price: 50, tags: ['test', 'tag1', 'course'] };
      const course2 = { ...course, title: 'Test course2', price: 100, tags: ['test', 'tag2', 'course'] };
      const course3 = { ...course, title: 'Test course3', price: 150, tags: ['test', 'tag3', 'course'] };
      const courses = [course1, course2, course3];
      for (let i = 0; i < 3; i++) {
        const result = await courseModel.createCourse(courses[i]);
        coursesIds.push(result._id);
      }
    });

    // after hook to clean up courses collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for filtering courses by query by name and sort by name in ascending order and return list of courses
    it('filter courses by query by name and sort by name in ascending order and return list of courses', async () => {
      // filter the courses by query title and sort by title in ascending order
      const query = { title: 'Test' };
      const result = await courseModel.filterCourses(query, [], 'title', 1);
      // check if the result is correct
      expect(result.length).to.equal(3);
      expect(result[0].title).to.equal('Test course1');
      expect(result[1].title).to.equal('Test course2');
      expect(result[2].title).to.equal('Test course3');
    });

    // Test case for filtering courses by query by price and sort by price in descending order and return list of courses
    it('filter courses by query by price and sort by price in descending order and return list of courses', async () => {
      // filter the courses by query price and sort by price in descending order
      const query = { price: 100 };
      const result = await courseModel.filterCourses(query, [], 'price', -1);
      // check if the result is correct
      expect(result.length).to.equal(2);
      expect(result[0].title).to.equal('Test course2');
      expect(result[1].title).to.equal('Test course1');
    });

    // Test case for filtering courses by query by tags and sort by createdAt in descending order and return list of courses
    it('filter courses by query by tags and sort by createdAt in descending order and return list of courses', async () => {
      // filter the courses by query tags and sort by createdAt in descending order
      const query = { tags: ['test'] };
      const result = await courseModel.filterCourses(query, ['tag1'], 'createdAt', -1);
      // check if the result is correct
      expect(result.length).to.equal(1);
      expect(result[0].title).to.equal('Test course1');
    });

    // Test case for filtering courses by query by name, price, tags with default sort and return list of courses
    it('filter courses by query by name, price, tags with default sort and return list of courses', async () => {
      // filter the courses by query name, price, tags with default sort
      const query = { title: 'Test course', price: 100 };
      const result = await courseModel.filterCourses(query, ['tag2']);
      // check if the result is correct
      expect(result.length).to.equal(1);
      expect(result[0].title).to.equal('Test course2');
      expect(result[0].price).to.equal(100);
      expect(result[0].tags).to.deep.equal(['test', 'tag2', 'course']);
    });

    // Test case for filtering courses by query by name, price, tags with invalid tag and return empty list
    it('filter courses by query by name, price, tags with invalid tag and return empty list', async () => {
      // filter the courses by query name, price, tags with invalid tag
      const query = { title: 'Test course', price: 100 };
      const result = await courseModel.filterCourses(query, ['tag4']);
      // check if the result is correct
      expect(result.length).to.equal(0);
    });

    // Test case for filtering courses by query by name, price, tags with empty query and return all courses sorted by created date
    it('filter courses by query by name, price, tags with empty query and return all courses sorted by created date', async () => {
      // filter the courses by empty query
      const result = await courseModel.filterCourses({});
      // check if the result is correct
      expect(result.length).to.equal(3);
      expect(result[0].title).to.equal('Test course3');
      expect(result[1].title).to.equal('Test course2');
      expect(result[2].title).to.equal('Test course1');
    });

    // Test case for filtering courses by query by name, price, tags with empty query with pagination and return list of courses
    it('filter courses by query by name, price, tags with empty query with pagination and return list of courses', async () => {
      // filter the courses by empty query with pagination
      const result = await courseModel.filterCourses({}, [], 'createdAt', -1, 1, 2);
      // check if the result is correct
      expect(result.length).to.equal(2);
      expect(result[0].title).to.equal('Test course3');
      expect(result[1].title).to.equal('Test course2');
      const result2 = await courseModel.filterCourses({}, [], 'createdAt', -1, 2, 2);
      // check if the result is correct
      expect(result2.length).to.equal(1);
      expect(result2[0].title).to.equal('Test course1');
    });

    // Test case for filtering courses by query by name with empty query in a transaction with session with success transaction
    it('filter courses by query by name with empty query in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // filter the courses by empty query in session
      await courseModel.filterCourses({}, [], 'createdAt', -1, 1, 2, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
    });

    // Test case for filtering courses by query by name with empty query in a transaction with session with failed transaction
    it('filter courses by query by name with empty query in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // filter the courses by empty query in session and get course by invalid courseId
        await courseModel.filterCourses({}, [], 'createdAt', -1, 1, 2, session);
        await courseModel.getCourse('621f7b9e6f3b7d1d9e9f9d4b', session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the updateCourse method with all scenarios
  describe('Test suite for updateCourse method', () => {

    // before hook to create a new course with valid fields and assign the courseId
    before(async () => {
      // create a new course with valid fields for testing updateCourse method
      const result = await courseModel.createCourse(course);
      courseId = result._id;
    });

    // after hook to clean up courses collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for updating a course with valid courseId and course data and return success message
    it('update a course with valid courseId and course data and return success message', async () => {
      // update the course with new data
      const result = await courseModel.updateCourse(courseId, { title: 'Updated course' });
      // check if the result is correct
      expect(result).to.equal('Course updated successfully');
    });

    // Test case for updating a course with invalid courseId and course data and throw an error course not found
    it('update a course with invalid courseId and course data and throw an error course not found', async () => {
      try {
        // update the course with invalid courseId
        await courseModel.updateCourse('621f7b9e6f3b7d1d9e9f9d4b', { title: 'Updated course' });
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for updating a course with valid courseId and missing required fields and throw an error missing title field
    it('update a course with valid courseId and missing required fields and throw an error missing title field', async () => {
      try {
        // update the course with missing required field
        await courseModel.updateCourse(courseId, { title: '' });
      } catch (error) {
        expect(error.message).to.equal('Missing title field');
      }
    });

    // Test case for updating a course with valid courseId and tags less than 3 and throw an error tag field must have at least 3 tags
    it('update a course with valid courseId and tags less than 3 and throw an error tag field must have at least 3 tags', async () => {
      try {
        const tags = ['test', 'tag'];
        // update the course with tags less than 3
        await courseModel.updateCourse(courseId, { tags });
      } catch (error) {
        expect(error.message).to.equal('Tags field must have at least 3 tags');
      }
    });

    // Test case for updating a course with valid courseId and course data in a transaction with session with success transaction
    it('update a course with valid courseId and course data in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // update the course with new data in session two times
      await courseModel.updateCourse(courseId, { title: 'Updated course' }, session);
      await courseModel.updateCourse(courseId, { price: 200 }, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
    });

    // Test case for updating a course with courseId and course data in a transaction with session with failed transaction
    it('update a course with courseId and course data in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // update the course with invalid data in session 3 times
        await courseModel.updateCourse(courseId, { title: 'updated 2 course' }, session);
        await courseModel.updateCourse(courseId, { title: '' }, session);
        await courseModel.updateCourse(courseId, { price: '300' }, session);
      } catch (error) {
        expect(error.message).to.equal('Missing title field');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not updated
      const result = await courseModel.getCourse(courseId);
      expect(result.title).to.equal('Updated course');
      expect(result.price).to.equal(200);
    });
  });


  // Test suite for the addLessonToCourse method with all scenarios
  describe('Test suite for addLessonToCourse method', () => {
    // variables to lesson id
    let lessonsId;

    // before hook to create course and assign it to courseId
    before(async () => {
      // create a new course with valid fields for testing addLessonToCourse method
      const result = await courseModel.createCourse(course);
      courseId = result._id;
      // assign the lesson id
      lessonsId = '621f7b9e6f3b7d1d9e9f9d4b';
    });

    // after hook to clean up courses and lessons collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for adding a lesson to a course with valid courseId and return success message
    it('add a lesson to a course with valid courseId and return success message', async () => {
      // add a lesson to the course
      const result = await courseModel.addLessonToCourse(courseId, lessonsId);
      // check if the result is correct
      expect(result).to.equal('Lesson added to course successfully');
    });

    // Test case for adding a lesson to a course with invalid courseId and throw an error course not found
    it('add a lesson to a course with invalid courseId and throw an error course not found', async () => {
      try {
        // add a lesson to the course with invalid courseId
        await courseModel.addLessonToCourse('621f7b9e6f3b7d1d9e9f9d4b', lessonsId);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for adding a lesson to a course with valid courseId in a transaction with session with success transaction
    it('add a lesson to a course with valid courseId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // add a lesson to the course in session
      await courseModel.addLessonToCourse(courseId, lessonsId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the lesson is added to the course
      const result = await courseModel.getCourse(courseId);
      expect(result.lessons.length).to.equal(2);
    });

    // Test case for adding a lesson to a course with invalid courseId in a transaction with session with failed transaction
    it('add a lesson to a course with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // add two lesson one with valid courseId and one with invalid courseId in session
        await courseModel.addLessonToCourse(courseId, lessonsId, session);
        await courseModel.addLessonToCourse('621f7b9e6f3b7d1d9e9f9d4b', lessonsId, session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the lesson is not added to the course
      const result = await courseModel.getCourse(courseId);
      expect(result.lessons.length).to.equal(2);
    });
  });


  // Test suite for the removeLessonFromCourse method with all scenarios
  describe('Test suite for removeLessonFromCourse method', () => {
    // variables to lesson id
    let lessonsId;

    // before hook to create course and assign it to courseId
    before(async () => {
      // create a new course with valid fields for testing removeLessonFromCourse method
      const result = await courseModel.createCourse(course);
      courseId = result._id;
      // assign the lesson id
      lessonsId = '621f7b9e6f3b7d1d9e9f9d4b';
      // add a lesson to the course
      await courseModel.addLessonToCourse(courseId, lessonsId);
    });

    // after hook to clean up courses and lessons collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for removing a lesson from a course with valid courseId and return success message
    it('remove a lesson from a course with valid courseId and return success message', async () => {
      // remove a lesson from the course
      const result = await courseModel.removeLessonFromCourse(courseId, lessonsId);
      // check if the result is correct
      expect(result).to.equal('Lesson removed from course successfully');
    });

    // Test case for removing a lesson from a course with invalid courseId and throw an error course not found
    it('remove a lesson from a course with invalid courseId and throw an error course not found', async () => {
      try {
        // remove a lesson from the course with invalid courseId
        await courseModel.removeLessonFromCourse('621f7b9e6f3b7d1d9e9f9d4b', lessonsId);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for removing a lesson from a course with valid courseId and lessonId not in the lessons array and return success message
    it('remove a lesson from a course with valid courseId and lessonId not in the lessons array and return success message', async () => {
      // remove a lesson from the course
      const result = await courseModel.removeLessonFromCourse(courseId, lessonsId);
      // check if the result is correct
      expect(result).to.equal('Lesson removed from course successfully');
    });

    // Test case for removing a lesson from a course with valid courseId in a transaction with session with success transaction
    it('remove a lesson from a course with valid courseId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // add a lesson to the course in session and remove it
      await courseModel.addLessonToCourse(courseId, lessonsId, session);
      await courseModel.removeLessonFromCourse(courseId, lessonsId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the lesson is removed from the course
      const result = await courseModel.getCourse(courseId);
      expect(result.lessons.length).to.equal(0);
    });

    // Test case for removing a lesson from a course with invalid courseId in a transaction with session with failed transaction
    it('remove a lesson from a course with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // add a lesson to the course in session and remove it with invalid courseId
        await courseModel.addLessonToCourse(courseId, lessonsId, session);
        await courseModel.removeLessonFromCourse('621f7b9e6f3b7d1d9e9f9d4b', lessonsId, session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the lesson is not removed from the course
      const result = await courseModel.getCourse(courseId);
      expect(result.lessons.length).to.equal(0);
    });
  });


  // Test suite for the deleteCourse method with all scenarios
  describe('Test suite for deleteCourse method', () => {

    // before hook to create course and assign it to courseId
    before(async () => {
      // create a new course with valid fields for testing deleteCourse method
      const result = await courseModel.createCourse(course);
      courseId = result._id;
    });

    // after hook to clean up courses and lessons collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for deleting a course with valid courseId and return success message
    it('delete a course with valid courseId and return success message', async () => {
      // delete the course
      const result = await courseModel.deleteCourse(courseId);
      // check if the result is correct
      expect(result).to.equal('Course deleted successfully');
    });

    // Test case for deleting a course with invalid courseId and throw an error course not found
    it('delete a course with invalid courseId and throw an error course not found', async () => {
      try {
        // delete the course with invalid courseId
        await courseModel.deleteCourse(courseId);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for deleting a course with valid courseId in a transaction with session with success transaction
    it('delete a course with valid courseId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // create a new course with valid fields and then delete it in session
      const res = await courseModel.createCourse(course, session);
      await courseModel.deleteCourse(res._id, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the course is deleted
      const result = await courseModel.course.find({});
      expect(result.length).to.equal(0);
    });

    // Test case for deleting a course with invalid courseId in a transaction with session with failed transaction
    it('delete a course with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // create a new course with valid fields and then delete it with invalid courseId in session
        await courseModel.createCourse(course, session);
        await courseModel.deleteCourse('621f7b9e6f3b7d1d9e9f9d4b', session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the course is not deleted
      const result = await courseModel.course.find({});
      expect(result.length).to.equal(0);
    });
  });


  // Test suite for the deleteAllCoursesByAuthorId method with all scenarios
  describe('Test suite for deleteAllCoursesByAuthorId method', () => {

    // before hook to create 2 courses
    beforeEach(async () => {
      // create 2 courses with valid fields
      await courseModel.createCourse(course);
      await courseModel.createCourse(course);
    });

    // after hook to clean up courses and lessons collection after test suite done
    afterEach(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for deleting all courses by authorId with valid authorId and return success message
    it('delete all courses by authorId with valid authorId and return success message', async () => {
      // delete all courses by authorId
      const result = await courseModel.deleteAllCoursesByAuthorId(course.authorId);
      // check if the result is correct
      expect(result).to.equal('Courses deleted successfully');
      // check if the courses are deleted
      const result2 = await courseModel.course.find({});
      expect(result2.length).to.equal(0);
    });

    // Test case for deleting all courses by authorId not in the courses return success message with no courses deleted
    it('delete all courses by authorId not in the courses return success message with no courses deleted', async () => {
      // delete all courses by authorId not in the courses
      const result = await courseModel.deleteAllCoursesByAuthorId('621f7b9e6f3b7d1d9e9f9d546544');
      // check if the result is correct
      expect(result).to.equal('Courses deleted successfully');
      // check if the courses are not deleted
      const result2 = await courseModel.course.find({});
      expect(result2.length).to.equal(2);
    });

    // Test case for deleting all courses by authorId with valid authorId in a transaction with session with success transaction
    it('delete all courses by authorId with valid authorId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      await courseModel.deleteAllCoursesByAuthorId(course.authorId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the courses are deleted
      const result = await courseModel.course.find({});
      expect(result.length).to.equal(0);
    });

    // Test case for deleting all courses by in a transaction with session with failed transaction
    it('delete all courses by authorId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // delete all courses by authorId then get course by invalid courseId in session
        await courseModel.deleteAllCoursesByAuthorId(course.authorId, session);
        await courseModel.getCourse('621f7b9e6f3b7d1d9e9f9d4b', session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the courses are not deleted
      const result = await courseModel.course.find({});
      expect(result.length).to.equal(2);
    });
  });


  // Test suite for the addNewStudentToCourse method with all scenarios
  describe('Test suite for addNewStudentToCourse method', () => {
    // variable to store student id
    let studentId;

    // before hook to create course and assign it to courseId
    before(async () => {
      // create a new course with valid fields
      const result = await courseModel.createCourse(course);
      courseId = result._id;
      // student id
      studentId = '621f7b9e6f3b7d1d9e9f9d4b';
    });

    // after hook to clean up courses and lessons collection after test suite done
    after(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for adding a new student to a course with valid courseId and return success message
    it('add a new student to a course with valid courseId and return success message', async () => {
      // add a new student to the course
      const result = await courseModel.addNewStudentToCourse(courseId, studentId);
      // check if the result is correct
      expect(result).to.equal('Student added to course successfully');
      // check if the student is added to the course
      const course = await courseModel.getCourse(courseId);
      expect(course.students.length).to.equal(1);
    });

    // Test case for adding a new student to a course with invalid courseId and throw an error course not found
    it('add a new student to a course with invalid courseId and throw an error course not found', async () => {
      try {
        // add a new student to the course with invalid courseId
        await courseModel.addNewStudentToCourse('621f7b9e6f3b7d1d9e9f9d4b', studentId);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for adding a new student to a course with valid courseId in a transaction with session with success transaction
    it('add a new student to a course with valid courseId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // add a new student to the course in session
      await courseModel.addNewStudentToCourse(courseId, studentId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the student is added to the course
      const result = await courseModel.getCourse(courseId);
      expect(result.students.length).to.equal(2);
    });

    // Test case for adding a new student to a course with invalid courseId in a transaction with session with failed transaction
    it('add a new student to a course with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // add 2 students one with valid courseId and one with invalid courseId in session
        await courseModel.addNewStudentToCourse(courseId, studentId, session);
        await courseModel.addNewStudentToCourse('621f7b9e6f3b7d1d9e9f9d4b', studentId, session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the student is not added to the course
      const result = await courseModel.getCourse(courseId);
      expect(result.students.length).to.equal(2);
    });
  });


  // Test suite for the removeStudentFromCourse method with all scenarios
  describe('Test suite for removeStudentFromCourse method', () => {
    // variable to store student id
    let studentId;

    // before hook to create course and assign it to courseId and add a student to the course before each test case
    beforeEach(async () => {
      // create a new course with valid fields
      const result = await courseModel.createCourse(course);
      courseId = result._id;
      // student id
      studentId = '621f7b9e6f3b7d1d9e9f9d4b';
      // add a student to the course
      await courseModel.addNewStudentToCourse(courseId, studentId);
    });

    // after hook to clean up courses and lessons collection after each test case
    afterEach(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for removing a student from a course with valid courseId and return success message
    it('remove a student from a course with valid courseId and return success message', async () => {
      // remove a student from the course
      const result = await courseModel.removeStudentFromCourse(courseId, studentId);
      // check if the result is correct
      expect(result).to.equal('Student removed from course successfully');
      // check if the student is removed from the course
      const course = await courseModel.getCourse(courseId);
      expect(course.students.length).to.equal(0);
    });

    // Test case for removing a student from a course with invalid courseId and throw an error course not found
    it('remove a student from a course with invalid courseId and throw an error course not found', async () => {
      try {
        // remove a student from the course with invalid courseId
        await courseModel.removeStudentFromCourse('621f7b9e6f3b7d1d9e9f9d4b', studentId);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for removing a student from a course with valid courseId and studentId not in the students array and return success message
    it('remove a student from a course with valid courseId and studentId not in array and return success message', async () => {
      // remove a student from the course
      const result = await courseModel.removeStudentFromCourse(courseId, '54854321468143213265');
      // check if the result is correct
      expect(result).to.equal('Student removed from course successfully');
      // check if the student is removed from the course
      const result2 = await courseModel.getCourse(courseId);
      expect(result2.students.length).to.equal(1);
    });

    // Test case for removing a student from a course with valid courseId in a transaction with session with success transaction
    it('remove a student from a course with valid courseId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // remove a student from the course in session
      await courseModel.removeStudentFromCourse(courseId, studentId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the student is removed from the course
      const result = await courseModel.getCourse(courseId);
      expect(result.students.length).to.equal(0);
    });

    // Test case for removing a student from a course with invalid courseId in a transaction with session with failed transaction
    it('remove a student from a course with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // remove a student with valid courseId and one with invalid courseId in session
        await courseModel.removeStudentFromCourse(courseId, studentId, session);
        await courseModel.removeStudentFromCourse('621f7b9e6f3b7d1d9e9f9d4b', studentId, session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the student is not removed from the course
      const result = await courseModel.getCourse(courseId);
      expect(result.students.length).to.equal(1);
    });
  });


  // Test suite for the addReviewToCourse method with all scenarios
  describe('Test suite for addReviewToCourse method', () => {
    // variables to store review data
    let review;

    // before hook to create course and assign it to courseId and review data before each test case
    beforeEach(async () => {
      // create a new course with valid fields
      const result = await courseModel.createCourse(course);
      courseId = result._id;
      // review data
      review = { id: '621f7b9e6f3b7d1d9e9f9d4b', rating: 4 };
    });

    // after hook to clean up courses and lessons collection after each test case
    afterEach(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for adding a review to a course with valid courseId and review data and return success message
    it('add a review to a course with valid courseId and review data and return success message', async () => {
      // add a review to the course
      const result = await courseModel.addReviewToCourse(courseId, review.id, review.rating);
      // check if the result is correct
      expect(result).to.equal('Review added to course successfully');
      // check if the review is added to the course
      const result2 = await courseModel.getCourse(courseId);
      expect(result2.reviews.length).to.equal(1);
      expect(result2.sumReviews).to.equal(4);
      expect(result2.courseAvgRating).to.equal(4);
    });

    // Test case for adding a review to a course with invalid courseId and throw an error course not found
    it('add a review to a course with invalid courseId and throw an error course not found', async () => {
      try {
        // add a review to the course with invalid courseId
        await courseModel.addReviewToCourse('621f7b9e6f3b7d1d9e9f9d4b', review.id, review.rating);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for adding 2 reviews to a course and check total sum of reviews and courseAvg Rating
    it('add 2 reviews to a course and check total sum of reviews and courseAvg Rating', async () => {
      // add a review to the course
      await courseModel.addReviewToCourse(courseId, review.id, review.rating);
      await courseModel.addReviewToCourse(courseId, review.id, 5);
      // check if the review is added to the course
      const result = await courseModel.getCourse(courseId);
      expect(result.reviews.length).to.equal(2);
      expect(result.sumReviews).to.equal(9);
      expect(result.courseAvgRating).to.equal(4.5);
    });

    // Test case for adding a review to a course with valid courseId in a transaction with session with success transaction
    it('add a review to a course with valid courseId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // add a review to the course in session
      await courseModel.addReviewToCourse(courseId, review.id, review.rating, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the review is added to the course
      const result = await courseModel.getCourse(courseId);
      expect(result.reviews.length).to.equal(1);
      expect(result.sumReviews).to.equal(4);
      expect(result.courseAvgRating).to.equal(4);
    });

    // Test case for adding a review to a course with invalid courseId in a transaction with session with failed transaction
    it('add a review to a course with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // add a review with valid courseId and one with invalid courseId in session
        await courseModel.addReviewToCourse(courseId, review.id, review.rating, session);
        await courseModel.addReviewToCourse('621f7b9e6f3b7d1d9e9f9d4b', review.id, review.rating, session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the review is not added to the course
      const result = await courseModel.getCourse(courseId);
      expect(result.reviews.length).to.equal(0);
      expect(result.sumReviews).to.equal(0);
      expect(result.courseAvgRating).to.equal(0);
    });
  });


  // Test suite for the removeReviewFromCourse method with all scenarios
  describe('Test suite for removeReviewFromCourse method', () => {
    // variables to store review data
    let review;

    // before hook to create course and assign it to courseId and review data before each test case
    beforeEach(async () => {
      // create a new course with valid fields
      const result = await courseModel.createCourse(course);
      courseId = result._id;
      // review data
      review = { id: '621f7b9e6f3b7d1d9e9f9d4b', rating: 4 };
      // add a review to the course
      await courseModel.addReviewToCourse(courseId, review.id, review.rating);
    });

    // after hook to clean up courses and lessons collection after each test case
    afterEach(async () => {
      await courseModel.course.deleteMany({});
    });

    // Test case for removing a review from a course with valid courseId and return success message
    it('remove a review from a course with valid courseId and return success message', async () => {
      // remove a review from the course
      const result = await courseModel.removeReviewFromCourse(courseId, review.id, review.rating);
      // check if the result is correct
      expect(result).to.equal('Review removed from course successfully');
      // check if the review is removed from the course
      const result2 = await courseModel.getCourse(courseId);
      expect(result2.reviews.length).to.equal(0);
      expect(result2.sumReviews).to.equal(0);
      expect(result2.courseAvgRating).to.equal(0);
    });

    // Test case for removing a review from a course with invalid courseId and throw an error course not found
    it('remove a review from a course with invalid courseId and throw an error course not found', async () => {
      try {
        // remove a review from the course with invalid courseId
        await courseModel.removeReviewFromCourse('621f7b9e6f3b7d1d9e9f9d4b', review.id, review.rating);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for removing a review from a course with valid courseId and reviewId not in the reviews array and return success message
    it('remove a review from a course with valid courseId and reviewId not in array and return success message', async () => {
      try {
        await courseModel.removeReviewFromCourse(courseId, '54854321468143213265', 5);
      } catch (error) {
        expect(error.message).to.equal('Review not found in course');
      }
    });

    // Test case for removing a review from a course with valid courseId in a transaction with session with success transaction
    it('remove a review from a course with valid courseId in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // remove a review from the course in session
      await courseModel.removeReviewFromCourse(courseId, review.id, review.rating, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      // check if the review is removed from the course
      const result = await courseModel.getCourse(courseId);
      expect(result.reviews.length).to.equal(0);
      expect(result.sumReviews).to.equal(0);
      expect(result.courseAvgRating).to.equal(0);
    });

    // Test case for removing a review from a course with invalid courseId in a transaction with session with failed transaction
    it('remove a review from a course with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // remove a review with valid courseId and one with invalid courseId in session
        await courseModel.removeReviewFromCourse(courseId, review.id, review.rating, session);
        await courseModel.removeReviewFromCourse('621f7b9e6f3b7d1d9e9f9d4b', review.id, review.rating, session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the review is not removed from the course
      const result = await courseModel.getCourse(courseId);
      expect(result.reviews.length).to.equal(1);
      expect(result.sumReviews).to.equal(4);
      expect(result.courseAvgRating).to.equal(4);
    });
  });


}).timeout(15000); // increase the timeout to 15 seconds
