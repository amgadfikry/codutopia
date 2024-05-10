import redisDB from '../../databases/redisDB.js';
import { expect } from 'chai';

// Test suite for the redisDB module and its methods by connecting to the database
describe('Unittest of RedisDB', () => {
  // after testing, flush the database
  after(async () => {
    await redisDB.redis.flushdb();
  });

  // Test case for the set method to add new key value pair without a time to live
  it('Set method to add new key value pair without a time to live', async () => {
    const result = await redisDB.set('codutopia', 'perfect');
    expect(result).to.equal('OK');
  });

  // Test case for the get method to get a value from the database
  it('Get method to get a value from the database', async () => {
    const result = await redisDB.get('codutopia');
    expect(result).to.equal('perfect');
  });

  // Test case for the set method to add new key value pair with a time to live
  it('Set method to add new key value pair with a time to live', async () => {
    // set the key value pair with a time to live of 10 seconds
    const result = await redisDB.set('test', 'test', 10);
    expect(result).to.equal('OK');
    // get the value of the key before the time to live expires
    const value = await redisDB.get('test');
    expect(value).to.equal('test');
    // wait for 11 seconds for the time to live to expire and then check the value of the key
    setTimeout(async () => {
      const value = await redisDB.get('test');
      expect(value).to.equal(null);
    }, 11000);
  });

  // Test case for the setHashMulti method to add new hash key value pair without a time to live
  it('SetHashMulti method to add new hash key value pair without a time to live', async () => {
    const result = await redisDB.setHashMulti('hash', { test: 'test', test2: 'test2' });
    expect(result).to.equal('OK');
  });

  // Test case for the getHashAll method to get all the hash key value pairs from the database
  it('GetHashAll method to get all the hash key value pairs from the database', async () => {
    const result = await redisDB.getHashAll('hash');
    expect(result).to.deep.equal({ test: 'test', test2: 'test2' });
  });

  // Test case for the setHashMulti method to add new hash key value pair with a time to live
  it('SetHashMulti method to add new hash key value pair with a time to live', async () => {
    // set the hash key value pair with a time to live of 10 seconds
    const result = await redisDB.setHashMulti('hash2', { test: 'test' }, 10);
    expect(result).to.equal('OK');
    // get the value of the hash key before the time to live expires
    const value = await redisDB.getHashAll('hash2');
    expect(value).to.deep.equal({ test: 'test' });
    // wait for 11 seconds for the time to live to expire and then check the value of the hash key
    setTimeout(async () => {
      const value = await redisDB.getHashAll('hash');
      expect(value).to.eql({});
    }, 11000);
  });

  // Test case for the setHashField method to update a hash key value pair
  it('SetHashMulti method to update a hash key value pair', async () => {
    // update the hash key value pair with a new value for the test2 field
    const result = await redisDB.setHashMulti('hash', { test2: 'test3' });
    expect(result).to.equal('OK');
    const value = await redisDB.getHashAll('hash');
    expect(value).to.deep.equal({ test: 'test', test2: 'test3' });
  });

  // Test case for exists method to check if a key exists in the database
  it('keyExists method to check if a key exists in the database', async () => {
    const result = await redisDB.keyExists('codutopia');
    expect(result).to.equal(1);
    const result2 = await redisDB.keyExists('codutopia2');
    expect(result2).to.equal(0);
  });

  // Test case for the del method to delete a key value pair from the database
  it('Del method to delete a key value pair from the database', async () => {
    // check if the key exists before deleting it
    const value = await redisDB.keyExists('codutopia');
    expect(value).to.equal(1);
    // delete the key value pair
    const result = await redisDB.del('codutopia');
    expect(result).to.equal(1);
    // check if the key exists after deleting it
    const value2 = await redisDB.keyExists('codutopia');
    expect(value2).to.equal(0);
  });

  // Test case for the exists method to check if a field exists in the hash key value pairs
  it('FieldExists method to check if a field exists in the hash key value pairs', async () => {
    const result = await redisDB.fieldExists('hash', 'test');
    expect(result).to.equal(1);
    const result2 = await redisDB.fieldExists('hash', 'test2');
    expect(result2).to.equal(1);
    const result3 = await redisDB.fieldExists('hash', 'test3');
    expect(result3).to.equal(0);
  });

  // Test case for the delHashField method to delete a field from the hash key value pairs
  it('DelHashField method to delete a field from the hash key value pairs', async () => {
    // check if the field exists before deleting it
    const value = await redisDB.fieldExists('hash', 'test');
    expect(value).to.equal(1);
    // delete the field
    const result = await redisDB.delHashField('hash', 'test');
    expect(result).to.equal(1);
    // check if the field exists after deleting it
    const value2 = await redisDB.fieldExists('hash', 'test');
    expect(value2).to.equal(0);
    // check other field still exists
    const value3 = await redisDB.getHashAll('hash');
    expect(value3).to.deep.equal({ test2: 'test3' });
  });
});
