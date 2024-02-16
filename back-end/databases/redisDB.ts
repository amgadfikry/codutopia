import ioredis from 'ioredis';

// RedisBD class represents the Redis database connection and the methods to interact with it
class RedisBD {
  redis: any;

  /* constructor to connect to the database
    get the url from the environment variables provided by the .env file pass to server container
    connect to the database and set the redis property to the database name
  */
  constructor() {
    const url: string = process.env.REDIS_URL as string;
    this.redis = new ioredis(url);
  }

  /* methods to add one key-value pair to the database
    Parameters:
    - key: string - the key
    - value: string - the value
    Returns:
    - the result of the operation
  */
  async set(key: string, value: string) {
    try {
      const result = await this.redis.set(key, value);
      console.log('Successfully added');
      return result;
    } catch (e) {
      console.log('Error adding');
    }
  }

  /* methods to get one value from the database
    Parameters:
    - key: string - the key
    Returns:
    - the value found
  */
  async get(key: string) {
    try {
      const result = await this.redis.get(key);
      console.log('Successfully getting data');
      return result;
    } catch (e) {
      console.log('Error getting data');
    }
  }

  /* methods to delete one key-value pair from the database
    Parameters:
    - key: string - the key
    Returns:
    - the result of the operation
  */
  async del(key: string) {
    try {
      const result = await this.redis.del(key);
      console.log('Successfully deleting data');
      return result;
    } catch (e) {
      console.log('Error deleting data');
    }
  }
}

// create an instance of the RedisBD class and export it
const redisDB = new RedisBD();
export default redisDB;
