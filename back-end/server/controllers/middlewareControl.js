import redisDB from "../../databases/redisDB.js";
import mongoDB from "../../databases/mongoDB.js";
import jwt from "jsonwebtoken";

// MiddlewareControl class with a static method containing the logic all middleware methods
class MiddlewareControl {
  /* Middleware to check if the user is authenticated
    if the token does not exist, return 401 status code
    if the user does not exist in redis, return 401 status code
    if the token is invalid, return 401 status code
    if token valid but user does not exist in mongoDB, return 401 status code
    if token valid and user exists in mongoDB, set the user in redis
    finally, call the next middleware
  */
  static async authMiddleware(req, res, next) {
    try {
      // Check if the token exists in the header
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      // Check if the user exists in redis
      const user = await redisDB.getHashAll(token);
      if (!user) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      // Check if the token is valid and get the user from the token
      const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
      if (!verifyToken) {
        return res.status(401).json({ msg: 'Unauthorized' });
      } else {
        // Check if the user exists in mongoDB
        const gettingUser = await mongoDB.getOne('users', { email: verifyToken.email });
        if (!gettingUser) {
          return res.status(401).json({ msg: 'Unauthorized' });
        }
        // Set the user in redis
        const data = {
          email: verifyToken.email,
          fullName: gettingUser.fullName,
          userName: gettingUser.userName,
          id: verifyToken.id,
        }
        await redisDB.setHashMulti(token, data, 259200);
      }
      // Call the next middleware
      next();
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Middleware to check if the user role is user
    if the user role is not user, return 401 status code
    finally, call the next middleware
  */
  static async userRoleMiddleware(req, res, next) {
    try {
      // Get the user from redis
      const token = req.headers.authorization;
      const user = await redisDB.getHashAll(token);
      // Check if the user role is user
      const roles = JSON.parse(user.role);
      if (!roles.includes('User')) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Middleware to check if the user role is Instructor
    if the user role is not Instructor, return 401 status code
    finally, call the next middleware
  */
  static async instructorRoleMiddleware(req, res, next) {
    try {
      // Get the user from redis
      const token = req.headers.authorization;
      const user = await redisDB.getHashAll(token);
      // Check if the user role is Instructor
      const roles = JSON.parse(user.role);
      if (!roles.includes('Instructor')) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Middleware to check if the user role is User or Instructor
    if the user role is not User or Instructor, return 401 status code
    finally, call the next middleware
  */
  static async userORInstructorMiddleware(req, res, next) {
    try {
      // Get the user from redis
      const token = req.headers.authorization;
      const user = await redisDB.getHashAll(token);
      // Check if the user role is User or Instructor
      const roles = JSON.parse(user.role);
      if (!roles.includes('User') && !roles.includes('Instructor')) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Middleware to check if the user role is Admin
    if the user role is not Admin, return 401 status code
    finally, call the next middleware
  */
  static async adminRoleMiddleware(req, res, next) {
    try {
      // Get the user from redis
      const token = req.headers.authorization;
      const user = await redisDB.getHashAll(token);
      // Check if the user role is Admin
      const roles = JSON.parse(user.role);
      if (!roles.includes('Admin')) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }
}

// Export the MiddlewareControl class
export default MiddlewareControl;
