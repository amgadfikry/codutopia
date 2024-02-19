import bcrypt from 'bcrypt';
import mongoDB from '../../databases/mongoDB.js';
import redisDB from '../../databases/redisDB.js';
import jwt from 'jsonwebtoken';

// UsersControl class with a static method containing the logic to user routes
class UsersControl {
  /* register method to create a new user
    if the user already exists, and role is same, return 409 status code
    if the user already exists, and role is different, update the role and return 201 status code
    if the user does not exist, create a new user and return 201 status code
  */
  static async register(req, res) {
    try {
      const { userName, email, password, fullName, role, phoneNumber } = req.body;
      // Check if the user already exists
      const existingUser = await mongoDB.getOne('users', { email });
      if (existingUser) {
        // Check if the user already has the role
        if (existingUser.role.includes(role)) {
          return res.status(409).json({ msg: 'User already exists' });
        }
        // Add the role to the user
        existingUser.role.push(role);
        const id = existingUser._id;
        // Update the user in the database
        await mongoDB.updateOne('users', { id }, { role: existingUser.role });
        return res.status(201).json({ msg: 'User created successfully', userID: id.toString() });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        userName,
        email,
        password: hashedPassword,
        fullName,
        role: [role],
        phoneNumber,
      };
      // Add the user to the database
      const newUser = await mongoDB.addOne('users', user);
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
      const existingUser = await mongoDB.getOne('users', { email });
      if (!existingUser || !existingUser.role.includes(role)) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }
      // Check if the password is valid
      const validPassword = await bcrypt.compare(password, existingUser.password);
      if (!validPassword) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }
      // Create a token
      const token = jwt.sign({ id: existingUser._id.toString(), role }, process.env.SECRET_KEY, { expiresIn: '3d' });
      const redisData = {
        email,
        fullName: existingUser.fullName,
        userName: existingUser.userName,
        id: existingUser._id.toString(),
      }
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
      const token = req.headers.authorization;
      await redisDB.del(token);
      res.status(200).json({ msg: 'Logout successful' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* getUser method to get a user from redis */
  static async getUser(req, res) {
    try {
      const token = req.headers.authorization;
      const user = await redisDB.getHashAll(token);
      return res.status(200).json({ msg: 'User found', data: user });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* getUserDetails method to get a user from mongoDB with full details */
  static async getUserDetails(req, res) {
    try {
      const token = req.headers.authorization;
      const { email } = await redisDB.getHashAll(token);
      const user = await mongoDB.getOne('users', { email });
      return res.status(200).json({ msg: 'User found', data: user });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* updateUser method to update a user in mongoDB and redis */
  static async updateUser(req, res) {
    try {
      // Get the user email from redis by the token
      const token = req.headers.authorization;
      const { email } = await redisDB.getHashAll(token);
      // Update the user in mongoDB
      const newData = req.body;
      await mongoDB.updateOne('users', { email }, newData);
      // Update fullName in redis if it exists in the request body
      if (newData.fullName) {
        await redisDB.setHashMulti(token, { fullName: newData.fullName });
      }
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
      const token = req.headers.authorization;
      const { email } = await redisDB.getHashAll(token);
      const { password } = req.body;
      const currentData = await mongoDB.getOne('users', { email });
      // Check if the new password is the same as the old password
      const samePassword = await bcrypt.compare(password, currentData.password);
      if (samePassword) {
        return res.status(409).json({ msg: 'New password is the same as the old password' });
      }
      // Hash the new password and update it in mongoDB
      const newPassword = await bcrypt.hash(password, 10);
      await mongoDB.updateOne('users', { email }, newPassword);
      return res.status(200).json({ msg: 'Password updated successfully' });
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Middleware to check if the user is authenticated
    if the token does not exist, return 401 status code
    if the user does not exist, return 401 status code
    if the user exists, call the next middleware
  */
  static async middleware(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      const user = await redisDB.getHashAll(token);
      if (!user) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }
}

// Export the UsersControl class
export default UsersControl;
