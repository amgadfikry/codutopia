import mongoDB, { lessonModel, courseModel } from "../../../databases/mongoDB.js";
import { expect } from "chai";

// Test suite for the courseLesson integration tests
describe("courseLesson integration tests", () => {

  // after Each test clear lessons and courses collections
  afterEach(async () => {
    await lessonModel.lesson.deleteMany({});
    await courseModel.course.deleteMany({});
  });


  // Test suite for getCourseWithLessons method with all scenarios
  describe('Test suite for getCourseWithLessons method', () => {
    // variables to courseId and courseData
    let courseId;
    let sectionId;
    let courseData;
    let sectionData;
    let lessonData1;
    let lessonData2;

    // before hook to create a new course with valid fields and assign the courseId
    beforeEach(async () => {
      courseData = {
        title: 'Test course',
        description: 'This is a test course',
        tags: ['test', 'course', 'tag'],
        authorId: '621f7b9e6f3b7d1d9e9f9d4b',
        price: 100,
        discount: 0,
        image: 'test.jpg',
      };
      // create new course and assign the courseId
      const result = await courseModel.createCourse(courseData);
      courseId = result._id;
      // create section and assign the sectionId
      sectionData = { title: 'Test section', description: 'This is a test section' };
      const createSection = await courseModel.addSectionToCourse(courseId, sectionData);
      sectionId = createSection._id;
      // create 2 lessons and add lesson to the section
      lessonData1 = { title: 'Test lesson1', description: 'This is a test lesson1', courseId, timeToFinish: 10, sectionId };
      lessonData2 = { title: 'Test lesson2', description: 'This is a test lesson2', courseId, timeToFinish: 20, sectionId };
      const lesson1 = await lessonModel.createLesson(lessonData1);
      const lesson2 = await lessonModel.createLesson(lessonData2);
      await courseModel.addLessonToSection(courseId, sectionId, lesson1._id);
      await courseModel.addLessonToSection(courseId, sectionId, lesson2._id);
    });

    // Test case for getting course details by courseId and return course data successfully
    it('get course details by courseId and return course data successfully', async () => {
      // get the course details
      const result = await courseModel.getCourseWithLessons(courseId);
      // check if the result is correct
      expect(result.title).to.equal(courseData.title);
      expect(result.description).to.equal(courseData.description);
      expect(result.tags).to.deep.equal(courseData.tags);
      expect(result.authorId).to.equal(courseData.authorId);
      expect(result.price).to.equal(courseData.price);
      expect(result.discount).to.equal(courseData.discount);
      expect(result.image).to.equal(courseData.image);
      expect(result.sections.length).to.equal(1);
      expect(result.sections[0].title).to.equal(sectionData.title);
      expect(result.sections[0].description).to.equal(sectionData.description);
      expect(result.sections[0].lessons.length).to.equal(2);
      expect(result.sections[0].lessons[0].title).to.equal(lessonData1.title);
      expect(result.sections[0].lessons[0].description).to.equal(lessonData1.description);
      expect(result.sections[0].lessons[0].timeToFinish).to.equal(lessonData1.timeToFinish);
      expect(result.sections[0].lessons[1].title).to.equal(lessonData2.title);
      expect(result.sections[0].lessons[1].description).to.equal(lessonData2.description);
      expect(result.sections[0].lessons[1].timeToFinish).to.equal(lessonData2.timeToFinish);
    });

    // Test case for getting course details with invalid courseId and throw an error course not found
    it('get course details with invalid courseId and throw an error course not found', async () => {
      try {
        // get the course details with invalid courseId
        await courseModel.getCourseWithLessons('621f7b9e6f3b7d1d9e9f9d4b');
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for getting course details with valid courseid in a transaction with session with success transaction
    it('get course details with valid courseid in a transaction with success transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      // get the course details in session
      await courseModel.getCourseWithLessons(courseId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting course details with invalid courseId in a transaction with session with failed transaction
    it('get course details with invalid courseId in a transaction with failed transaction', async () => {
      // start a new session
      const session = await mongoDB.startSession();
      try {
        // get the course details with invalid courseId in session
        await courseModel.getCourseWithLessons('621f7b9e6f3b7d1d9e9f9d4b', session);
        await mongoDB.commitTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });

  });

}).timeout(5000);
