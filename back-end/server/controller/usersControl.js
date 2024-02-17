import Users from "../utils/users.js";
import mongoDB from "../../databases/mongoDB.js";
import redisDB from '../../databases/redisDB.js'

class UsersController {
  static async register(req, res) {
    const { userName, fullName, email, password, phoneNumber } = req.body;
    const userExists = await mongoDB.getOne('users', { email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const hashedPassword = await Users.hashPassword(password);
    const user = {
      userName,
      fullName,
      email,
      password: hashedPassword,
      phoneNumber
    };
    try {
      const result = await mongoDB.addOne('users', user);
      res.status(201).json({ msg: 'User created', userID: result });
    } catch (e) {
      res.status(500).json({ msg: 'Unable to register right now' });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const user = await mongoDB.getOne('users', { email });
    if (!user) {
      return res.status(400).json({ msg: 'Email does not exist' });
    }
    const passwordMatch = await Users.checkPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ msg: 'Password is incorrect' });
    }
    res.status(200).json({ msg: 'Login successful', data: user });
  }

  static async logout(req, res) {
    // code to logout a user
  }

  static async update(req, res) {
    // code to update a user
  }
}

export default UsersController;
