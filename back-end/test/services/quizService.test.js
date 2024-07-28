import mongoDB from "../../databases/mongoDB.js";
import { lessonModel, quizModel } from "../../databases/mongoDB.js";
import * as quizService from "../../services/quizService.js";
import sinon from "sinon";
import { expect } from "chai";

// Test suite for quizService functions
describe("Quiz Service", () => {
  // Variable to save quizData
  let quizData;
  let quizId;

  // before each test, mock the mongoDB session functions
  beforeEach(() => {
    // Define the quizData
    quizData = {
      title: 'Math Quiz',
      lessonId: '60f6e1b9b58fe3208a9b8b55',
      questionsPerQuiz: 2,
      timeToFinish: 10,
      questions: [
        {
          question: 'What is 1+1?',
          options: ['1', '2', '3', '4'],
        },
        {
          question: 'What is 2+2?',
          options: ['1', '2', '3', '4'],
        },
        {
          question: 'What is 3+3?',
          options: ['1', '2', '3', '6'],
        },
      ],
      answers: ['2', '4', '6'],
    };
    // Define the quizId
    quizId = "60f6e1b9b58fe3208a9b8b56";
    // Mock the startSession, commitTransaction, and abortTransaction functions
    sinon.stub(mongoDB, "startSession").returns('session');
    sinon.stub(mongoDB, "commitTransaction").returns('commit');
    sinon.stub(mongoDB, "abortTransaction").returns('abort');
  });

  // after each test, restore the mongoDB session functions
  afterEach(() => {
    sinon.restore();
  });


  // Test suite for createNewQuiz function
  describe("createNewQuiz function", () => {

    // Test case for create new quiz with valid data and add it to the lesson and return success message
    it("create a new quiz with valid data and add it to the lesson and return success message", async () => {
      // Mock the createQuiz function return the quizId, and addQuizToLesson function to return a message
      sinon.stub(quizModel, "createQuiz").returns(quizId);
      sinon.stub(lessonModel, "addQuizToLesson").returns("Quiz added to the lesson successfully");
      // Call the createNewQuiz function
      const result = await quizService.createNewQuiz(quizData.lessonId, quizData);
      // Verify stubs are called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(quizModel.createQuiz.calledOnceWith(quizData, 'session')).to.be.true;
      expect(lessonModel.addQuizToLesson.calledOnceWith(quizData.lessonId, quizId, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // Check that the result is equal to the success message
      expect(result).to.equal("Quiz created and added to the lesson successfully");
    });

    // Test case for create new quiz with invalid createQuiz function and throw an error according to the error message
    it("create a new quiz with invalid createQuiz function and throw an error according to the error message", async () => {
      // Mock the createQuiz function to throw an error, and addQuizToLesson function to return a message
      sinon.stub(quizModel, "createQuiz").throws(new Error("Missing title field"));
      sinon.stub(lessonModel, "addQuizToLesson").returns("Quiz added to the lesson successfully");
      try {
        // Call the createNewQuiz function
        await quizService.createNewQuiz(quizData.lessonId, quizData, 'session');
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(quizModel.createQuiz.calledOnceWith(quizData, 'session')).to.be.true;
        expect(lessonModel.addQuizToLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Missing title field");
      }
    });

    // Test case for create new quiz with invalid addQuizToLesson function and throw an error according to the error message
    it("create a new quiz with invalid addQuizToLesson function and throw an error according to the error message", async () => {
      // Mock the createQuiz function return the quizId, and addQuizToLesson function to throw an error
      sinon.stub(quizModel, "createQuiz").returns(quizId);
      sinon.stub(lessonModel, "addQuizToLesson").throws(new Error("Lesson not found"));
      try {
        // Call the createNewQuiz function
        await quizService.createNewQuiz(quizData.lessonId, quizData, 'session');
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(quizModel.createQuiz.calledOnceWith(quizData, 'session')).to.be.true;
        expect(lessonModel.addQuizToLesson.calledOnceWith(quizData.lessonId, quizId, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Lesson not found");
      }
    });
  });


  // Test suite for getQuizForLearner function
  describe("getQuizForLearner function", () => {

    // Test case for get a quiz with valid quizId and return the quiz document data
    it("get a quiz with valid quizId and return the quiz document data", async () => {
      // Mock the getQuiz function to return the quiz data
      sinon.stub(quizModel, "getQuiz").returns(quizData);
      // Call the getQuizForLearner function
      const result = await quizService.getQuizForLearner(quizId);
      // Verify stubs are called with correct arguments
      expect(quizModel.getQuiz.calledOnceWith(quizId)).to.be.true;
      // Check that the result is equal to the quiz data
      expect(result).to.equal(quizData);
    });

    // Test case for get a quiz with invalid quizId and throw an error according to the error message
    it("get a quiz with invalid quizId and throw an error according to the error message", async () => {
      // Mock the getQuiz function to throw an error
      sinon.stub(quizModel, "getQuiz").throws(new Error("Quiz not found"));
      try {
        // Call the getQuiz function
        await quizService.getQuizForLearner(quizId);
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(quizModel.getQuiz.calledOnceWith(quizId)).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Quiz not found");
      }
    });
  });


  // Test suite for getQuizForInstructor function
  describe("getQuizForInstructor function", () => {

    // Test case for get a quiz with valid quizId and return the quiz document data
    it("get a quiz with valid quizId and return the quiz document data", async () => {
      // Mock the getQuizForCreator function to return the quiz data
      sinon.stub(quizModel, "getQuizForCreator").returns(quizData);
      // Call the getQuizForInstructor function
      const result = await quizService.getQuizForInstructor(quizId);
      // Verify stubs are called with correct arguments
      expect(quizModel.getQuizForCreator.calledOnceWith(quizId)).to.be.true;
      // Check that the result is equal to the quiz data
      expect(result).to.equal(quizData);
    });

    // Test case for get a quiz with invalid quizId and throw an error according to the error message
    it("get a quiz with invalid quizId and throw an error according to the error message", async () => {
      // Mock the getQuiz function to throw an error
      sinon.stub(quizModel, "getQuizForCreator").throws(new Error("Quiz not found"));
      try {
        // Call the getQuiz function
        await quizService.getQuizForInstructor(quizId);
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(quizModel.getQuizForCreator.calledOnceWith(quizId)).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Quiz not found");
      }
    });
  });


  // Test suite for updateQuiz function
  describe("updateQuiz function", () => {

    // Test case for update quiz with valid metadata and questions and answers and return success message with the updated quiz data
    it("update a quiz with valid metadata and questions and answers and return success message with the updated quiz data", async () => {
      const tempQuizData = { ...quizData };
      // Mock the updateQuestionsAndAnswers and updateQuizMetaData functions to return a message
      sinon.stub(quizModel, "updateQuestionsAndAnswers").returns("Questions and answers updated successfully");
      sinon.stub(quizModel, "updateQuizMetaData").returns("Quiz metadata updated successfully");
      // Call the updateQuiz function
      const result = await quizService.updateQuiz(quizId, tempQuizData);
      // Verify stubs are called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(quizModel.updateQuestionsAndAnswers.calledOnceWith(quizId, quizData.questions, quizData.answers, 'session')).to.be.true;
      expect(quizModel.updateQuizMetaData.calledOnceWith(quizId, tempQuizData, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // Check that the result is equal to the success message
      expect(result).to.equal("Quiz updated successfully");
    });

    // Test case for update quiz with invalid updateQuestionsAndAnswers function and throw an error according to the error message
    it("update a quiz with invalid updateQuestionsAndAnswers function and throw an error according to the error message", async () => {
      const tempQuizData = { ...quizData };
      // Mock the updateQuestionsAndAnswers function to throw an error, and updateQuizMetaData function to return a message
      sinon.stub(quizModel, "updateQuestionsAndAnswers").throws(new Error("Quiz must have answers for each question"));
      sinon.stub(quizModel, "updateQuizMetaData").returns("Quiz metadata updated successfully");
      try {
        // Call the updateQuiz function
        await quizService.updateQuiz(quizId, tempQuizData);
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(quizModel.updateQuestionsAndAnswers.calledOnceWith(quizId, quizData.questions, quizData.answers, 'session')).to.be.true;
        expect(quizModel.updateQuizMetaData.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Quiz must have answers for each question");
      }
    });

    // Test case for update quiz with invalid updateQuizMetaData function and throw an error according to the error message
    it("update a quiz with invalid updateQuizMetaData function and throw an error according to the error message", async () => {
      const tempQuizData = { ...quizData };
      // Mock the updateQuestionsAndAnswers function to return a message, and updateQuizMetaData function to throw an error
      sinon.stub(quizModel, "updateQuestionsAndAnswers").returns("Questions and answers updated successfully");
      sinon.stub(quizModel, "updateQuizMetaData").throws(new Error("Missing title field"));
      try {
        // Call the updateQuiz function
        await quizService.updateQuiz(quizId, tempQuizData);
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(quizModel.updateQuestionsAndAnswers.calledOnceWith(quizId, quizData.questions, quizData.answers, 'session')).to.be.true;
        expect(quizModel.updateQuizMetaData.calledOnceWith(quizId, tempQuizData, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Missing title field");
      }
    });
  });


  // Test suite for correctQuiz function
  describe("correctQuiz function", () => {

    // Test case for correct a quiz with valid answers and return the score of the learner
    it("correct a quiz with valid answers and return the score of the learner", async () => {
      // Mock the correctQuiz function to return the score
      sinon.stub(quizModel, "correctAnswers").returns(80);
      // Call the correctQuiz function
      const result = await quizService.correctQuiz(quizId, { 0: '2', 1: '4' });
      // Verify stubs are called with correct arguments
      expect(quizModel.correctAnswers.calledOnceWith(quizId, { 0: '2', 1: '4' })).to.be.true;
      // Check that the result is correct
      expect(result).to.equal(80);
    });

    // Test case for correct a quiz with invalid answers and throw an error according to the error message
    it("correct a quiz with invalid answers and throw an error according to the error message", async () => {
      // Mock the correctQuiz function to throw an error
      sinon.stub(quizModel, "correctAnswers").throws(new Error("Answers must be same length as questions"));
      try {
        // Call the correctQuiz function
        await quizService.correctQuiz(quizId, { 0: '2', 1: '4' });
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(quizModel.correctAnswers.calledOnceWith(quizId, { 0: '2', 1: '4' })).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Answers must be same length as questions");
      }
    });
  });


  // Test suite for removeQuiz function
  describe("removeQuiz function", () => {

    // Test case for remove a quiz with valid quizId from database and from lesson and return success message
    it("remove a quiz with valid quizId from database and from lesson and return success message", async () => {
      // Mock the deleteQuiz function to return a message, and removeQuizFromLesson function to return a message
      sinon.stub(quizModel, "deleteQuiz").returns("Quiz deleted successfully");
      sinon.stub(lessonModel, "removeQuizFromLesson").returns("Quiz removed from the lesson successfully");
      // Call the removeQuiz function
      const result = await quizService.removeQuiz(quizId, quizData.lessonId);
      // Verify stubs are called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(quizModel.deleteQuiz.calledOnceWith(quizId, 'session')).to.be.true;
      expect(lessonModel.removeQuizFromLesson.calledOnceWith(quizData.lessonId, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // Check that the result is equal to the success message
      expect(result).to.equal("Quiz removed successfully");
    });

    // Test case for remove a quiz with invalid deleteQuiz function and throw an error according to the error message
    it("remove a quiz with invalid deleteQuiz function and throw an error according to the error message", async () => {
      // Mock the deleteQuiz function to throw an error, and removeQuizFromLesson function to return a message
      sinon.stub(quizModel, "deleteQuiz").throws(new Error("Quiz not found"));
      sinon.stub(lessonModel, "removeQuizFromLesson").returns("Quiz removed from the lesson successfully");
      try {
        // Call the removeQuiz function
        await quizService.removeQuiz(quizId, quizData.lessonId);
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(quizModel.deleteQuiz.calledOnceWith(quizId, 'session')).to.be.true;
        expect(lessonModel.removeQuizFromLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Quiz not found");
      }
    });

    // Test case for remove a quiz with invalid removeQuizFromLesson function and throw an error according to the error message
    it("remove a quiz with invalid removeQuizFromLesson function and throw an error according to the error message", async () => {
      // Mock the deleteQuiz function to return a message, and removeQuizFromLesson function to throw an error
      sinon.stub(quizModel, "deleteQuiz").returns("Quiz deleted successfully");
      sinon.stub(lessonModel, "removeQuizFromLesson").throws(new Error("Lesson not found"));
      try {
        // Call the removeQuiz function
        await quizService.removeQuiz(quizId, quizData.lessonId);
      }
      catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.removeQuizFromLesson.calledOnceWith(quizData.lessonId, 'session')).to.be.true;
        expect(quizModel.deleteQuiz.calledOnceWith(quizId, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is equal to the invalid data error message
        expect(error.message).to.equal("Lesson not found");
      }
    });
  });


}).timeout(5000);
