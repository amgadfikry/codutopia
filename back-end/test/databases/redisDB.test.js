import redisDB from '../../databases/redisDB.js';
import { expect } from 'chai';

// Test suite for the redisDB module and its methods by connecting to the database
describe('Unittest of RedisDB', () => {
  // after testing, flush the database
  after(async () => {
    await redisDB.redis.flushdb();
  });

  // Test case for the set method to add new key value pair with a time to live
  it('Set method to add new key value pair with a time to live', async () => {
    const result = await redisDB.set('test', 'test', 10);
    expect(result).to.equal('OK');
    setTimeout(async () => {
      const value = await redisDB.get('test');
      expect(value).to.equal(null);
    }, 11000);
  });

  // Test case for the set method to add new key value pair without a time to live
  it('Set method to add new key value pair without a time to live', async () => {
    const result = await redisDB.set('test', 'test');
    expect(result).to.equal('OK');
    setTimeout(async () => {
      const value = await redisDB.get('test');
      expect(value).to.equal('test');
    }, 1000);
  });

  // Test case for the setHashMulti method to add new hash key value pair with a time to live
  it('SetHashMulti method to add new hash key value pair with a time to live', async () => {
    const result = await redisDB.setHashMulti('hash', { test: 'test' }, 10);
    expect(result).to.equal('OK');
    setTimeout(async () => {
      const value = await redisDB.getHashAll('hash');
      expect(value).to.eql({});
    }, 11000);
  });

  // Test case for the setHashMulti method to add new hash key value pair without a time to live
  it('SetHashMulti method to add new hash key value pair without a time to live', async () => {
    const result = await redisDB.setHashMulti('hash', { test: 'test', test2: 'test2' });
    expect(result).to.equal('OK');
    setTimeout(async () => {
      const value = await redisDB.getHashAll('hash');
      expect(value).to.deep.equal({ test: 'test', test2: 'test2' });
    }, 1000);
  });

  // Test case for the setHashField method to update a hash key value pair
  it('SetHashMulti method to update a hash key value pair', async () => {
    const result = await redisDB.setHashMulti('hash', { test2: 'test3' });
    expect(result).to.equal('OK');
    const value = await redisDB.getHashAll('hash');
    expect(value).to.deep.equal({ test: 'test', test2: 'test3' });
  });

  // Test case for the get method to get a value from the database
  it('Get method to get a value from the database', async () => {
    const result = await redisDB.get('test');
    expect(result).to.equal('test');
  });

  // Test case for the getHashAll method to get all the hash key value pairs from the database
  it('GetHashAll method to get all the hash key value pairs from the database', async () => {
    const result = await redisDB.getHashAll('hash');
    expect(result).to.deep.equal({ test: 'test', test2: 'test3' });
  });

  // Test case for the del method to delete a key value pair from the database
  it('Del method to delete a key value pair from the database', async () => {
    const result = await redisDB.del('test');
    expect(result).to.equal(1);
    const value = await redisDB.get('test');
    expect(value).to.equal(null);
  });

  // Test case for the delHash method to delete a hash key value pair from the database
  it('DelHash method to delete a hash key value pair from the database', async () => {
    const result = await redisDB.delHashField('hash', 'test');
    expect(result).to.equal(1);
    const value = await redisDB.getHashAll('hash');
    expect(value).to.deep.equal({ test2: 'test3' });
  });
});