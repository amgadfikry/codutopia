import { MongoClient } from 'mongodb';

// MongoDB class represents the connection to the database and the methods to interact with it
class MongoDB {
  /* constructor to connect to the database
    get the url from the environment variables provided by the .env file pass to server container
    connect to the database and set the db property to the database name
  */
  constructor() {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
    MongoClient.connect(url).then((client) => {
      this.db = client.db('e-learning');
    });
  }

  /* methods to add one document to the collection
    Parameters:
    - coll - the collection name
    - data - the data to be added
    Returns:
    - the id of the document added
  */
  async addOne(coll, data) {
    try {
      const restult = await this.db.collection(coll).insertOne(data);
      return restult.insertedId;
    } catch (e) {
      console.log('Error adding');
    }
  }

  /* methods to get one document from the collection 
    Parameters:
    - coll - the collection name
    - query - the query to find the document
    Returns:
    - the document found
  */
  async getOne(coll, query) {
    try {
      return await this.db.collection(coll).findOne(query);
    } catch (e) {
      console.log('Error getting data');
    }
  }

  /* methods to get all documents from the collection
    Parameters:
    - coll - the collection name
    - query - the query to find the documents
    Returns:
    - the documents found
  */
  async getAll(coll, query) {
    try {
      return await this.db.collection(coll).find(query).toArray();
    } catch (e) {
      console.log('Error getting data: ', e);
    }
  }

  /* methods to update one document in the collection
    Parameters:
    - coll - the collection name
    - query - the query to find the document
    - data - the data to be updated
    Returns:
    - the result of the operation
  */
  async updateOne(coll, query, data) {
    try {
      return await this.db.collection(coll).updateOne(query, { $set: data });
    } catch (e) {
      console.log('Error updating data: ', e);
    }
  }

  /* methods to delete one documents in the collection
    Parameters:
    - coll - the collection name
    - query - the query to find the document
    Returns:
    - the result of the operation
  */
  async deleteOne(coll, query) {
    try {
      return await this.db.collection(coll).deleteOne(query);
    } catch (e) {
      console.log('Error deleting data: ', e);
    }
  }

  /* methods to delete many documents in the collection
    Parameters:
    - coll - the collection name
    - query - the query to find the documents
    Returns:
    - the result of the operation
  */
  async deleteMany(coll, query) {
    try {
      return await this.db.collection(coll).deleteMany(query);
    } catch (e) {
      console.log('Error deleting data: ', e);
    }
  }

  /* methods to count the documents in the collection
    Parameters:
    - coll - the collection name
    Returns:
    - the number of documents
  */
  async countColl(coll) {
    try {
      return await this.db.collection(coll).countDocuments();
    } catch (e) {
      console.log('Error counting data: ', e);
    }
  }
}

// create an instance of the MongoDB class and export it
const mongoDB = new MongoDB();
export default mongoDB;
