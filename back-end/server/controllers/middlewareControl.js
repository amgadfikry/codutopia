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
}

// Export the MiddlewareControl class
export default MiddlewareControl;
