// import userSchema from schemas/userSchema
import UserSchema from '../schemas/userSchema.js';
import bcrypt from 'bcrypt';
import { error } from 'console';
import crypto from 'crypto';

// UserModel class with methods used to interact with the users collection in the database
class UserModel extends UserSchema {
  constructor() {
    // call the parent class constructor which initializes the user schema and model
    super();
  }

  /* createUser method creates a new user in users collection in the database
    Parameters:
      - user: object with user data
    Returns:
      - result: user id of the created user
      - error: error message if the user already exists, missing required fields or invalid fields in the data object
  */
  async createUser(user) {
    // get list of fields that not in schema if there is any
    const invalidFields = Object.keys(user).filter(key => !Object.keys(this.user.schema.obj).includes(key));
    // throw an error if there are invalid fields
    if (invalidFields.length > 0) {
      throw new Error(`Fields not in schema: ${invalidFields.join(', ')}`);
    }

    try {
      // encrypt the password before creating the user
      const hashedPassword = await bcrypt.hash(user.password, 10);
      // create a new user object with the hashed password
      const newUser = { ...user, password: hashedPassword };
      // create the user and return the result
      const result = await this.user.create(newUser);
      //return the id of the created user
      return result._id;
    } catch (error) {
      // check if the error is a duplicate key error
      if (error.code === 11000) {
        // throw an error if the user already exists
        throw new Error('User already exists');
      } else {
        // throw an error if a required field is missing
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      }
    }
  }

