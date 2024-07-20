import { expect } from "chai";
import mongoDB, { lessonContentModel } from "../../../databases/mongoDB.js";

// Test suite for to test all the methods in the LessonContentModel class
describe("LessonContentModel", () => {
  // Declare variables to be used across all the tests
  let lessonContentData;

  // Before hook to prepare the data before all test start
  before(async () => {
    // Create a new lesson content
    lessonContentData = {
      lessonId: "5f9d88d9c3b5e4a2e4f036e8",
      title: "Lesson 1",
      type: "text",
      value: "This is the lesson content",
    };
  });

  // After hook to clean up lessonContents collection after all tests are done
  after(async () => {
    // Delete the lessons from the database
    await lessonContentModel.lessonContent.deleteMany({});
  });


  // Test suite for the createLessonContent method with all scenarios
  describe("Test suite for createLessonContent method", () => {

    // afterEach hook to clean up the lessonContents collection after each test
    afterEach(async () => {
      await lessonContentModel.lessonContent.deleteMany({});
    });

    // Test case for creating a new lesson with valid fields and return created lesson content
    it("create a new lesson content with valid fields and return created lesson content", async () => {
      // Create a new lesson content
      const result = await lessonContentModel.createLessonContent(lessonContentData);
      // Check if result is correct
      expect(result).to.be.an("object");
      expect(result).to.have.property("lessonId", lessonContentData.lessonId);
      expect(result).to.have.property("title", lessonContentData.title);
      expect(result).to.have.property("type", lessonContentData.type);
      expect(result).to.have.property("value", lessonContentData.value);
      expect(result).to.have.property("url", null);
    });

    // Test case for creating a new lesson with missing required field and throw an error
    it("create a new lesson content with missing required field and throw an error", async () => {
      try {
        // Create temp lesson content data with missing lessonId field
        const temp = { ...lessonContentData };
        delete temp.lessonId;
        await lessonContentModel.createLessonContent(temp);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Missing lessonId field");
      }
    });

    // Test case for creating a 2 new lesson content with valid fields in transaction with session key and success
    it("create 2 new lesson content with valid fields in transaction with session key with success", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Create 2 new lesson content 
      await lessonContentModel.createLessonContent(lessonContentData, session);
      await lessonContentModel.createLessonContent(lessonContentData, session);
      // Commit the transaction
      await mongoDB.commitTransaction(session);
      // Check if the two lessonContent are created
      const result = await lessonContentModel.lessonContent.find({});
      expect(result.length).to.equal(2);
    });

    // Test case for creating a new lesson content in transaction with session key and failed
    it("create a new lesson content in transaction with session key and failed", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Create a new lesson content with valid fields
        await lessonContentModel.createLessonContent(lessonContentData, session);
        // Create a new lesson content with missing lessonId field
        const temp = { ...lessonContentData };
        delete temp.lessonId;
        await lessonContentModel.createLessonContent(temp, session);
        // Commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Missing lessonId field");
        // Abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // Check if the lessonContent is not created
      const result = await lessonContentModel.lessonContent.find({});
      expect(result.length).to.equal(0);
    });
  });


  // Test suite for the getLessonContent method with all scenarios
  describe("Test suite for getLessonContent method", () => {
    // Declare variables to be used across all the tests
    let lessonContentId;

    // BeforeEach hook to create a new lesson content before each test
    beforeEach(async () => {
      // Create a new lesson content
      const result = await lessonContentModel.createLessonContent(lessonContentData);
      lessonContentId = result._id;
    });

    // afterEach hook to clean up the lessonContents collection after each test
    afterEach(async () => {
      await lessonContentModel.lessonContent.deleteMany({});
    });

    // Test case for getting a lesson content with valid ID and return the lesson content
    it("get a lesson content with valid ID and return the lesson content", async () => {
      // Get the lesson content
      const result = await lessonContentModel.getLessonContent(lessonContentId);
      // Check if the result is correct
      expect(result).to.be.an("object");
      expect(result).to.have.property("lessonId", lessonContentData.lessonId);
      expect(result).to.have.property("title", lessonContentData.title);
      expect(result).to.have.property("type", lessonContentData.type);
      expect(result).to.have.property("value", lessonContentData.value);
      expect(result).to.have.property("url", null);
    });

    // Test case for getting a lesson content with invalid ID and throw an error LessonContent not found
    it("get a lesson content with invalid ID and throw an error LessonContent not found", async () => {
      try {
        // Get the lesson content with invalid ID
        await lessonContentModel.getLessonContent("5f9d88d9c3b5e4a2e4f036e8");
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("LessonContent not found");
      }
    });

    // Test case for getting a lesson content with valid ID in transaction with session key and success
    it("get a lesson content with valid ID in transaction with session key and success", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Get the lesson content with valid ID
      await lessonContentModel.getLessonContent(lessonContentId, session);
      // Commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting a lesson content with invalid ID in transaction with session key and failed
    it("get a lesson content with invalid ID in transaction with session key and failed", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Get the lesson content with invalid ID
        await lessonContentModel.getLessonContent("5f9d88d9c3b5e4a2e4f036e8", session);
        // Commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("LessonContent not found");
        // Abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the getLessonContentByIdsList method with all scenarios
  describe("Test suite for getLessonContentByIdsList method", () => {
    // Declare variables to be used across all the tests
    let lessonContentIds = [];

    // BeforeEach hook to create a new lesson content before each test
    beforeEach(async () => {
      // Create a new lesson content
      const result1 = await lessonContentModel.createLessonContent(lessonContentData);
      lessonContentIds.push(result1._id);
      const result2 = await lessonContentModel.createLessonContent(lessonContentData);
      lessonContentIds.push(result2._id);
    });

    // afterEach hook to clean up the lessonContents collection after each test
    afterEach(async () => {
      await lessonContentModel.lessonContent.deleteMany({});
    });

    // Test case for getting a list of lesson content with valid IDs and return the list of lesson content
    it("get a list of lesson content with valid IDs and return the list of lesson content", async () => {
      // Get the list of lesson content
      const result = await lessonContentModel.getLessonContentByIdsList(lessonContentIds);
      // Check if the result is correct
      expect(result).to.be.an("array");
      expect(result.length).to.equal(2);
    });

    // Test case for getting a list of lesson content with invalid IDs and throw an error No lesson content found
    it("get a list of lesson content with invalid IDs and throw an error No lesson content found", async () => {
      try {
        // Get the list of lesson content with invalid IDs
        await lessonContentModel.getLessonContentByIdsList(["5f9d88d9c3b5e4a2e4f036e8"]);
      }
      catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("No lesson content found");
      }
    });

    // Test case for getting a list of lesson content with valid IDs in transaction with session key and success
    it("get a list of lesson content with valid IDs in transaction with session key and success", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Get the list of lesson content with valid IDs
      await lessonContentModel.getLessonContentByIdsList(lessonContentIds, session);
      // Commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting a list of lesson content with invalid IDs in transaction with session key and failed
    it("get a list of lesson content with invalid IDs in transaction with session key and failed", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Get the list of lesson content with invalid IDs
        await lessonContentModel.getLessonContentByIdsList(["5f9d88d9c3b5e4a2e4f036e8"], session);
        // Commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("No lesson content found");
        // Abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the getLessonContentByLessonId method with all scenarios
  describe("Test suite for getLessonContentByLessonId method", () => {
    // declare lessonId to be used across all the tests
    let lessonId;

    // BeforeEach hook to create a two new lesson content before each test
    beforeEach(async () => {
      await lessonContentModel.createLessonContent(lessonContentData);
      await lessonContentModel.createLessonContent(lessonContentData);
      // define lessonId
      lessonId = lessonContentData.lessonId;
    });

    // afterEach hook to clean up the lessonContents collection after each test
    afterEach(async () => {
      await lessonContentModel.lessonContent.deleteMany({});
    });

    // Test case for getting a list of lesson content with valid lesson ID and return the list of lesson content
    it("get a list of lesson content with valid lesson ID and return the list of lesson content", async () => {
      // Get the list of lesson content
      const result = await lessonContentModel.getLessonContentByLessonId(lessonId);
      // Check if the result is correct
      expect(result).to.be.an("array");
      expect(result.length).to.equal(2);
    });

    // Test case for getting a list of lesson content with invalid lesson ID and throw an error Lesson has no content
    it("get a list of lesson content with invalid lesson ID and throw an error Lesson has no content", async () => {
      try {
        // Get the list of lesson content with invalid lesson ID
        await lessonContentModel.getLessonContentByLessonId("5f9d88d9c3b5e4a2e4f036l8");
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Lesson has no content");
      }
    });

    // Test case for getting a list of lesson content with valid lesson ID in transaction with session key and success
    it("get a list of lesson content with valid lesson ID in transaction with session key and success", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Get the list of lesson content with valid lesson ID
      await lessonContentModel.getLessonContentByLessonId(lessonId, session);
      // Commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting a list of lesson content with invalid lesson ID in transaction with session key and failed
    it("get a list of lesson content with invalid lesson ID in transaction with session key and failed", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Get the list of lesson content with invalid lesson ID
        await lessonContentModel.getLessonContentByLessonId("5f9d88d9c3b5e4a2e4f036l8", session);
        // Commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Lesson has no content");
        // Abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the updateLessonContent method with all scenarios
  describe("Test suite for updateLessonContent method", () => {
    // declare lessonContentId to be used across all the tests
    let lessonContentId;

    // BeforeEach hook to create a new lesson content before each test
    beforeEach(async () => {
      // Create a new lesson content
      const result = await lessonContentModel.createLessonContent(lessonContentData);
      lessonContentId = result._id;
    });

    // afterEach hook to clean up the lessonContents collection after each test
    afterEach(async () => {
      await lessonContentModel.lessonContent.deleteMany({});
    });

    // Test case for updating a lesson content with valid ID and data and return updated lesson content
    it("update a lesson content with valid ID and data and return updated lesson content", async () => {
      // create temp lessonContentData with modified title
      const temp = { ...lessonContentData, title: "Lesson 2" };
      // Update the lesson content
      const result = await lessonContentModel.updateLessonContent(lessonContentId, temp);
      // Check if the result is correct
      expect(result).to.be.an("object");
      expect(result).to.have.property("lessonId", lessonContentData.lessonId);
      expect(result).to.have.property("title", temp.title);
      expect(result).to.have.property("type", lessonContentData.type);
      expect(result).to.have.property("value", lessonContentData.value);
      expect(result).to.have.property("url", null);
    });

    // Test case for updating a lesson content with invalid ID and data and throw an error Could not found lessonContent
    it("update a lesson content with invalid ID and data and throw an error Could not found lessonContent", async () => {
      try {
        // Update the lesson content with invalid ID
        await lessonContentModel.updateLessonContent("5f9d88d9c3b5e4a2e4f036ll", lessonContentData);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Could not found lessonContent");
      }
    });

    // Test case for updating a lesson content with valid ID and missing required field and throw an error Missing title field
    it("update a lesson content with valid ID and missing required field and throw an error Missing title field", async () => {
      try {
        // Update the lesson content with missing title field
        const temp = { ...lessonContentData, title: '' };
        await lessonContentModel.updateLessonContent(lessonContentId, temp);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Missing title field");
      }
    });

    // Test case for updating a lesson content with valid ID and data in transaction with session key and success
    it("update a lesson content with valid ID and data in transaction with session key and success", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // create temp lessonContentData with modified title
      const temp = { ...lessonContentData, title: "Lesson 2" };
      // Update the lesson content with valid ID
      await lessonContentModel.updateLessonContent(lessonContentId, temp, session);
      // Commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for updating a lesson content with invalid ID and data in transaction with session key and failed
    it("update a lesson content with invalid ID and data in transaction with session key and failed", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // create temp lessonContentData with modified title
        const temp = { ...lessonContentData, title: "Lesson 2" };
        // Update the lesson content with invalid ID
        await lessonContentModel.updateLessonContent("5f9d88d9c3b5e4a2e4f036ll", temp, session);
        // Commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Could not found lessonContent");
        // Abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the deleteLessonContent method with all scenarios 
  describe("Test suite for deleteLessonContent method", () => {
    // declare lessonContentId to be used across all the tests
    let lessonContentId;

    // BeforeEach hook to create a new lesson content before each test
    beforeEach(async () => {
      // Create a new lesson content
      const result = await lessonContentModel.createLessonContent(lessonContentData);
      lessonContentId = result._id;
    });

    // afterEach hook to clean up the lessonContents collection after each test
    afterEach(async () => {
      await lessonContentModel.lessonContent.deleteMany({});
    });

    // Test case for deleting a lesson content with valid ID and return message Lesson content deleted successfully
    it("delete a lesson content with valid ID and return message Lesson content deleted successfully", async () => {
      // Delete the lesson content
      const result = await lessonContentModel.deleteLessonContent(lessonContentId);
      // Check if the result is correct
      expect(result).to.equal("Lesson content deleted successfully");
    });

    // Test case for deleting a lesson content with invalid ID and throw an error Could not found lessonContent
    it("delete a lesson content with invalid ID and throw an error Could not found lessonContent", async () => {
      try {
        // Delete the lesson content with invalid ID
        await lessonContentModel.deleteLessonContent("5f9d88d9c3b5e4a2e4f036ll");
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Failed to delete or not found lesson content");
      }
    });

    // Test case for deleting a lesson content with valid ID in transaction with session key and success
    it("delete a lesson content with valid ID in transaction with session key and success", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Delete the lesson content with valid ID
      await lessonContentModel.deleteLessonContent(lessonContentId, session);
      // Commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for deleting a lesson content with invalid ID in transaction with session key and failed
    it("delete a lesson content with invalid ID in transaction with session key and failed", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Delete the lesson content with invalid ID
        await lessonContentModel.deleteLessonContent("5f9d88d9c3b5e4a2e4f036ll", session);
        // Commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Failed to delete or not found lesson content");
        // Abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the deleteLessonContentByLessonId method with all scenarios
  describe("Test suite for deleteLessonContentByLessonId method", () => {
    // declare lessonId to be used across all the tests
    let lessonId;

    // BeforeEach hook to create a two new lesson content before each test
    beforeEach(async () => {
      await lessonContentModel.createLessonContent(lessonContentData);
      await lessonContentModel.createLessonContent(lessonContentData);
      // define lessonId
      lessonId = lessonContentData.lessonId;
    });

    // afterEach hook to clean up the lessonContents collection after each test
    afterEach(async () => {
      await lessonContentModel.lessonContent.deleteMany({});
    });

    // Test case for deleting a list of lesson content with valid lesson ID and return message Lesson contents deleted successfully
    it("delete a list of lesson content with valid lesson ID and return message Lesson contents deleted successfully", async () => {
      // Delete the list of lesson content
      const result = await lessonContentModel.deleteLessonContentByLessonId(lessonId);
      // Check if the result is correct
      expect(result).to.equal("Lesson contents deleted successfully");
    });

    // Test case for deleting a list of lesson content with invalid lesson ID and throw an error 
    it("delete a list of lesson content with invalid lesson ID and throw an error", async () => {
      try {
        // Delete the list of lesson content with invalid lesson ID
        await lessonContentModel.deleteLessonContentByLessonId("5f9d88d9c3b5e4a2e4f036l8");
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Failed to delete or not found lesson content");
      }
    });

    // Test case for deleting a list of lesson content with valid lesson ID in transaction with session key and success
    it("delete a list of lesson content with valid lesson ID in transaction with session key and success", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Delete the list of lesson content with valid lesson ID
      await lessonContentModel.deleteLessonContentByLessonId(lessonId, session);
      // Commit the transaction
      await mongoDB.commitTransaction(session);
      // Check if the lesson content is deleted
      const result = await lessonContentModel.lessonContent.find({});
      expect(result.length).to.equal(0);
    });

    // Test case for deleting a list of lesson content with invalid lesson ID in transaction with session key and failed
    it("delete a list of lesson content with invalid lesson ID in transaction with session key and failed", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Delete the list of lesson content with invalid lesson ID
        await lessonContentModel.deleteLessonContentByLessonId("5f9d88d9c3b5e4a2e4f036l8", session);
        // Commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        // Check if the error is correct
        expect(error.message).to.equal("Failed to delete or not found lesson content");
        // Abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // Check if the lesson content is not deleted
      const result = await lessonContentModel.lessonContent.find({});
      expect(result.length).to.equal(2);
    });
  });

}).timeout(10000); // Set timeout for the test suite
