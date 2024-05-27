import QuizSchema from "../schemas/quizSchema.js";

// QuizModel class to interact with the quizzes collection in the database
class QuizModel extends QuizSchema {
  constructor() {
    // Call the parent class constructor
    super();
  }

  /* CreateQuiz method to create a new quiz in the database
    Parameters:
      - quiz: object with the quiz data
    Returns:
      - the ID of the new quiz
      - error if the quiz could not be created with specific message
  */
  async createQuiz(quiz) {
    // check if quiz object is contain invalid fields
    const invalidFields = Object.keys(quiz).filter(key => !Object.keys(this.quizSchema.obj).includes(key));
    // throw an error if the quiz object contain invalid fields
    if (invalidFields.length > 0) {
      throw new Error(`Fields not in schema: ${invalidFields.join(', ')}`);
    }

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
      const newQuiz = await this.quiz.create(quiz);
      // Return the ID of the new quiz
      return newQuiz._id;
    } catch (error) {
      // if the error message includes 'You need', throw an error with the message
      if (error.message.includes('Quiz must have')) {
        throw new Error(error.message.split(': ')[2]);
      } else {
        // throw an error if the quiz could not be created
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      }
    }
  }

  /* GetQuiz method to retrieve a quiz from the database
    Parameters:
      - quizId: ID of the quiz to retrieve
    Returns:
      - the quiz object with the specific ID
      - error if the quiz could not be found
  */
  async getQuiz(quizId) {
    try {
      // Retrieve the quiz with the specific ID
      const quiz = await this.quiz.findById(quizId);
      // retrieve questions from the quiz document
      const questions = quiz.questions;
      // shuffle the questions array
      QuizModel.shuffleArray(questions);
      // update the questions array with the first n questions
      quiz.questions = questions.slice(0, quiz.questionsPerQuiz);
      // remove answers from returned quiz
      quiz.answers = undefined;
      // Return the quiz object
      return quiz;
    } catch (error) {
      // throw an error if the quiz could not be found
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

  /* updateQuizMetaData method to update a quiz in the database
    Parameters:
      - quizId: ID of the quiz to update
      - quiz: object with the new quiz data
    Returns:
      - message of the updated quiz is successful
      - error if the quiz could not be updated
  */
  async updateQuizMetaData(quizId, quiz) {
    // check if quiz object is contain invalid fields
    const invalidFields = Object.keys(quiz).filter(key => !Object.keys(this.quizSchema.obj).includes(key));
    // throw an error if the quiz object contain invalid fields
    if (invalidFields.length > 0) {
      throw new Error(`Fields not in schema: ${invalidFields.join(', ')}`);
    }

    // check if quiz object is contain answers or questions fields
    if (quiz.answers || quiz.questions) {
      throw new Error('You cannot update answers or questions fields');
    }

    try {
      // Update the quiz with the specific ID
      await this.quiz.findByIdAndUpdate(
        quizId,
        quiz,
        { runValidators: true },
      );
      // Return message of the updated quiz
      return 'Quiz updated successfully';
    } catch (error) {
      // if error is invalid id, throw an error with the message
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('Quiz not found');
      } else {
        // throw an error if the quiz could not be updated
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      }
    }
  }

  /* updateQuestionAndAnswer method to update question and answer in a quiz in the database
    Parameters:
      - quizId: ID of the quiz to update
      - questionId: ID of the question to update
      - questionData: object with the new question data
      - answer: string value of the new answer
    Returns:
      - message of the updated question and answer is successful
      - error if the quiz could not be updated
  */
  async updateQuestionAndAnswer(quizId, questionId, questionData, answer) {
    try {
      // Update the quiz with the specific ID
      await this.quiz.findByIdAndUpdate(
        quizId,
        { 'questions.$[question]': questionData, [`answers.${questionId}`]: answer },
        {
          runValidators: true,
          new: true,
          arrayFilters: [{ 'question.id': questionId }]
        },
      );
      // Return message of the updated question and answer
      return 'Question and answer updated successfully';
    } catch (error) {
      // if error is invalid id, throw an error with the message
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('Question not found');
      } else if (error.message.includes('Quiz must have')) {
        throw new Error(error.message.split(': ')[2]);
      } else {
        // throw an error if the quiz could not be updated
        throw new Error(`Missing question field`);
      }
    }
  }

  /* addQuestionAndAnswer method to add question and answer in a quiz in the database
    Parameters:
      - quizId: ID of the quiz to update
      - questionData: object with the new question data
      - answer: string value of the new answer
    Returns:
      - message of the added question and answer is successful
      - error if the quiz could not be updated
  */
  async addQuestionAndAnswer(quizId, questionData, answer) {
    try {
      // update questionData with id equal to the length of questions array
      const quiz = await this.quiz.findById(quizId);
      questionData.id = quiz.questions.length;
      // Update the quiz with the specific ID
      await this.quiz.findByIdAndUpdate(
        quizId,
        { $push: { questions: questionData, answers: answer } },
        { runValidators: true },
      );
      // Return message of the added question and answer
      return 'Question and answer added successfully';
    } catch (error) {
      // if error is invalid id, throw an error with the message
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('Quiz not found');
      } else if (error.message.includes('Quiz must have')) {
        throw new Error(error.message.split(': ')[2]);
      } else {
        // throw an error if the quiz could not be updated
        throw new Error(`Missing question field`);
      }
    }
  }

  /* removeQuestionAndAnswer method to remove question and answer in a quiz in the database
    Parameters:
      - quizId: ID of the quiz to update
      - questionId: ID of the question to remove
    Returns:
      - message of the removed question and answer is successful
      - error if the quiz could not be updated
  */
  async removeQuestionAndAnswer(quizId, questionId) {
    try {
      // Get the answers from the quiz document
      const quiz = await this.quiz.findById(quizId);
      // check if questionId is valid
      if (!quiz.questions[questionId]) {
        throw error;
      }
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
        { runValidators: true },
      );
      // Return message of the removed question and answer
      return 'Question and answer removed successfully';
    } catch (error) {
      // if error is invalid id, throw an error with the message
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('Quiz not found');
      } else {
        // throw an error if the quiz could not be updated
        throw new Error('Question not found');
      }
    }
  }

  /* correctAnswer method to check if the answer is correct
    Parameters:
      - quizId: ID of the quiz to check
      - answersObj: object with the answers key is question id and value is the answer
    Returns:
      - object with the result of the answers
      - error if the quiz could not be found
  */
  async correctAnswers(quizId, answersObj) {
    try {
      // Retrieve the quiz with the specific ID
      const quiz = await this.quiz.findById(quizId);
      // check if the answers length is same as questions length
      if (Object.keys(answersObj).length !== quiz.questionsPerQuiz) {
        throw error;
      }
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
      // if error is invalid id, throw an error with the message
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('Quiz not found');
      } else {
        // throw an error answers length is not same as questions length
        throw new Error('Answers must be same length as questions');
      }
    }
  }

  /* deleteQuiz method to delete a quiz from the database
    Parameters:
      - quizId: ID of the quiz to delete
    Returns:
      - message of the deleted quiz is successful
      - error if the quiz could not be deleted
  */
  async deleteQuiz(quizId) {
    try {
      // Delete the quiz with the specific ID
      await this.quiz.findByIdAndDelete(quizId);
      // Return message of the deleted quiz
      return 'Quiz deleted successfully';
    } catch (error) {
      // throw an error if the quiz could not be deleted
      throw new Error('Quiz not found');
    }
  }
}

// Export the QuizModel class
export default QuizModel;
