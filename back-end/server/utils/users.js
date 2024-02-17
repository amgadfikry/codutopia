import bcrypt from 'bcrypt';

// Users class with static methods to manage all functions related to users
class Users {
  // Method to hash password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
  // Method to check password
  static async checkPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

// Export Users class
export default Users;