import mongoose from 'mongoose';
import UserModel from './models/userModel.js';
import LessonModel from './models/lessonModel.js';
import QuizModel from './models/quizModel.js';
import PaymentModel from './models/paymentModel.js';
import CourseModel from './models/courseModel.js';
import ReviewModel from './models/reviewModel.js';
import LessonContentModel from './models/lessonContentModel.js';

// MongoDB class represents the connection to the database and the methods to interact with database
class MongoDB {
  /* constructor to connect to the database
    - get the url from the environment variables or use the default url
    - connect to the database and set the db property to the database name according to working environment
  */
  constructor() {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27017'; // URL of the database
    const workEnv = process.env.NODE_ENV;
    const dbName = workEnv === 'dev' ? 'dev' : 'codutopia' // database name according to working environment
    const replicaSet = workEnv === 'dev' ? 'rs0' : 'codutopia'; // replica set name according to working environment
    this.db = mongoose
      .connect(`${url}/${dbName}`, { replicaSet })
      .then(() => {
        console.log('Connected to the mongoDB');
      })
      .catch((err) => {
        console.log('Error connecting to the database', err);
      });
  }

  /* startSession method to start a session and start a transaction
    Returns:
      - the session object
  */
  async startSession() {
    const session = await mongoose.startSession();
    session.startTransaction();
    return session;
  }

  /* abortTransaction method to abort a transaction and end the session
    Parameters:
      - session: session object to abort the transaction
  */
  async abortTransaction(session) {
    await session.abortTransaction();
    await session.endSession();
  }

  /* commitTransaction method to commit a transaction and end the session
    Parameters:
      - session: session object to commit the transaction
  */
  async commitTransaction(session) {
    await session.commitTransaction();
    await session.endSession();
  }
}

// Create an instance of the MongoDB class
const mongoDB = new MongoDB();

// Create an instance of all models classes to interact with each collection in the database
const userModel = new UserModel();
const lessonModel = new LessonModel();
const quizModel = new QuizModel();
const paymentModel = new PaymentModel();
const courseModel = new CourseModel();
const reviewModel = new ReviewModel();
const lessonContentModel = new LessonContentModel();


export default mongoDB;
export {
  userModel, lessonModel, quizModel, paymentModel, courseModel, reviewModel, lessonContentModel
}
