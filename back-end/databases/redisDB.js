import ioredis from 'ioredis';

// RedisBD class represents the Redis database connection and the methods to interact with it
class RedisBD {
  /* constructor to connect to the database
    get the url from the environment variables provided by the .env file pass to server container
    connect to the database and set the redis property to the database name
  */
  constructor() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new ioredis(url);
  }

  /* methods to add one key-value pair to the database
    Parameters:
    - key - the key
    - value - the value
    Returns:
    - the result of the operation
  */
  async set(key, value, time) {
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

  /* methods to add hash key-value pairs to the database
    Parameters:
    - key - the key
    - filedValues - the object with the key-value pairs
    - time - the time to live
    Returns:
    - the result of the operation
  */
  async setHashMulti(key, filedValues, time = 0) {
    try {
      const result = await this.redis.hmset(key, filedValues);
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
}

// create an instance of the RedisBD class and export it
const redisDB = new RedisBD();
export default redisDB;
