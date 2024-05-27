import { expect } from 'chai';
import { quizModel } from '../../databases/mongoDB.js';

// Test suite for the quizModel in the database mongoDB
describe('quizModel', () => {
  // define the quiz and quizId variables
  let quiz;
  let quizId;

  // Before hook to prepare the data used in the tests
  before(() => {
    // Create a new quiz object
    quiz = {
      title: 'Math Quiz',
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

  // After hook to clean up the data used in the tests
  after(async () => {
    // Delete the quizzes from the database
    await quizModel.quiz.deleteMany({});
  });


  // Test suite for the createQuiz method
  describe('createQuiz', () => {
    // Test case for creating a new quiz with valid fields
    it('CreateQuiz method create a new quiz with valid fields', async () => {
      // Create a new quiz in the database
      const result = await quizModel.createQuiz(quiz);
      // check if the result is not null
      expect(result).to.not.equal(null);
      // save the result to the quizId variable
      quizId = result;
    });

    // Test case for creating a new quiz with invalid fields not in the schema
    it('CreateQuiz method create a new quiz with invalid fields not in the schema', async () => {
      try {
        // add invaild field to the quiz object
        const tempQuiz = { ...quiz, invalidField: 'invalid' };
        // Create a new quiz in the database with invalid field
        await quizModel.createQuiz(tempQuiz);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Fields not in schema: invalidField');
      }
    });

    // Test case for creating a new quiz with missing required fields
    it('CreateQuiz method create a new quiz with missing required fields', async () => {
      try {
        // create a new quiz object with missing required field
        const tempQuiz = { ...quiz };
        delete tempQuiz.title;
        // Create a new quiz in the database with missing required field
        await quizModel.createQuiz(tempQuiz);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Missing title field');
      }
    });

    // Test case for creating a new quiz questions less than required questions
    it('CreateQuiz method create a new quiz with questions less than required questions', async () => {
      try {
        // create a new quiz object with questions less than required questions
        const tempQuiz = { ...quiz, questions: [] };
        // Create a new quiz in the database with questions less than required questions
        await quizModel.createQuiz(tempQuiz);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz must have at least one question');
      }
    });

    // Test case for creating a new quiz options less than required options
    it('CreateQuiz method create a new quiz with options less than required options', async () => {
      try {
        // create a new quiz object with options less than required options
        const tempQuiz = {
          ...quiz,
          questions: [...quiz.questions, { question: 'What is 4+4?', options: ['1'], }],
          answers: [...quiz.answers, '8'],
        };
        // Create a new quiz in the database with options less than required options
        await quizModel.createQuiz(tempQuiz);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz must have at least two options for each question');
      }
    });

    //Test case for creating a new quiz with answers less than number of questions
    it('CreateQuiz method create a new quiz with answers less than number of questions', async () => {
      try {
        // create a new quiz object with answers less than number of questions
        const tempQuiz = { ...quiz, answers: ['2'] };
        // Create a new quiz in the database with answers less than number of questions
        await quizModel.createQuiz(tempQuiz);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz must have answers for each question');
      }
    });

    // Test case for creating a new quiz with answers more than number of questions
    it('CreateQuiz method create a new quiz with answers more than number of questions', async () => {
      try {
        // create a new quiz object with answers more than number of questions
        const tempQuiz = { ...quiz, answers: ['2', '4', '6', '8'] };
        // Create a new quiz in the database with answers more than number of questions
        await quizModel.createQuiz(tempQuiz);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz must have answers for each question');
      }
    });
  });


  // Test suite for the getQuiz method
  describe('getQuiz', () => {
    // Test case for retrieving a quiz with valid ID
    it('GetQuiz method retrieve a quiz with valid ID', async () => {
      // Retrieve the quiz with the specific ID
      const result = await quizModel.getQuiz(quizId);
      // check if the result is object
      expect(result).to.be.an('object');
      // check if it hascorrect data
      expect(result.title).to.equal(quiz.title);
      expect(result.questions.length).to.equal(quiz.questionsPerQuiz);
      expect(result.timeToFinish).to.equal(quiz.timeToFinish);
      expect(result.answers).to.equal(undefined);
    });

    // Test case for retrieving a quiz with invalid ID
    it('GetQuiz method retrieve a quiz with invalid ID', async () => {
      try {
        // Retrieve the quiz with the invalid ID
        await quizModel.getQuiz('invalid');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz not found');
      }
    });
  });


  // Test suite for updateQuizMetaData method
  describe('updateQuizMetaData', () => {
    // Test case for updating a quiz with valid ID
    it('updateQuizMetaData method update a quiz with valid ID', async () => {
      // Update the quiz with the specific ID
      const result = await quizModel.updateQuizMetaData(quizId, { title: 'Updated Math Quiz' });
      // check if the result is string
      expect(result).to.be.an('string');
      // check if it has correct message
      expect(result).to.equal('Quiz updated successfully');
      // save the result to the quiz object
      quiz.title = 'Updated Math Quiz';
    });

    // Test case for updating a quiz with invalid ID
    it('updateQuizMetaData method update a quiz with invalid ID', async () => {
      try {
        // Update the quiz with the invalid ID
        await quizModel.updateQuizMetaData('invalid', { title: 'Updated Math Quiz' });
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for updating a quiz with invalid fields not in the schema
    it('updateQuizMetaData method update a quiz with invalid fields not in the schema', async () => {
      try {
        // Update the quiz with invalid field
        await quizModel.updateQuizMetaData(quizId, { invalidField: 'invalid' });
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Fields not in schema: invalidField');
      }
    });

    // Test case for updating a quiz with missing required fields
    it('updateQuizMetaData method update a quiz with missing required fields', async () => {
      try {
        // Update the quiz with missing required field
        await quizModel.updateQuizMetaData(quizId, { title: '' });
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Missing title field');
      }
    });

    // Test case for updating a quiz with answers field
    it('updateQuizMetaData method update a quiz with answers field', async () => {
      try {
        // Update the quiz with answers field
        await quizModel.updateQuizMetaData(quizId, { answers: ['2', '4', '6'] });
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('You cannot update answers or questions fields');
      }
    });

    // Test case for updating a quiz with questions field
    it('updateQuizMetaData method update a quiz with questions field', async () => {
      try {
        // Update the quiz with questions field
        await quizModel.updateQuizMetaData(quizId, { questions: [{ question: 'What is 2+2?', options: ['1', '2', '3', '4'], }] });
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('You cannot update answers or questions fields');
      }
    });
  });


  // Test suite for updateQuestionAndAnswer method
  describe('updateQuestionAndAnswer', () => {
    // Test case for updating a quiz question and answer with valid ID
    it('updateQuestionAndAnswer method update a quiz question and answer with valid ID', async () => {
      // Update the quiz question and answer with the specific ID
      const updatedQuestion = {
        id: 2,
        question: 'What is 8+8?',
        options: ['1', '2', '3', '16'],
      };
      const answer = '16';
      const result = await quizModel.updateQuestionAndAnswer(quizId, updatedQuestion.id, updatedQuestion, answer);
      // check if the result is string
      expect(result).to.be.an('string');
      // check if it has correct message
      expect(result).to.equal('Question and answer updated successfully');
    });

    // Test case for updating a quiz question and answer with invalid ID
    it('updateQuestionAndAnswer method update a quiz question and answer with invalid ID', async () => {
      try {
        // Update the quiz question and answer with the invalid ID
        await quizModel.updateQuestionAndAnswer('invalid', 2, {}, '16');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Question not found');
      }
    });

    // Test case for updating a quiz question and answer with missing question field
    it('updateQuestionAndAnswer method update a quiz question and answer with missing question fields', async () => {
      try {
        const updatedQuestion = {
          id: 2,
          question: '',
          options: ['1', '2', '3', '16'],
        };
        // Update the quiz question and answer with missing required field
        await quizModel.updateQuestionAndAnswer(quizId, updatedQuestion.id, updatedQuestion, '16');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Missing question field');
      }
    });

    //  Test case for updating a quiz question and answer with options less than required options
    it('updateQuestionAndAnswer method update a quiz question and answer with options less than required options', async () => {
      try {
        const updatedQuestion = {
          id: 2,
          question: 'What is 8+8?',
          options: ['1'],
        };
        // Update the quiz question and answer with options less than required options
        await quizModel.updateQuestionAndAnswer(quizId, updatedQuestion.id, updatedQuestion, '16');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz must have at least two options for each question');
      }
    });
  });


  // Test suite for the addQuestionAndAnswer method
  describe('addQuestionAndAnswer', () => {
    // Test case for adding a new quiz question and answer with valid ID
    it('addQuestionAndAnswer method add a new quiz question and answer with valid ID', async () => {
      // Add a new quiz question and answer with the specific ID
      const newQuestion = {
        question: 'What is 10+10?',
        options: ['1', '2', '3', '20'],
      };
      const answer = '20';
      const result = await quizModel.addQuestionAndAnswer(quizId, newQuestion, answer);
      // check if the result is string
      expect(result).to.be.an('string');
      // check if it has correct message
      expect(result).to.equal('Question and answer added successfully');
    });

    // Test case for adding a new quiz question and answer with invalid ID
    it('addQuestionAndAnswer method add a new quiz question and answer with invalid ID', async () => {
      try {
        // Add a new quiz question and answer with the invalid ID
        await quizModel.addQuestionAndAnswer('invalid', {}, '20');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for adding a new quiz question and answer with missing question field
    it('addQuestionAndAnswer method add a new quiz question and answer with missing question field', async () => {
      try {
        const newQuestion = {
          question: '',
          options: ['1', '2', '3', '20'],
        };
        // Add a new quiz question and answer with missing required field
        await quizModel.addQuestionAndAnswer(quizId, newQuestion, '20');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Missing question field');
      }
    });

    // Test case for adding a new quiz question and answer with options less than required options
    it('addQuestionAndAnswer method add a new quiz question and answer with options less than required options', async () => {
      try {
        const newQuestion = {
          question: 'What is 10+10?',
          options: ['1'],
        };
        // Add a new quiz question and answer with options less than required options
        await quizModel.addQuestionAndAnswer(quizId, newQuestion, '20');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz must have at least two options for each question');
      }
    });
  });


  // Test suite for the removeQuestionAndAnswer method
  describe('removeQuestionAndAnswer', () => {
    // Test case for removing a quiz question and answer with valid ID
    it('removeQuestionAndAnswer method remove a quiz question and answer with valid ID', async () => {
      // Remove the quiz question and answer with the specific ID
      const result = await quizModel.removeQuestionAndAnswer(quizId, 2);
      // check if the result is string
      expect(result).to.be.an('string');
      // check if it has correct message
      expect(result).to.equal('Question and answer removed successfully');
    });

    // Test case for removing a quiz question and answer with invalid ID
    it('removeQuestionAndAnswer method remove a quiz question and answer with invalid ID', async () => {
      try {
        // Remove the quiz question and answer with the invalid ID
        await quizModel.removeQuestionAndAnswer('invalid', 2);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for removing a quiz question and answer with invalid question ID
    it('removeQuestionAndAnswer method remove a quiz question and answer with invalid question ID', async () => {
      try {
        // Remove the quiz question and answer with the invalid question ID
        await quizModel.removeQuestionAndAnswer(quizId, 10);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Question not found');
      }
    });
  });


  // Test suite for the correctAnswers method
  describe('correctAnswers', () => {
    // Test case for checking the correct answers of the quiz with valid ID and correct answers
    it('correctAnswers method check the correct answers of the quiz with valid ID and correct answers', async () => {
      // create answerObject
      const answerObject = {
        0: '2',
        1: '4',
      };
      // Check the correct answers of the quiz with the specific ID
      const result = await quizModel.correctAnswers(quizId, answerObject);
      // check if the result object
      expect(result).to.be.an('object');
      // check if it has correct data
      expect(result.score).to.equal(100);
      expect(result.corrections).to.be.an('array');
      expect(result.corrections).deep.equal([true, true]);
      expect(result.answers).to.be.an('array');
      expect(result.answers).deep.equal(['2', '4']);
    });

    // Test case for checking the correct answers of the quiz with valid ID and incorrect answers
    it('correctAnswers method check the correct answers of the quiz with valid ID and incorrect answers', async () => {
      // create answerObject
      const answerObject = {
        0: '2',
        1: '3',
      };
      // Check the correct answers of the quiz with the specific ID
      const result = await quizModel.correctAnswers(quizId, answerObject);
      // check if the result object
      expect(result).to.be.an('object');
      // check if it has correct data
      expect(result.score).to.equal(50);
      expect(result.corrections).to.be.an('array');
      expect(result.corrections).deep.equal([true, false]);
      expect(result.answers).to.be.an('array');
      expect(result.answers).deep.equal(['2', '4']);
    });

    // Test case for checking the correct answers of the quiz with invalid ID
    it('correctAnswers method check the correct answers of the quiz with invalid ID', async () => {
      try {
        // Check the correct answers of the quiz with the invalid ID
        await quizModel.correctAnswers('invalid');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz not found');
      }
    });

    // Test case for checking the correct answers of the quiz with answerObject less than number of questions
    it('correctAnswers method check the correct answers of the quiz with answerObject less than number of questions', async () => {
      try {
        // create answerObject
        const answerObject = {
          0: '2',
        };
        // Check the correct answers of the quiz with the specific ID
        await quizModel.correctAnswers(quizId, answerObject);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Answers must be same length as questions');
      }
    });
  });


  // Test suite for the deleteQuiz method
  describe('deleteQuiz', () => {
    // Test case for deleting a quiz with valid ID
    it('deleteQuiz method delete a quiz with valid ID', async () => {
      // Delete the quiz with the specific ID
      const result = await quizModel.deleteQuiz(quizId);
      // check if the result is string
      expect(result).to.be.an('string');
      // check if it has correct message
      expect(result).to.equal('Quiz deleted successfully');
    });

    // Test case for deleting a quiz with invalid ID
    it('deleteQuiz method delete a quiz with invalid ID', async () => {
      try {
        // Delete the quiz with the invalid ID
        await quizModel.deleteQuiz('invalid');
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal('Quiz not found');
      }
    });
  });
});