import QuizSchema from "../schemas/quizSchema.js";

// QuizModel class to interact with the quizzes collection in the database
class QuizModel extends QuizSchema {

  constructor() {
    super();
  }

  /* CreateQuiz method to create a new quiz in the database
    Parameters:
      - quiz: object with the quiz data
      - session: optional session for the transaction
    Returns:
      - quiz id of the created quiz
    Errors:
      - Quiz could not be created
      - Missing required field
      - Quiz must have answers for each question
      - Other errors
  */
  async createQuiz(quiz, session = null) {
    // validate answers is same length as questions
    if (quiz.questions.length > 1 && quiz.answers.length !== quiz.questions.length) {
      throw new Error('Quiz must have answers for each question');
    }

    // assign id to each question equal to the index
    if (quiz.questions.length > 0) {
      quiz.questions = quiz.questions.map((question, index) => ({ ...question, id: index }));
    }

    try {
      // Create a new quiz in the database
      const newQuiz = await this.quiz.create([quiz], { session });
      // if the quiz could not be created, throw an error
      if (!newQuiz) {
        throw new Error(`Quiz could not be created`);
      }
      return newQuiz[0]._id;
    }
    catch (error) {
      // if the error message includes 'Quiz must have', throw an error with the message
      if (error.message.includes('Quiz must have')) {
        throw new Error(error.message.split(': ')[2]);
      } else if (error.name === 'ValidationError') {
        // If the error is a validation error, throw an error with the missing field
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        throw error;
      }
    }
  }

  /* GetQuiz method to retrieve a quiz from the database
    Parameters:
      - quizId: ID of the quiz to retrieve
      - session: optional session for the transaction
    Returns:
      - the quiz object with the questions length equal to questionsPerQuiz randomly selected questions
    Errors:
      - Quiz not found
  */
  async getQuiz(quizId, session = null) {
    try {
      // Retrieve the quiz with the specific ID
      const quiz = await this.quiz.findById(quizId, {}, { session });
      // if the quiz is not found, throw an error
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      // retrieve questions from the quiz document
      const questions = quiz.questions;
      // shuffle the questions array
      QuizModel.shuffleArray(questions);
      // update the questions array with the first n questions
      quiz.questions = questions.slice(0, quiz.questionsPerQuiz);
      // remove answers from returned quiz
      quiz.answers = undefined;
      return quiz;
    }
    catch (error) {
      throw new Error('Quiz not found');
    }
  }

  /* static method shuffleArray to shuffle the array
    Parameters:
    - array: array to shuffle
    Returns:
    - shuffled array
  */
  static shuffleArray(array) {
    // loop through the array
    for (let i = array.length - 1; i > 0; i--) {
      // generate a random index
      const j = Math.floor(Math.random() * (i + 1));
      // swap the elements at index i and j
      [array[i], array[j]] = [array[j], array[i]];
    }
    // return the shuffled array
    return array;
  }

  /* updateQuizMetaData method to update a quiz metadata in the database
    Parameters:
      - quizId: ID of the quiz to update
      - quiz: object with the new quiz data
      - session: optional session for the transaction
    Returns:
      - message of the updated quiz is successful
    Errors:
      - cannot update answers or questions fields
      - Quiz not found
  */
  async updateQuizMetaData(quizId, quiz, session = null) {
    // check if quiz object is contain answers or questions fields
    if (quiz.answers || quiz.questions) {
      throw new Error('You cannot update answers or questions fields');
    }

    try {
      // Update the quiz with the specific ID
      const result = await this.quiz.findByIdAndUpdate(
        quizId,
        quiz,
        { runValidators: true, session },
      );
      // if the quiz is not found, throw an error
      if (!result) {
        throw new Error('Quiz not found');
      }
      return 'Quiz updated successfully';
    }
    catch (error) {
      if (error.name === 'ValidationError') {
        // If the error is a validation error, throw an error with the missing field
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        throw new Error('Quiz not found');
      }
    }
  }

  /* updateQuestionAndAnswer method to update question and answer in a quiz in the database
    Parameters:
      - quizId: ID of the quiz to update
      - questionId: ID of the question to update
      - questionData: object with the new question data
      - answer: string value of the new answer
      - session: optional session for the transaction
    Returns:
      - message of the updated question and answer is successful
    Errors:
      - Quiz not found
      - Question not found
      - Missing question field
      - Quiz must have 2 options for each question
  */
  async updateQuestionAndAnswer(quizId, questionId, questionData, answer, session = null) {
    // check if questionId is valid or quiz not found
    const quiz = await this.quiz.findById(quizId, {}, { session });
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    if (quiz.questions.length <= questionId) {
      throw new Error('Question not found');
    }

    try {
      // Update the quiz with the specific ID
      const result = await this.quiz.findByIdAndUpdate(
        quizId,
        { 'questions.$[question]': questionData, [`answers.${questionId}`]: answer },
        {
          runValidators: true,
          arrayFilters: [{ 'question.id': questionId }],
          session,
        },
      );
      return 'Question and answer updated successfully';
    }
    catch (error) {
      if (error.message.includes('Quiz must have')) {
        throw new Error(error.message.split(': ')[2]);
      } else if (error.name === 'ValidationError') {
        // If the error is a validation error, throw an error with the missing field
        throw new Error(`Missing question field`);
      } else {
        throw new Error('Quiz not found');
      }
    }
  }

