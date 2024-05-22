import mongoose from 'mongoose';
import UserModel from './models/userModel.js';

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

const mongoDB = new MongoDB();
const userModel = new UserModel();
export default mongoDB;
export {
  userModel
}
