import { expect } from "chai";
import { lessonModel } from "../../databases/mongoDB.js";
import mongoDB from "../../databases/mongoDB.js";

// Test suite for to test all the methods in the lessonModel class
describe("LessonModel", () => {
  // Declare variables to be used across all the tests
  let lesson;
  let lessonId;

  // Before hook to prepare the data before all test start
  before(() => {
    // Create a new lesson object
    lesson = {
      courseId: "60f6e1b9b58fe3208a9b8b55",
      title: "Test lesson",
      description: "Test lesson description",
      content: [
        {
          title: "part 1",
          type: "text",
          value: "lore ipsum lorem ipsum",
        },
        {
          title: "part 2",
          type: "image",
          value: "test.jpg",
        },
      ],
      timeToFinish: 20,
    };
  });

  // After hook to clean up lessons collection after all tests are done
  after(async () => {
    // Delete the lessons from the database
    await lessonModel.lesson.deleteMany({});
  });


  // Test suite for the createLesson method with all scenarios
  describe("Test suite for createLesson method", () => {
    // Test case for creating a new lesson with valid fields
    it("create a new lesson with valid fields and return the lesson object", async () => {
      const result = await lessonModel.createLesson(lesson);
      // check results is correct
      expect(result).to.be.an("object");
      expect(result.title).to.equal(lesson.title);
      expect(result.description).to.equal(lesson.description);
      expect(result.courseId).to.equal(lesson.courseId);
      expect(result.timeToFinish).to.equal(lesson.timeToFinish);
      // save the lessonId to the lessonId variable
      lessonId = result._id;
    });

    // Test case for creating a new lesson with missing required fields
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
      expect(lessons.length).to.equal(3);
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
      expect(lessons.length).to.equal(3);
    });
  });


  // Test suite for the getLesson method with all scenarios
  describe("Test suite for getLesson method", () => {
    // Test case for getting a lesson with valid lessonId and return the lesson object
    it("get a lesson with valid lessonId and return the lesson object", async () => {
      const result = await lessonModel.getLesson(lessonId);
      // check if the result is correct
      expect(result).to.be.an("object");
      expect(result.title).to.equal(lesson.title);
      expect(result.description).to.equal(lesson.description);
      expect(result.courseId).to.equal(lesson.courseId);
      expect(result.content.length).to.equal(lesson.content.length);
      expect(result.timeToFinish).to.equal(lesson.timeToFinish);
    });

    // Test case for getting a lesson with invalid lessonId and throw an error
    it("get a lesson with invalid lessonId and throw an error", async () => {
      try {
        await lessonModel.getLesson("6660fee3b58fe3208a9b8b55");
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for getting lessons with valid courseId in a transaction with session with success transaction
    it("get lessons with valid courseId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // get lessons from the database with valid courseId and create a new lesson with valid fields
      await lessonModel.getLesson(lessonId, session);
      await lessonModel.getLesson(lessonId, session);
      await lessonModel.createLesson(lesson, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if all lessons are created in the database and success transaction
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(4);
    });

    // Test case for getting lessons with invalid courseId in a transaction with session with failed transaction
    it("get lessons with invalid courseId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // get lessons from the database with valid courseId, with invalid lessonId and create a new lesson with valid fields
        await lessonModel.getLesson(lessonId, session);
        await lessonModel.getLesson("6660fee3b58fe3208a9b8b55", session);
        await lessonModel.createLesson(lesson, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if all lessons are created in the database and failed transaction
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(4);
    });
  });


  // Test suite for the updateLesson method with all scenarios
  describe("Test suite for updateLesson method", () => {
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
      // update the lesson object with the updated fields
      lesson.title = updatedData.title;
      lesson.timeToFinish = updatedData.timeToFinish;
    });

    // Test case for updating a lesson with invalid lessonId and valid data and throw an error
    it("update a lesson with invalid lessonId", async () => {
      try {
        await lessonModel.updateLesson('6660fee3b58fe3208a9b8b55', lesson);
      }
      catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Lesson not found");
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
      const result = await lessonModel.getLesson(lessonId);
      expect(result.title).to.equal(updatedData.title);
      expect(result.timeToFinish).to.equal(updatedData.timeToFinish);
      // update the lesson object with the updated fields
      lesson.title = updatedData.title;
      lesson.timeToFinish = updatedData.timeToFinish;
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
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if all lesson are not updated in the database
      const result = await lessonModel.getLesson(lessonId);
      expect(result.title).to.equal(lesson.title);
      expect(result.timeToFinish).to.equal(lesson.timeToFinish);
      expect(result.timeToFinish).to.not.equal(80);
    });
  });


  // Test suite for the deleteLesson method with all scenarios
  describe("Test suite for deleteLesson method", () => {
    // Test case for deleting a lesson with valid lessonId and return a message that the lesson is deleted
    it("delete a lesson with valid lessonId and return a message that the lesson is deleted", async () => {
      const result = await lessonModel.deleteLesson(lessonId);
      // check if the result is correct
      expect(result).to.be.an("string");
      expect(result).to.equal("Lesson deleted successfully");
    });

    // Test case for deleting a lesson with invalid lessonId and throw an error
    it("delete a lesson with invalid lessonId", async () => {
      try {
        await lessonModel.deleteLesson("6660fee3b58fe3208a9b8b55");
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for deleting a lesson with valid lessonId in a transaction with session with success transaction
    it("delete a lesson with valid lessonId in a transaction with session with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // create new lesson then delete it in the transaction
      const result = await lessonModel.createLesson(lesson, session);
      await lessonModel.deleteLesson(result._id, session);
      // commit the transaction and close the session
      await mongoDB.commitTransaction(session);
      //check if the lesson is deleted from the database
      try {
        await lessonModel.getLesson(result._id);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for deleting a lesson with valid lessonId in a transaction with session with failed transaction
    it("delete a lesson with invalid lessonId in a transaction with session with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // create new lesson then delete it twice
        const result = await lessonModel.createLesson(lesson, session);
        await lessonModel.deleteLesson(result._id, session);
        await lessonModel.deleteLesson(result._id, session);
        // commit the transaction and close the session
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Lesson not found");
        // close the session
        await mongoDB.abortTransaction(session);
      }
      //check if the lesson is not created in the database
      const lessons = await lessonModel.lesson.find({});
      expect(lessons.length).to.equal(3);
    });
  });


}).timeout(10000);
