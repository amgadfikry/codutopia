import { expect } from "chai";
import mongoDB, { lessonModel, lessonContentModel } from "../../../databases/mongoDB.js";

// Test suite for to test all the methods in the lessonModel class
describe("LessonModel", () => {
  // Declare variables to be used across all the tests
  let lesson;

  // Before hook to prepare the data before each test suite
  beforeEach(() => {
    // Create a new lesson object
    lesson = {
      title: "Test lesson",
      sectionId: "6660fee3b58fe3208a9b8b55",
      courseId: "6660fee3b58fe3208a9b8b55",
      description: "Test lesson description",
      timeToFinish: 20,
    };
  });

  // After hook to clean up lessons collection after each test suite
  afterEach(async () => {
    // Delete the lessons from the database
    await lessonModel.lesson.deleteMany({});
  });


  // Test suite for the createLesson method with all scenarios
  describe("Test suite for createLesson method", () => {

    // Test case for creating a new lesson with valid fields and return the lesson object
    it("create a new lesson with valid fields and return the lesson object", async () => {
      const result = await lessonModel.createLesson(lesson);
      // check results is correct
      expect(result).to.be.an("object");
      expect(result.title).to.equal(lesson.title);
      expect(result.courseId).to.equal(lesson.courseId);
      expect(result.description).to.equal(lesson.description);
      expect(result.timeToFinish).to.equal(lesson.timeToFinish);
    });

    // Test case for creating a new lesson with missing required fields and throw an error
    it("create a new lesson with missing required fields and throw an error", async () => {
      try {
        // Create a new lesson object with missing title field
        const tempLesson = { ...lesson };
        delete tempLesson.title;
        await lessonModel.createLesson(tempLesson);
      }
      catch (error) {
        expect(error.message).to.equal("Missing title field");
      }
    });

    // Test case for creating a 2 new lesson in a transaction with session with success transaction
    it("create 2 new lesson in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Create 2 new lesson objects
      await lessonModel.createLesson(lesson, session);
      await lessonModel.createLesson(lesson, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if all lessons are created in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(2);
    });

    // Test case for creating a 2 new lesson in a transaction with session with failed transaction
    it("create 2 new lesson in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Create 2 new lesson objects one with missing required field and one with valid fields
        await lessonModel.createLesson(lesson, session);
        const tempLesson = { ...lesson };
        delete tempLesson.title;
        await lessonModel.createLesson(tempLesson, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Missing title field");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if all lessons are created in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(0);
    });
  });


  // Test suite for the addContentToLesson method with all scenarios
  describe("Test suite for addContentToLesson method", () => {
    // variable to save lessonId
    let lessonId;
    let contentId;

    // before hook to create a new lesson before each test case
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
      contentId = "6660fee3b58fe3208a9b8b55";
    });

    // Test case for adding content to a lesson with valid lessonId and valid contentId and return a message that the content is added
    it("add content to a lesson with valid lessonId and valid contentId and return a message that the content is added", async () => {
      // create a new lesson content object
      const result = await lessonModel.addContentToLesson(lessonId, contentId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Content added to the lesson successfully");
    });

    // Test case for adding content to a lesson with invalid lessonId and valid contentId and throw an error
    it("add content to a lesson with invalid lessonId and valid contentId and throw an error", async () => {
      try {
        await lessonModel.addContentToLesson("6660fee3b58fe3208a9b8b55", contentId);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for adding content to a lesson with valid and twice with the same contentId and return a message that the content is added
    it("add content to a lesson with valid and twice with the same contentId and return a message that the content is added", async () => {
      // add content to the lesson in the database twice
      await lessonModel.addContentToLesson(lessonId, contentId);
      await lessonModel.addContentToLesson(lessonId, contentId);
      //check if the content is added to the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.content.length).to.equal(1);
    });

    // Test case for adding content to a lesson with valid lessonId in a transaction with session with success transaction
    it("add content to a lesson with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // add content to the lesson in the database twice
      await lessonModel.addContentToLesson(lessonId, contentId, session);
      await lessonModel.addContentToLesson(lessonId, '6660fee3b58fe3208a9b8b66', session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if the content is added to the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.content.length).to.equal(2);
    });

    // Test case for adding content to a lesson with valid lessonId in a transaction with session with failed transaction
    it("add content to a lesson with valid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // add content to the lesson in the database twice one with invalid lessonId
        await lessonModel.addContentToLesson(lessonId, contentId, session);
        await lessonModel.addContentToLesson("6660fee3b58fe3208a9b8b55", contentId, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if the content is not added to the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.content.length).to.equal(0);
    });
  });


  // Test suite for the removeContentFromLesson method with all scenarios
  describe("Test suite for removeContentFromLesson method", () => {
    // variable to save lessonId
    let lessonId;
    let contentId;

    // before hook to create a new lesson before each test case and add content to the lesson
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
      contentId = "6660fee3b58fe3208a9b8b55";
      // add the content to the lesson
      await lessonModel.addContentToLesson(lessonId, contentId);
    });

    // Test case for removing content from a lesson with valid lessonId and return a message that the content is removed
    it("remove content from a lesson with valid lessonId and return a message that the content is removed", async () => {
      const result = await lessonModel.removeContentFromLesson(lessonId, contentId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Content removed from the lesson successfully");
    });

    // Test case for removing content from a lesson with invalid lessonId and valid contentId and throw an error
    it("remove content from a lesson with invalid lessonId and valid contentId and throw an error", async () => {
      try {
        await lessonModel.removeContentFromLesson("6660fee3b58fe3208a9b8b55", contentId);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for removing content from a lesson with valid lessonId in a transaction with session with success transaction
    it("remove content from a lesson with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // remove the content from the lesson in the database
      await lessonModel.removeContentFromLesson(lessonId, contentId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if the content is removed from the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.content.length).to.equal(0);
    });

    // Test case for removing content from a lesson with valid lessonId in a transaction with session with failed transaction
    it("remove content from a lesson with valid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // remove the content from the lesson in the database twice
        await lessonModel.removeContentFromLesson(lessonId, contentId, session);
        await lessonModel.removeContentFromLesson('6660fee3b58fe3208a9b8b66', contentId, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if the content is not removed from the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.content.length).to.equal(1);
    });
  });


  // Test suite for the getAllLessonsIdsByCourseId method with all scenarios
  describe("Test suite for getAllLessonsIdsByCourseId method", () => {
    // variable to save lessonId
    let lessonId1;
    let lessonId2;

    // before hook to create a new lesson before each test case
    beforeEach(async () => {
      const result1 = await lessonModel.createLesson(lesson);
      lessonId1 = result1._id;
      const result2 = await lessonModel.createLesson(lesson);
      lessonId2 = result2._id;
    });

    // Test case for getting all lessons by courseId with valid courseId and return an array of lessons
    it("get all lessons by courseId with valid courseId and return an array of lessons", async () => {
      const result = await lessonModel.getAllLessonsIdsByCourseId(lesson.courseId);
      // check if the result is correct
      expect(result).to.be.an("array");
      expect(result.length).to.equal(2);
      expect(String(result[0])).to.equal(String(lessonId1));
      expect(String(result[1])).to.equal(String(lessonId2));
    });

    // Test case for getting all lessons by courseId with invalid courseId and return an empty array
    it("get all lessons by courseId with invalid courseId and return an empty array", async () => {
      const result = await lessonModel.getAllLessonsIdsByCourseId("6660fee3b58fe3208a9b8b95");
      // check if the result is correct
      expect(result).to.be.an("array");
      expect(result.length).to.equal(0);
    });

    // Test case for getting all lessons by courseId with valid courseId in a transaction with session with success transaction
    it("get all lessons by courseId with valid courseId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // get all lessons by courseId in the transaction
      const result = await lessonModel.getAllLessonsIdsByCourseId(lesson.courseId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if all lessons are returned from the database
      expect(result).to.be.an("array");
      expect(result.length).to.equal(2);
    });
  });


  // Test suite for the updateLesson method with all scenarios
  describe("Test suite for updateLesson method", () => {
    // variable to save lessonId
    let lessonId;

    // before hook to create a new lesson before each test start and save the lessonId
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
    });

    // Test case for updating a lesson with valid lessonId and valid data and return the updated lesson object
    it("update a lesson with valid lessonId and valid data and return the updated lesson object", async () => {
      // object of updated fields and update the lesson in the database
      const updatedData = { title: "Updated lesson", timeToFinish: 30 };
      const result = await lessonModel.updateLesson(lessonId, updatedData);
      // check if the result is correct
      expect(result).to.be.an("object");
      expect(result.title).to.equal(updatedData.title);
      expect(result.timeToFinish).to.equal(updatedData.timeToFinish);
      expect(result.description).to.equal(lesson.description);
      expect(result.courseId).to.equal(lesson.courseId);
    });

    // Test case for updating a lesson with invalid lessonId and valid data and throw an error
    it("update a lesson with invalid lessonId and valid data and throw an error", async () => {
      try {
        await lessonModel.updateLesson('6660fee3b58fe3208a9b8b55', lesson);
      }
      catch (error) {
        expect(error.message).to.equal("Failed to update lesson");
      }
    });

    // Test case for updating a lesson with valid lessonId and missing required field and throw an error
    it("update a lesson with valid lessonId and missing required field and throw an error", async () => {
      try {
        // object of updated fields and update the lesson in the database with missing title field
        const updatedData = { title: '', timeToFinish: 40 };
        await lessonModel.updateLesson(lessonId, updatedData);
      }
      catch (error) {
        expect(error.message).to.equal("Missing title field");
      }
    });

    // Test case for updating a lesson with valid lessonId in a transaction with session with success transaction
    it("update a lesson with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // object of updated fields and update the lesson in the database twice with different fields
      const updatedData = { timeToFinish: 50 };
      await lessonModel.updateLesson(lessonId, updatedData, session);
      updatedData.title = "Updated lesson 2";
      await lessonModel.updateLesson(lessonId, updatedData, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if all lesson are updated in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.title).to.equal(updatedData.title);
      expect(result.timeToFinish).to.equal(updatedData.timeToFinish);
    });

    // Test case for updating a lesson with valid lessonId in a transaction with session with failed transaction
    it("update a lesson with invalid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // object of updated fields and update the lesson in the database twice one with invalid lessonId
        const updatedData = { timeToFinish: 80 };
        await lessonModel.updateLesson(lessonId, updatedData, session);
        await lessonModel.updateLesson("6660fee3b58fe3208a9b8b55", updatedData, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Failed to update lesson");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if all lesson are not updated in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.timeToFinish).to.not.equal(80);
    });
  });


  // Test suite for the addQuizToLesson method with all scenarios
  describe("Test suite for addQuizToLesson method", () => {
    // variable to save quizId, lessonId
    let quizId;
    let lessonId;

    // before hook to create a new lesson before each test start and save the lessonId
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
      // define a new quizId
      quizId = "6660fee3b58fe3208a9b8b55";
    });

    // Test case for adding a quiz to a lesson with valid lessonId and valid quizId and return a message that the quiz is added
    it("add a quiz to a lesson with valid lessonId and valid quizId and return a message that the quiz is added", async () => {
      const result = await lessonModel.addQuizToLesson(lessonId, quizId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Quiz added to the lesson successfully");
    });

    // Test case for adding a quiz to a lesson with invalid lessonId and valid quizId and throw an error
    it("add a quiz to a lesson with invalid lessonId and valid quizId and throw an error", async () => {
      try {
        await lessonModel.addQuizToLesson("6660fee3b58fe3208a9b8b55", quizId);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for adding a quiz to a lesson with valid lessonId in a transaction with session with success transaction
    it("add a quiz to a lesson with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // add a quiz to the lesson in the database twice
      await lessonModel.addQuizToLesson(lessonId, quizId, session);
      await lessonModel.addQuizToLesson(lessonId, '6660fee3b58fe3208a9b8b66', session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if the quiz is added to the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.quiz).to.not.equal(quizId);
    });

    // Test case for adding a quiz to a lesson with valid lessonId in a transaction with session with failed transaction
    it("add a quiz to a lesson with valid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // add a quiz to the lesson in the database twice one with invalid lessonId
        await lessonModel.addQuizToLesson(lessonId, quizId, session);
        await lessonModel.addQuizToLesson("6660fee3b58fe3208a9b8b55", quizId, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if the quiz is not added to the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.quiz).to.equal(null);
    });
  });


  // Test suite for the removeQuizFromLesson method with all scenarios
  describe("Test suite for removeQuizFromLesson method", () => {
    // variable to save quizId, lessonId
    let quizId;
    let lessonId;

    // before hook to create a new lesson before each test start and save the lessonId
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
      // define a new quizId
      quizId = "6660fee3b58fe3208a9b8b55";
      // add the quiz to the lesson
      await lessonModel.addQuizToLesson(lessonId, quizId);
    });

    // Test case for removing a quiz from a lesson with valid lessonId and return a message that the quiz is removed
    it("remove a quiz from a lesson with valid lessonId and return a message that the quiz is removed", async () => {
      const result = await lessonModel.removeQuizFromLesson(lessonId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Quiz removed from the lesson successfully");
    });

    // Test case for removing a quiz from a lesson with invalid lessonId and throw an error
    it("remove a quiz from a lesson with invalid lessonId and throw an error", async () => {
      try {
        await lessonModel.removeQuizFromLesson("6660fee3b58fe3208a9b8b55");
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for removing a quiz from a lesson with valid lessonId in a transaction with session with success transaction
    it("remove a quiz from a lesson with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // remove the quiz from the lesson in the database
      await lessonModel.removeQuizFromLesson(lessonId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if the quiz is removed from the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.quiz).to.equal(null);
    });

    // Test case for removing a quiz from a lesson with valid lessonId in a transaction with session with failed transaction
    it("remove a quiz from a lesson with valid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // remove the quiz from the lesson in the database twice
        await lessonModel.removeQuizFromLesson(lessonId, session);
        await lessonModel.removeQuizFromLesson('6660fee3b58fe3208a9b8b66', session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if the quiz is not removed from the lesson in the database
      const result = await lessonModel.lesson.findById(lessonId);
      expect(result.quiz).to.equal(quizId);
    });
  });


  // Test suite for the deleteLesson method with all scenarios
  describe("Test suite for deleteLesson method", () => {
    // variable to save lessonId
    let lessonId;

    // before hook to create a new lesson before each test start and save the lessonId
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
    });

    // Test case for deleting a lesson with valid lessonId and return deleted lesson object data
    it("delete a lesson with valid lessonId and return deleted lesson object data", async () => {
      const result = await lessonModel.deleteLesson(lessonId);
      // check if the result is correct
      expect(result).to.be.an("object");
      expect(result.title).to.equal(lesson.title);
      expect(result.courseId).to.equal(lesson.courseId);
      expect(result.description).to.equal(lesson.description);
      expect(result.timeToFinish).to.equal(lesson.timeToFinish);
    });

    // Test case for deleting a lesson with invalid lessonId and throw an error
    it("delete a lesson with invalid lessonId and throw an error", async () => {
      try {
        await lessonModel.deleteLesson("6660fee3b58fe3208a9b8b55");
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found or could not be deleted");
      }
    });

    // Test case for deleting a lesson with valid lessonId in a transaction with session with success transaction
    it("delete a lesson with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      //  delete it in the transaction
      await lessonModel.deleteLesson(lessonId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if the lesson is deleted from the database
      // check number of lessons in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(0);
    });

    // Test case for deleting a lesson with valid lessonId in a transaction with session with failed transaction
    it("delete a lesson with invalid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // delete the lesson in the database twice
        await lessonModel.deleteLesson(lessonId, session);
        await lessonModel.deleteLesson(lessonId, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found or could not be deleted");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if the lesson is not created in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(1);
    });
  });


  // Test suite for the deleteAllLessonsBySectionId method with all scenarios
  describe("Test suite for deleteAllLessonsBySectionId method", () => {

    // before hook to create a new lesson before each test start and save the lessonId
    beforeEach(async () => {
      await lessonModel.createLesson(lesson);
    });

    // Test case for deleting all lessons by sectionId with valid sectionId and return a message that the lessons are deleted
    it("delete all lessons by sectionId with valid sectionId and return a message that the lessons are deleted", async () => {
      // delete all lessons by sectionId
      const result = await lessonModel.deleteAllLessonsBySectionId(lesson.sectionId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Lessons deleted successfully");
      // check number of lessons in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(0);
    });

    // Test case for deleting all lessons by sectionId with invalid sectionId and check number of lessons in the database
    it("delete all lessons by sectionId with invalid sectionId and check number of lessons in the database", async () => {
      await lessonModel.deleteAllLessonsBySectionId("6660fee3b58fe3208a9b8b95");
      // check number of lessons in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(1);
    });

    // Test case for deleting all lessons by sectionId with valid sectionId in a transaction with session with success transaction
    it("delete all lessons by sectionId with valid sectionId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // delete all lessons by sectionId in the transaction
      await lessonModel.deleteAllLessonsBySectionId(lesson.sectionId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if all lessons are deleted from the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(0);
    });
  });


  // Test suite for the deleteAllLessonsByCourseId method with all scenarios
  describe("Test suite for deleteAllLessonsByCourseId method", () => {

    // before hook to create a new lesson before each test start and save the lessonId
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
    });

    // Test case for deleting all lessons by courseId with valid courseId and return a message that the lessons are deleted
    it("delete all lessons by courseId with valid courseId and return a message that the lessons are deleted", async () => {
      // delete all lessons by courseId
      const result = await lessonModel.deleteAllLessonsByCourseId(lesson.courseId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Lessons deleted successfully");
      // check number of lessons in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(0);
    });

    // Test case for deleting all lessons by courseId with invalid courseId and check number of lessons in the database
    it("delete all lessons by courseId with invalid courseId and check number of lessons in the database", async () => {
      await lessonModel.deleteAllLessonsByCourseId("6660fee3b58fe3208a9b8b95");
      // check number of lessons in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(1);
    });

    // Test case for deleting all lessons by courseId with valid courseId in a transaction with session with success transaction
    it("delete all lessons by courseId with valid courseId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // delete all lessons by courseId in the transaction
      await lessonModel.deleteAllLessonsByCourseId(lesson.courseId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if all lessons are deleted from the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(0);
    });
  });

}).timeout(10000);
