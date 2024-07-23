import mongoDB, { lessonModel, lessonContentModel } from "../../../databases/mongoDB.js";
import { expect } from "chai";


// Test suite for the lesson lessonContent integration tests
describe("lesson lessonContent integration tests", () => {

  // after Each test clear lessons and courses collections
  afterEach(async () => {
    await lessonModel.lesson.deleteMany({});
    await lessonContentModel.lessonContent.deleteMany({});
  });

  // Test suite for the getLessonWithContent method with all scenarios
  describe("Test suite for getLessonWithContent method", () => {
    // variable to save lessonId
    let lessonId;
    let lesson;
    let lessonContent;

    // before hook to create a new lesson before each test case and create content for the lesson
    beforeEach(async () => {
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
      const result = await lessonModel.createLesson(lesson);
      lessonId = result._id;
      // pass the lessonId to the lessonContent object
      lessonContent.lessonId = lessonId;
      // create a new lesson content object
      const content = await lessonContentModel.createLessonContent(lessonContent);
      // add the content to the lesson
      await lessonModel.addContentToLesson(lessonId, content._id);
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

}).timeout(5000);
