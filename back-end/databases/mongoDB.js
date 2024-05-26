import mongoose from 'mongoose';
import UserModel from './models/userModel.js';
import LessonModel from './models/lessonModel.js';

// MongoDB class represents the connection to the database and the methods to interact with it
class MongoDB {
  /* constructor to connect to the database
    get the url from the environment variables provided by the .env file pass to server container
    connect to the database and set the db property to the database name
  */
  constructor() {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const envVar = process.env.NODE_ENV;
    const dbName = envVar === 'test' ? 'test' : envVar === 'dev' ? 'codutopia' : dbName;
    this.db = mongoose
      .connect(`${url}/${dbName}`)
      .then(() => {
        console.log('Connected to the mongoDB');
      })
      .catch((err) => {
        console.log('Error connecting to the database', err);
      });
  }
}

// Create an instance of the MongoDB class
const mongoDB = new MongoDB();

// Create an instance of all models to interact with the database
const userModel = new UserModel();
const lessonModel = new LessonModel();

// Export the mongoDB instance and all models
export default mongoDB;
export {
  userModel, lessonModel,
}
