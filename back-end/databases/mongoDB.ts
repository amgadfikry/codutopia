import { MongoClient } from 'mongodb';

// MongoDB class represents the connection to the database and the methods to interact with it
class MongoDB {
  db: any;

  /* constructor to connect to the database
    get the url from the environment variables provided by the .env file pass to server container
    connect to the database and set the db property to the database name
  */
  constructor() {
    const url: string = process.env.MONGO_URL as string;
    MongoClient.connect(url).then((client) => {
      this.db = client.db('e-learning');
    });
  }

  /* methods to add one document to the collection
    Parameters:
    - coll: string - the collection name
    - data: object - the data to be added
    Returns:
    - the id of the document added
  */
  async addOne(coll: string, data: object) {
    try {
      const restult = await this.db.collection(coll).insertOne(data);
      console.log('Successfully added');
      return restult.insertedId;
    } catch (e) {
      console.log('Error adding');
    }
  }

  /* methods to get one document from the collection 
    Parameters:
    - coll: string - the collection name
    - query: object - the query to find the document
    Returns:
    - the document found
  */
  async getOne(coll: string, query: object) {
    try {
      const result = await this.db.collection(coll).findOne(query);
      console.log('Successfully getting data');
      return result;
    } catch (e) {
      console.log('Error getting data');
    }
  }

  /* methods to get all documents from the collection
    Parameters:
    - coll: string - the collection name
    - query: object - the query to find the documents
    Returns:
    - the documents found
  */
  async getAll(coll: string, query: object) {
    try {
      const result = await this.db.collection(coll).find(query).toArray();
      console.log('Successfully getting data');
      return result;
    } catch (e) {
      console.log('Error getting data');
    }
  }

  /* methods to update one document in the collection
    Parameters:
    - coll: string - the collection name
    - query: object - the query to find the document
    - data: object - the data to be updated
    Returns:
    - the result of the operation
  */
  async updateOne(coll: string, query: object, data: object) {
    try {
      const result = await this.db.collection(coll).updateOne(query, { $set: data });
      console.log('Successfully updating data');
      return result;
    } catch (e) {
      console.log('Error updating data');
    }
  }

  /* methods to delete one documents in the collection
    Parameters:
    - coll: string - the collection name
    - query: object - the query to find the document
    Returns:
    - the result of the operation
  */
  async deleteOne(coll: string, query: object) {
    try {
      const result = await this.db.collection(coll).deleteOne(query);
      console.log('Successfully deleting data');
      return result;
    } catch (e) {
      console.log('Error deleting data');
    }
  }

  /* methods to delete many documents in the collection
    Parameters:
    - coll: string - the collection name
    - query: object - the query to find the documents
    Returns:
    - the result of the operation
  */
  async deleteMany(coll: string, query: object) {
    try {
      const result = await this.db.collection(coll).deleteMany(query);
      console.log('Successfully deleting data');
      return result;
    } catch (e) {
      console.log('Error deleting data');
    }
  }

  /* methods to count the documents in the collection
    Parameters:
    - coll: string - the collection name
    Returns:
    - the number of documents
  */
  async countColl(coll: string) {
    try {
      const result = await this.db.collection(coll).countDocuments();
      console.log('Successfully counting data');
      return result;
    } catch (e) {
      console.log('Error counting data');
    }
  }
}

// create an instance of the MongoDB class and export it
const mongoDB = new MongoDB();
export default mongoDB;
