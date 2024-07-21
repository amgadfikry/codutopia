import { expect } from "chai";
import mongoDB, { lessonModel, lessonContentModel } from "../../../databases/mongoDB.js";

// Test suite for to test all the methods in the lessonModel class
describe("LessonModel", () => {
  // Declare variables to be used across all the tests
  let lesson;
  let lessonContent;

  // Before hook to prepare the data before each test suite
  beforeEach(() => {
    // Create a new lesson object
    lesson = {
      title: "Test lesson",
      courseId: "6660fee3b58fe3208a9b8b55",
      description: "Test lesson description",
      timeToFinish: 20,
    };
    // Create a new lesson content object
    lessonContent = {
      title: "Test lesson content",
      type: "text",
      value: "Test lesson content value",
    };
  });

  // After hook to clean up lessons collection after each test suite
  afterEach(async () => {
    // Delete the lessons from the database
    await lessonModel.lesson.deleteMany({});
  });


  // Test suite for the createLesson method with all scenarios
  describe("Test suite for createLesson method", () => {

    // after hook to clean up lessons collection after each test case
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
    });

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

    // after hook to clean up lessons collection after each test case
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
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

    // after hook to clean up lessons collection after each test case
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
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


  // Test suite for the getLessonWithContent method with all scenarios
  describe("Test suite for getLessonWithContent method", () => {
    // variable to save lessonId
    let lessonId;

    // before hook to create a new lesson before each test case and create content for the lesson
    beforeEach(async () => {
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
      // pass the lessonId to the lessonContent object
      lessonContent.lessonId = lessonId;
      // create a new lesson content object
      const content = await lessonContentModel.createLessonContent(lessonContent);
      // add the content to the lesson
      await lessonModel.addContentToLesson(lessonId, content._id);
    });

    // after hook to clean up lessons collection after each test case
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
    });

    // Test case for getting a lesson with valid lessonId and return the lesson object with content
    it("get a lesson with valid lessonId and return the lesson object with content", async () => {
      const result = await lessonModel.getLessonWithContent(lessonId);
      // check if the result is correct
      expect(result).to.be.an("object");
      expect(result.title).to.equal(lesson.title);
      expect(result.courseId).to.equal(lesson.courseId);
      expect(result.description).to.equal(lesson.description);
      expect(result.timeToFinish).to.equal(lesson.timeToFinish);
      expect(result.content.length).to.equal(1);
      expect(result.content[0].title).to.equal(lessonContent.title);
      expect(result.content[0].type).to.equal(lessonContent.type);
      expect(result.content[0].value).to.equal(lessonContent.value);
    });

    // Test case for getting a lesson with invalid lessonId and throw an error
    it("get a lesson with invalid lessonId and throw an error", async () => {
      try {
        await lessonModel.getLessonWithContent("6660fee3b58fe3208a9b8b55");
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for getting lessons with valid lessonId in a transaction with session with success transaction
    it("get lessons with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // get lessons from the database with valid lessonId twice
      await lessonModel.getLessonWithContent(lessonId, session);
      await lessonModel.getLessonWithContent(lessonId, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting lessons with invalid lessonId in a transaction with session with failed transaction
    it("get lessons with invalid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // get lessons from the database with valid lessonId, with invalid lessonId
        await lessonModel.getLessonWithContent(lessonId, session);
        await lessonModel.getLessonWithContent("6660fee3b58fe3208a9b8b55", session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
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

    // after hook to clean up lessons collection after each test case
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
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

    // after hook to clean up lessons collection after test case is done
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
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

    // after hook to clean up lessons collection after each test is done
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
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

    // after hook to clean up lessons collection after each test is done
    afterEach(async () => {
      await lessonModel.lesson.deleteMany({});
    });

    // Test case for deleting a lesson with valid lessonId and return a message that the lesson is deleted
    it("delete a lesson with valid lessonId and return a message that the lesson is deleted", async () => {
      const result = await lessonModel.deleteLesson(lessonId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Lesson deleted successfully");
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

}).timeout(10000);
