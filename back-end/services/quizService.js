import { lessonModel, quizModel } from '../databases/mongoDB.js';
import mongoDB from '../databases/mongoDB.js';


/* createNewQuiz function to create a new quiz in the database
  and add the quiz to the lesson document in the database
  Parameters:
    - lessonId: the id of the lesson document in the database
    - quizData: the data of the quiz to be created
  Return:
    - Message: 'Quiz created and added to the lesson successfully'
  Errors:
    - questions is same length as answers
    - questions is less than 1
    - options is less than 2
    - missing required fields
  */
export async function createNewQuiz(lessonId, quizData) {
  // start a new session with the database
  const session = mongoDB.startSession();
  try {
    // create a new quiz document in the database
    const newQuiz = await quizModel.createQuiz(quizData, session);
    // add the quiz to the lesson document in the database
    await lessonModel.addQuizToLesson(lessonId, newQuiz, session);
    // commit the transaction
    await mongoDB.commitTransaction(session);
    // return a success message
    return 'Quiz created and added to the lesson successfully';
  } catch (error) {
    // abort the transaction
    await mongoDB.abortTransaction(session);
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}


/* getQuizForLearner function to get a quiz from the database
  Parameters:
    - quizId: the id of the quiz document in the database
  Return:
    - Quiz document data
  Errors:
    - Quiz not found
  */
export async function getQuizForLearner(quizId) {
  try {
    // get the quiz document from the database
    const quiz = await quizModel.getQuiz(quizId);
    return quiz;
  } catch (error) {
    throw new Error(error.message);
  }
}

/* getQuizForInstructor function to get a quiz from the database
  Parameters:
    - quizId: the id of the quiz document in the database
  Return:
    - Quiz document data
  Errors:
    - Quiz not found
  */
export async function getQuizForInstructor(quizId) {
  try {
    // get the quiz document from the database
    const quiz = await quizModel.getQuizForCreator(quizId);
    return quiz;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* updateQuiz function to update a quiz in the database (metadata, questions and answers)
  Parameters:
    - quizId: the id of the quiz document in the database
    - quizData: the data of the quiz to be updated
  Return:
    - Message: 'Quiz updated successfully'
  Errors:
    - Quiz not found
    - Missing required fields
  */
export async function updateQuiz(quizId, updatedData) {
  // start a new session with the database
  const session = mongoDB.startSession();
  try {
    // update questions and answers fields in the quiz document in the database
    await quizModel.updateQuestionsAndAnswers(quizId, updatedData.questions, updatedData.answers, session);
    // remove questions and answers from the updatedData object
    delete updatedData.questions;
    delete updatedData.answers;
    // update metadata fields in the quiz document in the database
    await quizModel.updateQuizMetaData(quizId, updatedData, session);
    // commit the transaction
    await mongoDB.commitTransaction(session);
    // return a success message
    return 'Quiz updated successfully';
  }
  catch (error) {
    // abort the transaction
    await mongoDB.abortTransaction(session);
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}


/* correctQuiz function to correct a quiz from the database
  Parameters:
    - quizId: the id of the quiz document in the database
    - answers: the answers of the learner
  Return:
    - Score: the score of the learner
  Errors:
    - Quiz not found
    - Answers must be same length as questions
  */
export async function correctQuiz(quizId, answers) {
  try {
    // correct the quiz and get the score
    const result = await quizModel.correctAnswers(quizId, answers);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

/* removeQuiz function to delete a quiz from the database and remove it from the lesson document
  Parameters:
    - quizId: the id of the quiz document in the database
    - lessonId: the id of the lesson document in the database
  Return:
    - Message: 'Quiz deleted successfully'
  Errors:
    - Quiz not found
  */
export async function removeQuiz(quizId, lessonId) {
  // start a new session with the database
  const session = mongoDB.startSession();
  try {
    // delete the quiz document from the database
    await quizModel.deleteQuiz(quizId, session);
    // remove the quiz from the lesson document in the database
    await lessonModel.removeQuizFromLesson(lessonId, session);
    // commit the transaction
    await mongoDB.commitTransaction(session);
    // return a success message
    return 'Quiz removed successfully';
  } catch (error) {
    // abort the transaction
    await mongoDB.abortTransaction(session);
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}