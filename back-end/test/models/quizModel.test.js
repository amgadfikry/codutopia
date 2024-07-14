import { expect } from 'chai';
import { quizModel } from '../../databases/mongoDB.js';
import mongoDB from '../../databases/mongoDB.js';

// Test suite for to test all the methods in the quizModel class
describe('QuizModel', () => {
  // Declare variables to be used across all the tests
  let quiz;
  let quizId;

  // Before hook to prepare the data before all test start
  before(() => {
    // Create a new quiz object
    quiz = {
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
  });

  // After hook to clean up quizzes after all tests are done
  after(async () => {
    // Delete all quizzes in the database
    await quizModel.quiz.deleteMany({});
  });


  // Test suite for the createQuiz method with all scenarios
  describe('Test suite for createQuiz method', () => {

    // after hook to clean up quizzes collection after all the tests done
    after(async () => {
      await quizModel.quiz.deleteMany({});
    });

    // Test case for creating a new quiz with valid fields and return the quiz id
    it('create a new quiz with valid fields and return the quiz id', async () => {
      const result = await quizModel.createQuiz(quiz);
      // check if the result is correct
      expect(result).to.not.equal(null);
      // save id to the quizId variable for future tests
      quizId = result
    });

    // Test case for creating a new quiz with missing required fields and throw an error
    it('create a new quiz with missing required fields and throw an error', async () => {
      try {
        // create a temp quiz object with missing required field
        const tempQuiz = { ...quiz };
        delete tempQuiz.title;
        await quizModel.createQuiz(tempQuiz);
      }
      catch (error) {
        expect(error.message).to.equal('Missing title field');
      }
    });

    // Test case for creating a new quiz questions length less than required questions and throw an error
    it('create a new quiz with questions length less than required questions', async () => {
      try {
        // create a temp quiz object with questions less than required questions
        const tempQuiz = { ...quiz, questions: [] };
        await quizModel.createQuiz(tempQuiz);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz must have at least one question');
      }
    });

    // Test case for creating a new quiz options length less than required options and throw an error
    it('create a new quiz with options length less than required options', async () => {
      try {
        // create a temp quiz object with options less than 2 for each question
        const tempQuiz = {
          ...quiz,
          questions: [...quiz.questions, { question: 'What is 4+4?', options: ['1'], }],
          answers: [...quiz.answers, '8'],
        };
        await quizModel.createQuiz(tempQuiz);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz must have at least two options for each question');
      }
    });

    //Test case for creating a new quiz with answers length less than number of questions and throw an error
    it('create a new quiz with answers length less than number of questions', async () => {
      try {
        // create temp quiz object with answers less than number of questions
        const tempQuiz = { ...quiz, answers: ['2'] };
        await quizModel.createQuiz(tempQuiz);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz must have answers for each question');
      }
    });

    // Test case for creating a new quiz with answers length more than number of questions and throw an error
    it('create a new quiz with answers length more than number of questions', async () => {
      try {
        // create a temp quiz object with answers more than number of questions
        const tempQuiz = { ...quiz, answers: ['2', '4', '6', '8'] };
        await quizModel.createQuiz(tempQuiz);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz must have answers for each question');
      }
    });

    // Test case for creating a new quiz with valid fields in a transaction with success transaction
    it('create a new quiz with valid fields in a transaction with success transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      // create two new quiz objects with valid fields
      await quizModel.createQuiz(quiz, session);
      await quizModel.createQuiz(quiz, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the quizzes are created
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(3);
    });

    // Test case for creating a new quiz with missing required fields in a transaction with failed transaction
    it('create a new quiz with missing required fields in a transaction with failed transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      try {
        // create 2 new quiz objects one with missing required field and one with valid fields
        const tempQuiz = { ...quiz };
        delete tempQuiz.title;
        await quizModel.createQuiz(tempQuiz, session);
        await quizModel.createQuiz(quiz, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Missing title field');
      }
      // check if the quizzes are not created
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(3);
    });
  });


  // Test suite for the getQuizForCreator method with all scenarios
  describe('Test suite for getQuizForCreator method', () => {

    // before hook to create a quiz object before all the tests start and save the quiz id
    before(async () => {
      quizId = await quizModel.createQuiz(quiz);
    });

    // after hook to clean up quizzes collection after all the tests done
    after(async () => {
      await quizModel.quiz.deleteMany({});
    });

    // Test case for retrieving a quiz with valid ID and return the quiz object
    it('retrieve a quiz with valid ID and return the quiz object', async () => {
      const result = await quizModel.getQuizForCreator(quizId);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.title).to.equal(quiz.title);
      expect(result.timeToFinish).to.equal(quiz.timeToFinish);
      expect(result.answers.length).to.equal(quiz.answers.length);
      expect(result.questions.length).to.equal(quiz.questions.length);
    });

    // Test case for retrieving a quiz with invalid ID and throw an error
    it('retrieve a quiz with invalid ID and throw an error', async () => {
      try {
        await quizModel.getQuizForCreator('60f6e1b9b58fe3208a9b8b55');
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for retrieving a quiz with valid ID in a transaction with success transaction
    it('retrieve a quiz with valid ID in a transaction with success transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      // retrieve twice successfully and create a new quiz object
      await quizModel.getQuizForCreator(quizId, session);
      await quizModel.getQuizForCreator(quizId, session);
      await quizModel.createQuiz(quiz, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the quizzes are created
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(2);
    });

    // Test case for retrieving a quiz with invalid ID in a transaction with failed transaction
    it('retrieve a quiz with invalid ID in a transaction with failed transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      try {
        // retrieve twice one with invalid ID and one with valid ID and create a new quiz object
        await quizModel.getQuizForCreator(quizId, session);
        await quizModel.getQuizForCreator('60f6e1b9b58fe3208a9b8b55', session);
        await quizModel.createQuiz(quiz, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
      // check if the quizzes are not created
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(2);
    });
  });


  // Test suite for the getQuiz method with all scenarios
  describe('Test suite for getQuiz method', () => {

    // before hook to create a quiz object before all the tests start and save the quiz id
    before(async () => {
      quizId = await quizModel.createQuiz(quiz);
    });

    // after hook to clean up quizzes collection after all the tests done
    after(async () => {
      await quizModel.quiz.deleteMany({});
    });

    // Test case for retrieving a quiz with valid ID and return the quiz object
    it('retrieve a quiz with valid ID and return the quiz object', async () => {
      const result = await quizModel.getQuiz(quizId);
      // check if the result is correct
      expect(result).to.be.an('object');
      expect(result.title).to.equal(quiz.title);
      expect(result.questions.length).to.equal(quiz.questionsPerQuiz);
      expect(result.timeToFinish).to.equal(quiz.timeToFinish);
      expect(result.answers).to.equal(undefined);
    });

    // Test case for retrieving a quiz with invalid ID and throw an error
    it('retrieve a quiz with invalid ID and throw an error', async () => {
      try {
        await quizModel.getQuiz('60f6e1b9b58fe3208a9b8b55');
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for retrieving a quiz with valid ID in a transaction with success transaction
    it('retrieve a quiz with valid ID in a transaction with success transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      // retrieve twice successfully and create a new quiz object
      await quizModel.getQuiz(quizId, session);
      await quizModel.getQuiz(quizId, session);
      await quizModel.createQuiz(quiz, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the quizzes are created
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(2);
    });

    // Test case for retrieving a quiz with invalid ID in a transaction with failed transaction
    it('retrieve a quiz with invalid ID in a transaction with failed transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      try {
        // retrieve twice one with invalid ID and one with valid ID and create a new quiz object
        await quizModel.getQuiz(quizId, session);
        await quizModel.getQuiz('60f6e1b9b58fe3208a9b8b55', session);
        await quizModel.createQuiz(quiz, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
      // check if the quizzes are not created
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(2);
    });
  });


  // Test suite for updateQuizMetaData method with all scenarios
  describe('Test suite for updateQuizMetaData method', () => {

    // before hook to create a quiz object before all the tests start and save the quiz id
    before(async () => {
      quizId = await quizModel.createQuiz(quiz);
    });

    // after hook to clean up quizzes collection after all the tests done
    after(async () => {
      await quizModel.quiz.deleteMany({});
    });

    // Test case for updating a quiz with valid ID and return success message
    it('update a quiz with valid ID and return success message', async () => {
      const result = await quizModel.updateQuizMetaData(quizId, { title: 'Updated Math Quiz' });
      // check if the result is correct
      expect(result).to.be.an('string');
      expect(result).to.equal('Quiz updated successfully');
    });

    // Test case for updating a quiz with invalid ID and throw an error
    it('update a quiz with invalid ID and throw an error', async () => {
      try {
        await quizModel.updateQuizMetaData('60f6e1b9b58fe3208a9b8b55', { title: 'Updated Math Quiz' });
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for updating a quiz with missing required fields and throw an error
    it('update a quiz with missing required fields and throw an error', async () => {
      try {
        await quizModel.updateQuizMetaData(quizId, { title: '' });
      }
      catch (error) {
        expect(error.message).to.equal('Missing title field');
      }
    });

    // Test case for updating a quiz with answers field and throw an error
    it('update a quiz with answers field and throw an error', async () => {
      try {
        await quizModel.updateQuizMetaData(quizId, { answers: ['2', '4', '6'] });
      }
      catch (error) {
        expect(error.message).to.equal('You cannot update answers or questions fields');
      }
    });

    // Test case for updating a quiz with questions field and throw an error
    it('update a quiz with questions field and throw an error', async () => {
      try {
        await quizModel.updateQuizMetaData(quizId, { questions: [{ question: 'What is 2+2?', options: ['1', '2', '3', '4'], }] });
      }
      catch (error) {
        expect(error.message).to.equal('You cannot update answers or questions fields');
      }
    });

    // Test case for updating a quiz with valid fields in a transaction with success transaction
    it('update a quiz with valid fields in a transaction with success transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      // update the quiz object twice with valid fields
      await quizModel.updateQuizMetaData(quizId, { title: 'Updated Math Quiz2' }, session);
      await quizModel.updateQuizMetaData(quizId, { title: 'Updated Math Quiz3' }, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the quiz is updated
      const result = await quizModel.quiz.findById(quizId);
      expect(result.title).to.equal('Updated Math Quiz3');
    });

    // Test case for updating a quiz with missing required fields in a transaction with failed transaction
    it('update a quiz with missing required fields in a transaction with failed transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      try {
        // update the quiz object with missing required field and valid field
        await quizModel.updateQuizMetaData(quizId, { title: '' }, session);
        await quizModel.updateQuizMetaData(quizId, { title: 'Updated Math Quiz4' }, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Missing title field');
      }
      // check if the quiz is not updated
      const result = await quizModel.quiz.findById(quizId);
      expect(result.title).to.equal('Updated Math Quiz3');
    });
  });


  // Test suite for updateQuestionsAndAnswers method with all scenarios
  describe('Test suite for updateQuestionsAndAnswers method', () => {
    let updatedQuestion;
    let answers;

    // beforeEach hook to create a quiz object before each test start and save the quiz id
    beforeEach(async () => {
      quizId = await quizModel.createQuiz(quiz);
      // create temp updated question object and answer
      updatedQuestion = [...quiz.questions, { question: 'What is 4+4?', options: ['1', '2', '3', '8'], }];
      answers = [...quiz.answers, '8'];
    });

    // afterEach hook to clean up quizzes collection after each test done
    afterEach(async () => {
      await quizModel.quiz.deleteMany({});
    });

    // Test case for updating a quiz questions and answers with valid ID and return success message
    it('update a quiz questions and answers with valid ID and return success message', async () => {
      const result = await quizModel.updateQuestionsAndAnswers(quizId, updatedQuestion, answers);
      // check if the result correct
      expect(result).to.be.an('string');
      expect(result).to.equal('Questions and answers updated successfully');
    });

    // Test case for updating quiz questions and answers with invalid ID and throw an error
    it('update a quiz questions and answers with invalid ID and throw an error', async () => {
      try {
        await quizModel.updateQuestionsAndAnswers('60f6e1b9b58fe3208a9b8b55', updatedQuestion, answers);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for updating a quiz questions and answers with answers less than questions and throw an error
    it('update a quiz questions and answers with answers less than questions and throw an error', async () => {
      try {
        // remove one answer from the answers array
        const tempAnswers = ['2', '4'];
        await quizModel.updateQuestionsAndAnswers(quizId, updatedQuestion, tempAnswers);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz must have answers for each question');
      }
    });

    // Test case for updating a quiz questions and answers with question option less than 2 and throw an error
    it('update a quiz questions and answers with question option less than 2 and throw an error', async () => {
      try {
        // edit one question options to be less than 2
        const tempUpdatedQuestion = [...updatedQuestion, { question: 'What is 5+5?', options: ['1'], }];
        await quizModel.updateQuestionsAndAnswers(quizId, tempUpdatedQuestion, [...answers, '10']);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz must have at least two options for each question');
      }
    });

    //  Test case for updating a quiz questions and answers with questions length less than 1 and throw an error
    it('update a quiz question and answer with options less than required options and throw an error', async () => {
      try {
        // create a temp updated question object with questions less than 1
        const tempUpdatedQuestion = [];
        await quizModel.updateQuestionsAndAnswers(quizId, tempUpdatedQuestion, answers);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz must have at least one question');
      }
    });

    // Test case for updating a quiz questions and answers with valid fields in a transaction with success transaction
    it('update a quiz questions and answers with valid fields in a transaction with success transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      // update the quiz twice with valid fields
      await quizModel.updateQuestionsAndAnswers(quizId, updatedQuestion, answers, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the quiz question and answer is updated
      const result = await quizModel.quiz.findById(quizId);
      expect(result.questions.length).to.equal(4);
      expect(result.answers.length).to.equal(4);
    });

    // Test case for updating a quiz questions and answers with invalid ID in a transaction with failed transaction
    it('update a quiz questions and answers with invalid ID in a transaction with failed transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      try {
        // update the quiz with invalid ID and valid ID
        await quizModel.updateQuestionsAndAnswers(quizId, updatedQuestion, answers, session);
        await quizModel.updateQuestionsAndAnswers('60f6e1b9b58fe3208a9b8b55', updatedQuestion, answers, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
        await mongoDB.abortTransaction(session);
      }
      // check if the quiz question and answer is not updated
      const result = await quizModel.quiz.findById(quizId);
      expect(result.questions.length).to.equal(3);
      expect(result.answers.length).to.equal(3);
    });
  });


  // Test suite for the correctAnswers method with all scenarios
  describe('Test suite for correctAnswers method', () => {

    // before hook to create a quiz object before all the tests start and save the quiz id
    before(async () => {
      quizId = await quizModel.createQuiz(quiz);
    });

    // after hook to clean up quizzes collection after all the tests done
    after(async () => {
      await quizModel.quiz.deleteMany({});
    });

    // Test case for checking the correct answers of the quiz with valid ID and correct answers return the score and corrections
    it('check the correct answers of the quiz with valid ID and correct answers return the score and corrections', async () => {
      // create answerObject
      const answerObject = { 0: '2', 1: '4', };
      const result = await quizModel.correctAnswers(quizId, answerObject);
      // check if the result is correct
      expect(result).to.be.an('object');
      // check if it has correct data
      expect(result.score).to.equal(100);
      expect(result.corrections).to.be.an('array');
      expect(result.corrections).deep.equal([true, true]);
      expect(result.answers).to.be.an('array');
      expect(result.answers).deep.equal(['2', '4']);
    });

    // Test case for checking the correct answers of the quiz with valid ID and incorrect answers return the score and corrections
    it('check the correct answers of the quiz with valid ID and incorrect answers return the score and corrections', async () => {
      // create answerObject
      const answerObject = { 0: '2', 1: '3', };
      const result = await quizModel.correctAnswers(quizId, answerObject);
      // check if the result is correct
      expect(result).to.be.an('object');
      // check if it has correct data
      expect(result.score).to.equal(50);
      expect(result.corrections).to.be.an('array');
      expect(result.corrections).deep.equal([true, false]);
      expect(result.answers).to.be.an('array');
      expect(result.answers).deep.equal(['2', '4']);
    });

    // Test case for checking the correct answers of the quiz with invalid ID and throw an error
    it('check the correct answers of the quiz with invalid ID and throw an error', async () => {
      try {
        // create answerObject
        const answerObject = { 0: '2', 1: '4', };
        await quizModel.correctAnswers('60f6e1b9b58fe3208a9b8b55', answerObject);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for checking the correct answers of the quiz with answerObject less than number questionsPerQuiz and throw an error
    it('check the correct answers of the quiz with answerObject less than number questionsPerQuiz and throw an error', async () => {
      try {
        // create answerObject
        const answerObject = { 0: '2' };
        await quizModel.correctAnswers(quizId, answerObject);
      }
      catch (error) {
        expect(error.message).to.equal('Answers must be same length as questions');
      }
    });

    // Test case for checking the correct answers of the quiz with answerObject more than number questionsPerQuiz and throw an error
    it('check the correct answers of the quiz with answerObject more than number questionsPerQuiz and throw an error', async () => {
      try {
        // create answerObject
        const answerObject = { 0: '2', 1: '4', 2: '6' };
        await quizModel.correctAnswers(quizId, answerObject);
      }
      catch (error) {
        expect(error.message).to.equal('Answers must be same length as questions');
      }
    });

    // Test case for checking the correct answers of the quiz with valid ID in a transaction with success transaction
    it('check the correct answers of the quiz with valid ID in a transaction with success transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      // check the correct answers twice with valid answerObject and create a question and answer
      const answerObject = { 0: '2', 1: '4', };
      await quizModel.correctAnswers(quizId, answerObject, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for checking the correct answers of the quiz with invalid ID in a transaction with failed transaction
    it('check the correct answers of the quiz with invalid ID in a transaction with failed transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      try {
        // check the correct answers twice one with invalid ID and one with valid ID
        const answerObject = { 0: '2', 1: '4', };
        await quizModel.correctAnswers(quizId, answerObject, session);
        await quizModel.correctAnswers('60f6e1b9b58fe3208a9b8b55', answerObject, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      };
    });
  });


  // Test suite for the deleteQuiz method with all scenarios
  describe('Test suite for deleteQuiz method', () => {

    // before hook to create a quiz object before all the tests start and save the quiz id
    before(async () => {
      quizId = await quizModel.createQuiz(quiz);
    });

    // after hook to clean up quizzes collection after all the tests done
    after(async () => {
      await quizModel.quiz.deleteMany({});
    });

    // Test case for deleting a quiz with valid ID and return success message
    it('delete a quiz with valid ID and return success message', async () => {
      const result = await quizModel.deleteQuiz(quizId);
      // check if the result is correct
      expect(result).to.be.an('string');
      expect(result).to.equal('Quiz deleted successfully');
    });

    // Test case for deleting a quiz with invalid ID and throw an error
    it('delete a quiz with invalid ID and throw an error', async () => {
      try {
        await quizModel.deleteQuiz('60f6e1b9b58fe3208a9b8b55');
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for deleting a quiz with valid ID in a transaction with success transaction
    it('delete a quiz with valid ID in a transaction with success transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      // delete the quiz with valid ID after create it
      const id = await quizModel.createQuiz(quiz, session);
      await quizModel.deleteQuiz(id, session);
      quizId = await quizModel.createQuiz(quiz, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the quiz is deleted
      try {
        await quizModel.quiz.findById(id);
      } catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
      // check if the quiz number is correct
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(1);
    });

    // Test case for deleting a quiz with invalid ID in a transaction with failed transaction
    it('delete a quiz with invalid ID in a transaction with failed transaction', async () => {
      // start a transaction
      const session = await mongoDB.startSession();
      try {
        // delete the quiz with invalid ID and valid ID
        await quizModel.deleteQuiz('60f6e1b9b58fe3208a9b8b55', session);
        await quizModel.deleteQuiz(quizId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal('Quiz not found');
      }
      // check if the quiz number is correct
      const result = await quizModel.quiz.find({});
      expect(result.length).to.equal(1);
    });
  });

}).timeout(15000);
