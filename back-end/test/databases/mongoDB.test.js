import mongoDB from '../../databases/mongoDB.js';
import { expect } from 'chai';

// Test suite for the mongoDB module and its methods by connecting to the database
describe('Unittest of MongoDB', () => {
  //after all tests are finished remove the test collection
  after(async () => {
    await mongoDB.db.collection('test').drop();
  });

  //Test case when add new document to the collection
  it('AddOne add new document to collection', async () => {
    const result = await mongoDB.addOne('test', { name: 'test', age: 20 });
    expect(result).to.be.an('object');
  });

  //Test case when add many documents to the collection 
  it('AddMany add many documents to collection', async () => {
    const manyDocuments = [{ name1: 'test1', age: 20 }, { name2: 'test2', age: 20 },
    { name3: 'test3', age: 20 }, { name4: 'test4', age: 20 }, { name5: 'test5', age: 20 },
    { name6: 'test6', age: 20 }, { name7: 'test7', age: 20 }, { name8: 'test8', age: 20 },
    { name9: 'test9', age: 20 }, { name10: 'test10', age: 20 }, { name11: 'test11', age: 20 },
    { name12: 'test12', age: 20 }, { name13: 'test13', age: 20 }, { name14: 'test14', age: 20 },
    { name15: 'test15', age: 20 }]
    const result = await mongoDB.addMany('test', manyDocuments);
    expect(result).to.be.an('object');
    expect(result.insertedCount).to.equal(15);
  });

  //Test case when get one document from the collection
  it('GetOne get one document from collection successfully', async () => {
    const result = await mongoDB.getOne('test', { name5: 'test5' });
    expect(result).to.be.an('object');
    expect(result.name5).to.equal('test5');
    expect(result._id).to.be.an('object');
  });

  //Test case when get all documents from the collection
  it('GetAll when get all documents from collection ', async () => {
    const result = await mongoDB.getAll('test', { age: 20 });
    expect(result).to.be.an('array');
    expect(result.length).to.equal(16);
  });

  //Test case when get a specific number of documents per page from the collection
  it('Pagination get a specific number of documents per page from collection', async () => {
    const result = await mongoDB.pagination('test', { age: 20 }, 1, 10);
    expect(result).to.be.an('array');
    expect(result.length).to.equal(10);
    const result2 = await mongoDB.pagination('test', { age: 20 }, 2, 10);
    expect(result2).to.be.an('array');
    expect(result2.length).to.equal(6);
  });

  // Test case when get many documents from the collection in the list
  it('GetFromList documents get many documents from the collection in the list', async () => {
    const result = await mongoDB.getFromList('test', 'name5', ['test5']);
    expect(result).to.be.an('array');
    expect(result.length).to.equal(1);
    expect(result[0].name5).to.equal('test5');
  });

  // Test case when update one document in the collection using $set
  it('UpdateOne update one document in the collection using $set', async () => {
    const result = await mongoDB.updateOne('test', { name5: 'test5' }, { $set: { age: 25 } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { name5: 'test5' });
    expect(value.age).to.equal(25);
  });

  // Test case when update one document in the collection using $inc
  it('UpdateOne update one document in the collection using $inc', async () => {
    const result = await mongoDB.updateOne('test', { name5: 'test5' }, { $inc: { age: 1 } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { name5: 'test5' });
    expect(value.age).to.equal(26);
  });

  //Test case when update one document in the collection using $push
  it('UpdateOne update one document in the collection using $push', async () => {
    await mongoDB.updateOne('test', { name5: 'test5' }, { $set: { hobbies: [] } });
    const result = await mongoDB.updateOne('test', { name5: 'test5' }, { $push: { hobbies: 'football' } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { name5: 'test5' });
    expect(value.hobbies).to.be.an('array');
    expect(value.hobbies.length).to.equal(1);
    expect(value.hobbies[0]).to.equal('football');
  });

  //Test case when update one document in the collection using $pull
  it('UpdateOne update one document in the collection using $pull', async () => {
    const result = await mongoDB.updateOne('test', { name5: 'test5' }, { $pull: { hobbies: 'football' } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { name5: 'test5' });
    expect(value.hobbies).to.be.an('array');
    expect(value.hobbies.length).to.equal(0);
  });

  // Test case of update many docuemts in the collection
  it('UpdateMany update many documents in the collection', async () => {
    const result = await mongoDB.updateMany('test', { age: 20 }, { $set: { age: 30 } });
    expect(result).to.be.an('object');
    expect(result.modifiedCount).to.equal(15);
    const value = await mongoDB.getAll('test', { age: 30 });
    expect(value).to.be.an('array');
    expect(value.length).to.equal(15);
  });

  //Test case when delete one document from the collection
  it('DeleteOne delete one document from collection', async () => {
    const result = await mongoDB.deleteOne('test', { name5: 'test5' });
    expect(result).to.be.an('object');
    expect(result.deletedCount).to.equal(1);
    const value = await mongoDB.getOne('test', { name5: 'test5' });
    expect(value).to.equal(null);
  });

  //Test case when count documents from the collection
  it('Count count documents from collection', async () => {
    const result = await mongoDB.countColl('test', { age: 30 });
    expect(result).to.be.a('number');
    expect(result).to.equal(15);
  });

  //Test case when delete many documents from the collection
  it('DeleteMany delete many documents from collection', async () => {
    const result = await mongoDB.deleteMany('test', { age: 30 });
    expect(result).to.be.an('object');
    expect(result.deletedCount).to.equal(15);
    const value = await mongoDB.countColl('test', { age: 30 });
    expect(value).to.equal(0);
  });
});