  /* getUserById method gets all users from users collection in the database
    Parameters:
      - id: string or ObjectId of the user
    Returns:
      - result: object with user data that was found
      - error: error message if the user was not found
  */
  async getUserById(id) {
    try {
      // find the user by id
      const user = await this.user.findById(id);
      // remove the password, resetPasswordToken, and resetPasswordExpires fields from the user data
      user.password = undefined;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      // return the user data
      return user;
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* getUserByField method gets user by field other than id from users collection in the database
    Parameters:
      - seachObject: object with field and value to search for
    Returns:
      - result: object with user data that was found
      - error: error message if the user was not found
  */
  async getUserByField(seachObject) {
    try {
      // find the user by field other than id
      const user = await this.user.findOne(seachObject);
      // remove the password, resetPasswordToken, and resetPasswordExpires fields from the user data
      user.password = undefined;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      // return the user data
      return user;
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* countUsers method counts the number of users with a specific role in the users collection
    Parameters:
      - role: string value of the role to search for
    Returns:
      - result: number of users in the collection
      - error: error message if the role is invalid
  */
  async countRoleUsers(role) {
    // check if the role is valid in the list of roles ['learner', 'instructor']
    if (!['learner', 'instructor'].includes(role)) {
      // throw an error if the role is invalid
      throw new Error('Invalid role');
    }

    try {
      // count the number of users with the specific role
      const result = await this.user.countDocuments({ roles: role });
      // return number of users
      return result;
    } catch (error) {
      // throw an error if the count failed
      throw new Error('Invalid role');
    }
  }

  /* updateUserById method updates a user by id with new data in the users collection
    if update includes password, resetPasswordToken and resetPasswordExpires are set to null
    Parameters:
      - id: string or ObjectId of the user
      - user: object with new user data
    Returns:
      - result: object with user data that was updated
      - error: error message if the user was not found, or invalid fields in the data object
  */
  async updateUserById(id, user) {
    // get list of fields that not in schema if there is any
    const invalidFields = Object.keys(user).filter(key => !Object.keys(this.user.schema.obj).includes(key));
    // throw an error if there are invalid fields
    if (invalidFields.length > 0) {
      throw new Error(`Fields not in schema: ${invalidFields.join(', ')}`);
    }

    try {
      // update the user by id with the new user data and return the updated user
      const result = await this.user.findByIdAndUpdate(
        id,
        user,
        { new: true }
      );
      // remove the password, resetPasswordToken, and resetPasswordExpires fields from the user data
      result.password = undefined;
      result.resetPasswordToken = null;
      result.resetPasswordExpires = null;
      // return the updated user data
      return result;
    } catch (error) {
      // throw an error if the user was not updated
      throw new Error('User not found');
    }
  }

  /* confimUser method updates the confirmed field to true for a user by id in the users collection
    Parameters:
      - id: string or ObjectId of the user
    Returns:
      - result: value of the confirmed field
      - error: error message if the user was not found
  */
  async confimUser(id) {
    try {
      // update the user by id with the confirmed field set to true
      const result = await this.user.findByIdAndUpdate(
        id,
        { confirmed: true },
        { new: true }
      );
      // return the confirmed field value
      return result.confirmed;
    } catch (error) {
      // throw an error if the user was not updated or not found
      throw new Error('User not found');
    }
  }

  /* addNewRole method adds a new role to a user by id in the users collection
    Parameters:
      - id: string or ObjectId of the user
      - role: string value of the new role either 'learner' or 'instructor'
    Returns:
      - result: array of roles of the user
      - error: error message if the user was not updated or invalid role
  */
  async addNewRole(id, role) {
    // check if the role is valid
    if (!['learner', 'instructor'].includes(role)) {
      // throw an error if the role is invalid
      throw new Error('Invalid role');
    }

    try {
      // update the user by id with the new role
      const result = await this.user.findByIdAndUpdate(
        id,
        { $addToSet: { roles: role } },
        { new: true }
      );
      // return current roles of the user
      return result.roles;
    } catch (error) {
      // throw an error if the user was not updated or not found
      throw new Error('User not found');
    }
  }

  /* checkUserPassword method checks if the user password is correct
    Parameters:
      - email: string value of the user email
      - password: string value of the user password
    Returns:
      - result: user id if the password is correct
      - error: error message if the user was not found or password is incorrect
  */
  async checkUserPassword(email, password) {
    try {
      // find the user by email
      const user = await this.user.findOne({ email });
      // if the user was not found
      if (!user) {
        // throw an error if the user was not found
        throw new Error('User not found');
      }
      // compare the password with the hashed password
      const result = await bcrypt.compare(password, user.password);
      // check if the password is not correct
      if (!result) {
        // throw an error if the password is incorrect
        throw new Error('Password is incorrect');
      }
      // return id of the user
      return user._id;
    } catch (error) {
      // throw an error if the user was not found or password is incorrect
      throw new Error(error.message);
    }
  }

  /* resetPassword method resets the user password with create a new token and expiration time
    Parameters:
      - email: string value of the user email
    Returns:
      - result: string value of the reset password token
      - error: error message if the user was not found
  */
  async resetPasswordToken(email) {
    try {
      // generate a random token 
      const token = crypto.randomBytes(20).toString('hex');
      // set the token expiration time 15 minutes
      const time = Date.now() + 900000;
      // update the user by email with the new token and expiration time
      const result = await this.user.findOneAndUpdate(
        { email },
        { resetPasswordToken: token, resetPasswordExpires: time },
        { new: true }
      );
      // return the reset password token
      return result.resetPasswordToken;
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* verifyByToken method verifies the reset password token and expiration time
    Parameters:
      - token: string value of the reset password token
    Returns:
      - result: string value of the user id if the token is valid
      - error: error message if the token is invalid or expired
  */
  async verifyByToken(token) {
    try {
      // find the user by the reset password token and expiration time is greater than the current time
      const user = await this.user.findOne(
        { resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }
      );
      // return true if the token is valid
      return user._id;
    } catch (error) {
      // throw an error if the token is invalid or expired
      throw new Error('Token is invalid or expired');
    }
  }

  /* updatePassword method updates the user password with a new password
    Parameters:
      - id: string or ObjectId of the user
      - password: string value of the new password
    Returns:
      - result: string value 'Password updated' if the password was updated
      - error: error message if the user was not found
  */
  async updatePassword(id, password) {
    try {
      // encrypt the new password before updating the user
      const hashedPassword = await bcrypt.hash(password, 10);
      // update the user by id with the new password
      const result = await this.user.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );
      // return 'Password updated' if the password was updated
      return 'Password updated';
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* addCourseToEnrolledList method adds a course to the enrolled list of a user by id
    Parameters:
      - id: string or ObjectId of the user
      - courseId: string or ObjectId of the course
      - paymentId: string or ObjectId of the payment
    Returns:
      - result: object with course subdocument that was added to the enrolled list
      - error: error message if the user was not found or invalid payment
  */
  async addCourseToEnrolledList(id, courseId, paymentId) {
    try {
      // define the course object with the course id and payment id
      const course = {
        courseId: courseId.toString(),
        paymentId: paymentId.toString(),
      };
      // create a new course subdocument with the course object
      const result = await this.user.findByIdAndUpdate(
        id,
        { $addToSet: { enrolled: course } },
        { new: true }
      );
      // return the course subdocument that was added to the enrolled list
      return result.enrolled[result.enrolled.length - 1];
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* updateCourseProgress method updates the progress of a course in the enrolled list of a user by id
    Parameters:
      - id: string or ObjectId of the user
      - courseId: string or ObjectId of the course
      - progress: number value to add to the current progress of the course
    Returns:
      - result: number value of the progress of the course
      - error: error message if the user was not found
  */
  async updateCourseProgress(id, courseId, progress) {
    try {
      // update the user by id with the added progress to current progress of the course
      const result = await this.user.findOneAndUpdate(
        { _id: id },
        { $inc: { 'enrolled.$[course].progress': progress } }, // increment the progress of the course
        {
          new: true,
          arrayFilters: [{ 'course.courseId': courseId.toString() }] // filter the course by courseId
        }
      );
      // find the course in the enrolled list of the user by courseId and get the current progress
      const currentProgress = result.enrolled.find(course => course.courseId === courseId.toString()).progress;
      // return the prgress of the course after the update
      return currentProgress;
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* addCourseToWishlist method adds a course to the wishlist of a user by id
    Parameters:
      - id: string or ObjectId of the user
      - courseId: string or ObjectId of the course
    Returns:
      - result: string value 'Course added to wishlist' if the course was added to the wishlist
      - error: error message if the user was not found
  */
  async addCourseToWishlist(id, courseId) {
    try {
      // add the course to the user's wishlist by id
      const result = await this.user.findByIdAndUpdate(
        id,
        { $addToSet: { wishlist: courseId.toString() } }, // add the courseId to the wishlist array if it is not already there
      );
      // return success message if the course was added to the wishlist
      return 'Course added to wishlist';
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* removeCourseFromList method removes a course from wishlist
    Parameters:
      - id: string or ObjectId of the user
      - courseId: string or ObjectId of the course
    Returns:
      - result: string value 'Course removed from list' if the course was removed from the list
      - error: error message if the user was not found
  */
  async removeCourseFromWishlist(id, courseId) {
    try {
      // remove the course from the user's list by id
      const result = await this.user.findByIdAndUpdate(
        id,
        { $pull: { wishlist: courseId.toString() } }, // remove the courseId from the wishlist array
      );
      // return success message if the course was removed from the list
      return 'Course removed from list';
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* deleteUserById method deletes a user by id from the users collection
    Parameters:
      - id: string or ObjectId of the user
    Returns:
      - result: string value 'User deleted successfully' if the user was deleted
      - error: error message if the user was not found
  */
  async deleteUserById(id) {
    try {
      // delete the user by id
      const result = await this.user.findByIdAndDelete(id);
      // return success message if the user was deleted
      if (result) {
        return 'User deleted successfully';
      }
      // throw an error if the user was not found
      throw error;
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }
}

export default UserModel;
