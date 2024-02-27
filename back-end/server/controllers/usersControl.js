import bcrypt from 'bcrypt';
import mongoDB from '../../databases/mongoDB.js';
import redisDB from '../../databases/redisDB.js';
import Global from '../utils/global.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// UsersControl class with a static method containing the logic to user routes
class UsersControl {
  /* register method to create a new user
    if the user already exists, return 409 status code
    if the user does not exist, hash the password and add the user to the database collection of respective role
  */
  static async register(req, res) {
    try {
      const data = req.body;
      // Check if the user already exists
      const existingUser = await mongoDB.getOne(data.role, { email: data.email });
      if (existingUser) {
        return res.status(409).json({ msg: 'User already exists' });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = { ...data, password: hashedPassword, courses: [] };
      delete user.confirmPassword;
      // Add the user to the database
      const newUser = await mongoDB.addOne(data.role, user);
      return res.status(201).json({ msg: `User created successfully`, userID: newUser.toString() });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* login method to authenticate a user
    if the user does not exist, return 401 status code
    if the user exists, but the password is invalid, return 401 status code
    if the user exists and the password is valid, return 200 status code
    and set token inn redis and cookie
  */
  static async login(req, res) {
    try {
      const { email, password, role } = req.body;
      // Check if the user exists or has same role
      const existingUser = await mongoDB.getOne(role, { email });
      if (!existingUser) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }
      // Check if the password is valid
      const validPassword = await bcrypt.compare(password, existingUser.password);
      if (!validPassword) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }
      // Create a token
      const token = jwt.sign({ id: existingUser._id.toString(), email, role }, process.env.SECRET_KEY, { expiresIn: '3d' });
      // Set the user data in redis without the password field and with the id as a string if array convert to string
      const redisData = Global.prepareDataToRedis(existingUser);
      // Set the token in redis with the user data
      await redisDB.setHashMulti(token, redisData, 259200);
      // Set the token in a cookie
      res.header('Authorization', token);
      return res.status(200).json({ msg: 'Login successful' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* logout method to remove a token from redis */
  static async logout(req, res) {
    try {
      const token = res.locals.token;
      await redisDB.del(token);
      res.status(200).json({ msg: 'Logout successful' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* getUser method to get a user from redis */
  static getUser(req, res) {
    const user = res.locals.user;
    return res.status(200).json({ msg: 'User found', data: user });
  }

  /* getUserDetails method to get a user from mongoDB with full details */
  static async getUserDetails(req, res) {
    try {
      const user = res.locals.user;
      const userDB = await mongoDB.getOne(user.role, { _id: new ObjectId(user.id) });
      return res.status(200).json({ msg: 'User found', data: userDB });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* updateUser method to update a user in mongoDB and redis */
  static async updateUser(req, res) {
    try {
      // Get the user email from redis by the token
      const token = res.locals.token;
      const user = res.locals.user;
      // Update the user in mongoDB
      const newData = req.body;
      await mongoDB.updateOne(
        user.role,
        { _id: new ObjectId(user.id) },
        { $set: newData });
      // Update the user in redis
      const redisData = Global.prepareDataToRedis(newData);
      await redisDB.setHashMulti(token, redisData);
      return res.status(200).json({ msg: 'User updated successfully' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* updatePassword method to update a user password in mongoDB 
    if the new password is the same as the old password, return 409 status code
    if the new password is different from the old password, update the password and return 200 status code
  */
  static async updatePassword(req, res) {
    // Get the user email from redis by the token
    try {
      const token = res.locals.token;
      const user = res.locals.user;
      const { password } = req.body;
      const currentData = await mongoDB.getOne(user.role, { _id: new ObjectId(user.id) });
      // Check if the new password is the same as the old password
      const samePassword = await bcrypt.compare(password, currentData.password);
      if (samePassword) {
        return res.status(409).json({ msg: 'New password is the same as the old password' });
      }
      // Hash the new password and update it in mongoDB
      const newPassword = await bcrypt.hash(password, 10);
      await mongoDB.updateOne(
        user.role,
        { _id: new ObjectId(user.id) },
        { $set: { password: newPassword } });
      return res.status(200).json({ msg: 'Password updated successfully' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* deleteUser method to delete a user from mongoDB and redis */
  static async deleteUser(req, res) {
    try {
      const token = res.locals.token;
      const user = res.locals.user;
      // Delete the user from mongoDB
      await mongoDB.deleteOne(user.role, { _id: new ObjectId(user.id) });
      // Delete the user from redis
      await redisDB.del(token);
      return res.status(200).json({ msg: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }
}

// Export the UsersControl class
export default UsersControl;
