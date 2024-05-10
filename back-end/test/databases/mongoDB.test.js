import mongoDB from '../../databases/mongoDB.js';
import { expect } from 'chai';

// Test suite for the mongoDB module and its methods by connecting to the database
describe('Unittest of MongoDB', () => {
  // variable to save id of the document
  let id;

  //after all tests are finished remove the test collection  
  after(async () => {
    await mongoDB.db.collection('test').drop();
  });

  //Test case when add new document to the collection
  it('AddOne add new document to collection', async () => {
    const result = await mongoDB.addOne('test', { name: 'test0', age: 20 });
    id = result;
    // expect the result to be an objectID of the added document
    expect(result).to.be.an('object');
  });

  //Test case when add many documents to the collection 
  it('AddMany add many documents to collection', async () => {
    const manyDocuments = []
    // add 15 documents to the collection with the same age
    for (let i = 1; i < 16; i++) {
      manyDocuments.push({ name: `test${i}`, age: 30 });
    }
    const result = await mongoDB.addMany('test', manyDocuments);
    expect(result).to.be.an('object');
    expect(result.insertedCount).to.equal(15);
  });

  //Test case when get one document from the collection
  it('GetOne get one document from collection successfully', async () => {
    // get the document by the id of the added document in the first test case
    const result = await mongoDB.getOne('test', { _id: id });
    expect(result).to.be.an('object');
    expect(result).deep.equal({ _id: id, name: 'test0', age: 20 });
    expect(result._id.toString()).to.equal(id.toString());
  });

  //Test case when get all documents from the collection
  it('GetAll when get all documents from collection ', async () => {
    // get all documents from the collection using an empty query
    const result = await mongoDB.getAll('test', {});
    expect(result).to.be.an('array');
    expect(result.length).to.equal(16);
  });

  //Test case when get a specific number of documents per page from the collection
  it('Pagination get a specific number of documents per page from collection', async () => {
    // get first 10 documents per page from the collection 
    const result = await mongoDB.pagination('test', {}, 1, 10);
    expect(result).to.be.an('array');
    expect(result.length).to.equal(10);
    // get the second 10 documents per page from the collection
    const result2 = await mongoDB.pagination('test', {}, 2, 10);
    expect(result2).to.be.an('array');
    expect(result2.length).to.equal(6);
  });

  // Test case when get many documents from the collection query by a list of values
  it('GetFromList documents get many documents from the collection in the list', async () => {
    // get documents from the collection by list of names
    const result = await mongoDB.getFromList('test', 'name', ['test1', 'test2', 'test3', 'test4', 'test5']);
    expect(result.length).to.equal(5);
    expect(result[0].name).to.equal('test1');
  });

  // Test case when update one document in the collection using $set
  it('Using $set opeartor to update document', async () => {
    // update the age of the document to 25
    const result = await mongoDB.updateOne('test', { _id: id }, { $set: { age: 25 } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { _id: id });
    expect(value.age).to.equal(25);
  });

  // Test case when update one document in the collection using $inc
  it('Using $inc opeartor to update document', async () => {
    // increment the age of the document by 1
    const result = await mongoDB.updateOne('test', { _id: id }, { $inc: { age: 1 } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { _id: id });
    expect(value.age).to.equal(26);
  });

  // Test case when update one document in the collection using $unset
  it('Using $unset opeartor to update document', async () => {
    // remove the age field from the document
    const result = await mongoDB.updateOne('test', { _id: id }, { $unset: { age: '' } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { _id: id });
    expect(value.age).to.equal(undefined);
  });

  //Test case when update one document in the collection using $push
  it('Using $push opeartor to update document', async () => {
    // add a new hobby list to the document
    await mongoDB.updateOne('test', { _id: id }, { $set: { hobbies: [] } });
    // push a new hobby to the document hobbies list
    const result = await mongoDB.updateOne('test', { _id: id }, { $push: { hobbies: 'football' } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { _id: id });
    expect(value.hobbies).to.be.an('array');
    expect(value.hobbies.length).to.equal(1);
    expect(value.hobbies[0]).to.equal('football');
  });

  //Test case when update one document in the collection using $pull
  it('Using $pull opeartor to update document', async () => {
    // pull the hobby from the document hobbies list
    const result = await mongoDB.updateOne('test', { _id: id }, { $pull: { hobbies: 'football' } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { _id: id });
    expect(value.hobbies).to.be.an('array');
    expect(value.hobbies.length).to.equal(0);
  });

  // Test case of update many docuemts in the collection
  it('UpdateMany update many documents in the collection', async () => {
    // update the age of all documents with age 30 to 35
    const result = await mongoDB.updateMany('test', { age: 30 }, { $set: { age: 35 } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(15);
    const value = await mongoDB.getAll('test', { age: 35 });
    expect(value).to.be.an('array');
    expect(value.length).to.equal(15);
  });

  //Test case when delete one document from the collection
  it('DeleteOne delete one document from collection', async () => {
    // delete the document by the id of the added document in the first test case
    const result = await mongoDB.deleteOne('test', { _id: id });
    expect(result).to.be.an('object');
    expect(result.deletedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { _id: id });
    expect(value).to.equal(null);
  });

  //Test case when count documents from the collection
  it('Count count documents from collection', async () => {
    // count the documents with age 35
    const result = await mongoDB.countColl('test', { age: 35 });
    expect(result).to.be.a('number');
    expect(result).to.equal(15);
  });

  //Test case when delete many documents from the collection
  it('DeleteMany delete many documents from collection', async () => {
    // delete all documents with age 35
    const result = await mongoDB.deleteMany('test', { age: 35 });
    expect(result).to.be.an('object');
    expect(result.deletedCount).to.equal(15);
    // count the documents with age 35
    const value = await mongoDB.countColl('test', { age: 35 });
    expect(value).to.equal(0);
  });
});
