import { expect } from "chai";
import { lessonModel } from "../../databases/mongoDB.js";

// Test suite for the lessonModel in the database mongoDB
describe("lessonModel", () => {
  // define the lesson and lessonId variables
  let lesson;
  let lessonId;

  // Before hook to prepare the data used in the tests
  before(() => {
    // Create a new lesson object
    lesson = {
      title: "Test lesson",
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

  // After hook to clean up the data used in the tests
  after(async () => {
    // Delete the lessons from the database
    await lessonModel.lesson.deleteMany({});
  });


  // Test suite for the createLesson method
  describe("createLesson", () => {
    // Test case for creating a new lesson with valid fields
    it("CreateLesson method create a new lesson with valid fields", async () => {
      // Create a new lesson in the database
      const result = await lessonModel.createLesson(lesson);
      // check if the result is not null
      expect(result).to.not.equal(null);
      // save the result to the lessonId variable
      lessonId = result;
    });

    // Test case for creating a new lesson with invalid fields not in the schema
    it("CreateLesson method create a new lesson with invalid fields not in the schema", async () => {
      try {
        // add invaild field to the lesson object
        const tempLesson = { ...lesson, invalidField: "invalid" };
        // Create a new lesson in the database with invalid field
        await lessonModel.createLesson(tempLesson);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Fields not in schema: invalidField");
      }
    });

    // Test case for creating a new lesson with missing required fields
    it("CreateLesson method create a new lesson with missing required fields", async () => {
      try {
        // remove the title field from the lesson object
        const tempLesson = { ...lesson };
        delete tempLesson.title;
        // Create a new lesson in the database with missing required field
        await lessonModel.createLesson(tempLesson);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Missing title field");
      }
    });
  });


  // Test suite for the getLesson method
  describe("getLesson", () => {
    // Test case for getting a lesson with valid lessonId
    it("GetLesson method get a lesson with valid lessonId", async () => {
      // Get the lesson from the database
      const result = await lessonModel.getLesson(lessonId);
      console.log(result);
      // check if the result is object
      expect(result).to.be.an("object");
      // check if the result is equal to the lesson object
      expect(result.title).to.equal(lesson.title);
      expect(result.content[0].title).to.equal(lesson.content[0].title);
      expect(result.content[0].type).to.equal(lesson.content[0].type);
      expect(result.content[0].value).to.equal(lesson.content[0].value);
      expect(result.content[1].title).to.equal(lesson.content[1].title);
      expect(result.content[1].type).to.equal(lesson.content[1].type);
      expect(result.content[1].value).to.equal(lesson.content[1].value);
      expect(result.timeToFinish).to.equal(lesson.timeToFinish);
    });

    // Test case for getting a lesson with invalid lessonId
    it("GetLesson method get a lesson with invalid lessonId", async () => {
      try {
        // Get the lesson from the database with invalid lessonId
        await lessonModel.getLesson("invalidId");
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Lesson not found");
      }
    });
  });


  // Test suite for the updateLesson method
  describe("updateLesson", () => {
    // Test case for updating a lesson with valid lessonId and lesson object
    it("UpdateLesson method update a lesson with valid lessonId and lesson object", async () => {
      // update lesson object with new values
      lesson.title = "Updated lesson";
      lesson.timeToFinish = 30;
      // Update the lesson in the database
      const result = await lessonModel.updateLesson(lessonId, lesson);
      // check if the result is string
      expect(result).to.be.an("string");
      // check if message is correct
      expect(result).to.equal("Lesson updated successfully");
      // get lesson from the database
      const updatedLesson = await lessonModel.getLesson(lessonId);
      // check if the updated lesson is equal to the lesson object
      expect(updatedLesson.title).to.equal(lesson.title);
      expect(updatedLesson.timeToFinish).to.equal(lesson.timeToFinish);
    });

    // Test case for updating a lesson with invalid lessonId
    it("UpdateLesson method update a lesson with invalid lessonId", async () => {
      try {
        // Update the lesson in the database with invalid lessonId
        await lessonModel.updateLesson("invalidId", lesson);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Lesson not found");
      }
    });

    // Test case for updating a lesson with invalid fields not in the schema
    it("UpdateLesson method update a lesson with invalid fields not in the schema", async () => {
      try {
        // add invaild field to the lesson object
        const tempLesson = { ...lesson, invalidField: "invalid" };
        // Update the lesson in the database with invalid field
        await lessonModel.updateLesson(lessonId, tempLesson);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Fields not in schema: invalidField");
      }
    });

    // Test case for updating content with new content
    it("UpdateLesson method update a lesson with new content", async () => {
      // update lesson object with new content
      lesson.content = [...lesson.content, { title: "part 3", type: "video", value: "test.mp4" }];
      // Update the lesson in the database
      const result = await lessonModel.updateLesson(lessonId, lesson);
      // check if the result is string
      expect(result).to.be.an("string");
      // check if message is correct
      expect(result).to.equal("Lesson updated successfully");
      // get lesson from the database
      const updatedLesson = await lessonModel.getLesson(lessonId);
      // check if the updated lesson is equal to the lesson object
      expect(updatedLesson.content[2].title).to.equal(lesson.content[2].title);
      expect(updatedLesson.content[2].type).to.equal(lesson.content[2].type);
      expect(updatedLesson.content[2].value).to.equal(lesson.content[2].value);
    });
  });


  // Test suite for the deleteLesson method
  describe("deleteLesson", () => {
    // Test case for deleting a lesson with valid lessonId
    it("DeleteLesson method delete a lesson with valid lessonId", async () => {
      // Delete the lesson from the database
      const result = await lessonModel.deleteLesson(lessonId);
      // check if the result is string
      expect(result).to.be.an("string");
      // check if message is correct
      expect(result).to.equal("Lesson deleted successfully");
    });

    // Test case for deleting a lesson with invalid lessonId
    it("DeleteLesson method delete a lesson with invalid lessonId", async () => {
      try {
        // Delete the lesson from the database with invalid lessonId
        await lessonModel.deleteLesson("invalidId");
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Lesson not found");
      }
    });
  });
});
