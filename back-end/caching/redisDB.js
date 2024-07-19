import ioredis from 'ioredis';

// RedisBD class represents the Redis database connection and the methods to interact with it
class RedisBD {
  /* constructor to connect to the database
    get the url from the environment variables provided by the .env file pass to server container
    connect to the database and set the redis property to the database number
  */
  constructor() {
    let url = process.env.REDIS_URL || 'redis://localhost:6379';
    const envVar = process.env.NODE_ENV;
    // database number 0 is the default database for production
    let db = 0;
    if (envVar === 'test') {
      // database number 1 is the test database
      db = 1;
    } else if (envVar === 'dev') {
      // database number 2 is the development database
      db = 2;
    }
    this.redis = new ioredis(url, { db });
  }

  /* methods to add one key-value pair to the database with an optional time to live
    Parameters:
    - key - the key
    - value - the value
    - time - the time to live with the default value 0
    Returns:
    - the result of the operation
  */
  async set(key, value, time = 0) {
    try {
      const result = await this.redis.set(key, value);
      if (time) {
        await this.redis.expire(key, time);
      }
      return result;
    } catch (e) {
      return e;
    }
  }

  /* methods to add hash key-value pairs to the database with an optional time to live
    Parameters:
    - key - the key
    - keyValuePairs - the object with the key-value pairs
    - time - the time to live with the default value 0
    Returns:
    - the result of the operation
  */
  async setHashMulti(key, keyValuePairs, time = 0) {
    try {
      const result = await this.redis.hmset(key, keyValuePairs);
      if (time) {
        await this.redis.expire(key, time);
      }
      return result;
    }
    catch (e) {
      return e;
    }
  }

  /* methods to get one value from the database
    Parameters:
    - key - the key
    Returns:
    - the value found
  */
  async get(key) {
    try {
      return await this.redis.get(key);
    } catch (e) {
      return e;
    }
  }

  /* methods to get all the hash key-value pairs from the database
    Parameters:
    - key - the key
    Returns:
    - the object with the key-value pairs
  */
  async getHashAll(key) {
    try {
      return await this.redis.hgetall(key);
    } catch (e) {
      return e;
    }
  }

  /* methods to delete one key-value pair from the database
    Parameters:
    - key - the key
    Returns:
    - the result of the operation
  */
  async del(key) {
    try {
      return await this.redis.del(key);
    } catch (e) {
      return e;
    }
  }

  /* Method delete one field from the hash key-value pairs from the database
    Parameters:
    - key - the key
    - field - the field
    Returns:
    - the result of the operation
  */
  async delHashField(key, field) {
    try {
      return await this.redis.hdel(key, field);
    } catch (e) {
      return e;
    }
  }

  /* Method to check if a key exists in the database
    Parameters:
    - key - the key
    Returns:
    - true if the key exists, false otherwise
  */
  async keyExists(key) {
    try {
      return await this.redis.exists(key);
    } catch (e) {
      return e;
    }
  }

  /* Method to check if a field exists in the hash key-value pairs in the database
    Parameters:
    - key - the key
    - field - the field
    Returns:
    - true if the field exists, false otherwise
  */
  async fieldExists(key, field) {
    try {
      return await this.redis.hexists(key, field);
    } catch (e) {
      return e;
    }
  }
}

// create an instance of the RedisBD class and export it
const redisDB = new RedisBD();
export default redisDB;
