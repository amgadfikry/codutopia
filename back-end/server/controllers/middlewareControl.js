import redisDB from "../../databases/redisDB.js";
import mongoDB from "../../databases/mongoDB.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

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
      if (token) {
        // Get the user from redis
        const user = await redisDB.getHashAll(token);
        if (user) {
          // Set the user in res.locals and call the next middleware
          res.locals.user = user;
          res.locals.token = token;
          return next();
        }
        // Verify the token
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        if (verifyToken) {
          // Get the user from mongoDB and set the user in redis
          const gettingUser = await mongoDB.getOne(verifyToken.role, { _id: new ObjectId(verifyToken.id) });
          if (gettingUser) {
            const data = {
              email: gettingUser.email,
              fullName: gettingUser.fullName,
              userName: gettingUser.userName,
              id: verifyToken.id,
              role: gettingUser.role,
            }
            await redisDB.setHashMulti(token, data, 259200);
            // Set the user in res.locals and call the next middleware
            res.locals.user = data;
            res.locals.token = token;
            return next();
          }
        }
      }
      // 
      return res.status(401).json({ msg: 'Unauthorized' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Middleware to check if user role is the same as the role passed
    if the user role is not the same as the role passed, return 401 status code
    if the user role is the same as the role passed, call the next middleware
  */
  static roleMiddleware(role) {
    return (req, res, next) => {
      // Get the user from res.locals
      const user = res.locals.user;
      // Check if the user role is user
      if (!role.some(r => r === user.role)) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      return next();
    }
  }
}
// Export the MiddlewareControl class
export default MiddlewareControl;