  /* addQuestionAndAnswer method to add question and answer in a quiz in the database
    Parameters:
      - quizId: ID of the quiz to update
      - questionData: object with the new question data
      - answer: string value of the new answer
      - session: optional session for the transaction
    Returns:
      - message of the added question and answer is successful
    Errors:
      - Quiz not found
      - Quiz must have 2 options for each question
      - Missing question field
  */
  async addQuestionAndAnswer(quizId, questionData, answer, session = null) {
    try {
      // update questionData with id equal to the length of questions array
      const quiz = await this.quiz.findById(quizId, {}, { session });
      // check if the quiz is not found
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      questionData.id = quiz.questions.length;
      // Update the quiz with the specific ID
      await this.quiz.findByIdAndUpdate(
        quizId,
        { $push: { questions: questionData, answers: answer } },
        { runValidators: true, session },
      );
      return 'Question and answer added successfully';
    }
    catch (error) {
      if (error.message.includes('Quiz must have')) {
        throw new Error(error.message.split(': ')[2]);
      } else if (error.name === 'ValidationError') {
        // If the error is a validation error, throw an error with the missing field
        throw new Error(`Missing question field`);
      } else {
        throw new Error('Quiz not found');
      }
    }
  }

  /* removeQuestionAndAnswer method to remove question and answer in a quiz in the database
    Parameters:
      - quizId: ID of the quiz to update
      - questionId: ID of the question to remove
      - session: optional session for the transaction
    Returns:
      - message of the removed question and answer is successful
    Errors:
      - Quiz not found
      - Question not found
  */
  async removeQuestionAndAnswer(quizId, questionId, session = null) {
    // Get the answers from the quiz document
    const quiz = await this.quiz.findById(quizId, {}, { session });
    // check if the quiz is not found
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    // check if questionId is valid
    if (quiz.questions.length <= questionId) {
      throw new Error('Question not found');
    }

    try {
      // remove answer with index equal to questionId
      quiz.answers.splice(questionId, 1);
      // remove question with id equal to questionId
      quiz.questions = quiz.questions.filter(question => question.id !== questionId);
      // update the id of the questions
      quiz.questions = quiz.questions.map((question, index) => ({ ...question, id: index }));
      // Update the quiz with the specific ID to remove the question and answer
      await this.quiz.findByIdAndUpdate(
        quizId,
        { questions: quiz.questions, answers: quiz.answers },
        { runValidators: true, session },
      );
      return 'Question and answer removed successfully';
    }
    catch (error) {
      throw new Error('Quiz not found');
    }
  }

  /* correctAnswer method to check if the answer is correct
    Parameters:
      - quizId: ID of the quiz to check
      - answersObj: object with the answers key is question id and value is the answer
      - session: optional session for the transaction
    Returns:
      - object with the result of the answers, corrections, and score
    Errors:
      - Quiz not found
      - Answers must be same length as questions
  */
  async correctAnswers(quizId, answersObj, session = null) {
    // Retrieve the quiz with the specific ID
    const quiz = await this.quiz.findById(quizId, {}, { session });
    // if the quiz is not found, throw an error
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    // check if the answers length is same as questions length
    if (Object.keys(answersObj).length !== quiz.questionsPerQuiz) {
      throw new Error('Answers must be same length as questions');
    }

    try {
      // check if the answers are correct
      const correctAnswers = Object.keys(answersObj).map((questionId) => answersObj[questionId] === quiz.answers[questionId]);
      // calculate the score in percentage
      const score = correctAnswers.filter(answer => answer).length / quiz.questionsPerQuiz * 100;
      // create answers array with the correct answers
      const answers = Object.keys(answersObj).map((questionId) => quiz.answers[questionId]);
      // Return the result of object with the answers, corrections, and score
      return {
        corrections: correctAnswers,
        answers,
        score
      };
    } catch (error) {
      throw new Error('Quiz not found');
    }
  }

  /* deleteQuiz method to delete a quiz from the database
    Parameters:
      - quizId: ID of the quiz to delete
      - session: optional session for the transaction
    Returns:
      - message of the deleted quiz is successful
    Errors:
      - Quiz not found
  */
  async deleteQuiz(quizId, session = null) {
    try {
      // Delete the quiz with the specific ID
      const result = await this.quiz.findByIdAndDelete(quizId, { session });
      // if the quiz is not found, throw an error
      if (!result) {
        throw new Error('Quiz not found');
      }
      return 'Quiz deleted successfully';
    } catch (error) {
      // throw an error if the quiz could not be deleted
      throw new Error('Quiz not found');
    }
  }
}

// Export the QuizModel class
export default QuizModel;
