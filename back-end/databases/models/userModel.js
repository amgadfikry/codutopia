// import userSchema from schemas/userSchema
import UserSchema from '../schemas/userSchema.js';
import bcrypt from 'bcrypt';

// UserModel class to interact with the users collection in the database
class UserModel extends UserSchema {

  constructor() {
    super();
  }

  /* createUser method creates a new user in users collection in the database
    Parameters:
      - user: object with user data
      - session: optional session for the transaction
    Returns:
      - filtered created object data
    Errors:
      - Lesson could not be created
      - Missing required field
      - User already exists
      - Other errors
  */
  async createUser(user, session = null) {
    try {
      // encrypt the password before creating the user and add it to the user object
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = { ...user, password: hashedPassword };
      // create the user and return the object data
      const result = await this.user.create([newUser], { session });
      if (!result) {
        throw new Error(`User could not be created`);
      }
      return this.filterUserData(result[0]);
    }
    catch (error) {
      // check if the error is a duplicate key error and throw an error if the user already exists
      if (error.code === 11000) {
        throw new Error('User already exists');
      } // if the error is a validation error, throw an error with the missing field
      else if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      }
      else {
        throw new Error(error.message);
      }
    }
  }

  /* getUserById method gets all users from users collection in the database
    Parameters:
      - id: string or ObjectId of the user
      - session: optional session for the transaction
    Returns:
      - filtered user object data
    Errors:
      - User not found
  */
  async getUserById(id, session = null) {
    try {
      // find the user by id
      const user = await this.user.findById(id, {}, { session });
      // check if the user was not found
      if (!user) {
        throw new Error('User not found');
      }
      return this.filterUserData(user);
    }
    catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* getUserByField method gets user by field other than id from users collection in the database
    Parameters:
      - seachObject: object with field and value to search for
      - session: optional session for the transaction
    Returns:
      - filtered user object data
    Errors:
      - User not found
  */
  async getUserByField(seachObject, session = null) {
    try {
      // find the user by field other than id
      const user = await this.user.findOne(seachObject, {}, { session });
      // check if the user was not found
      if (!user) {
        throw new Error('User not found');
      }
      return this.filterUserData(user);
    }
    catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* countUsers method counts the number of users with a specific role in the users collection
    Parameters:
      - role: string value of the role to search for
      - session: optional session for the transaction
    Returns:
      - number of users with the specific role
    Errors:
      - Invalid role
      - Failed to count users
  */
  async countRoleUsers(role, session = null) {
    // check if the role is valid in the list of roles ['learner', 'instructor'] throw an error invalid role
    if (!['learner', 'instructor'].includes(role)) {
      throw new Error('Invalid role');
    }

    try {
      // count the number of users with the specific role
      const result = await this.user.countDocuments({ roles: role }, { session });
      return result;
    }
    catch (error) {
      // throw an error if the count failed
      throw new Error('Failed to count users');
    }
  }

  /* updateUserById method updates a user by id with new data in the users collection
    except password, resetPasswordToken and resetPasswordExpires
      - id: string or ObjectId of the user
      - userData: object with new user data
      - session: optional session for the transaction
    Returns:
      - updated user object data
    Errors:
      - Failed to update user
  */
  async updateUserById(id, userData, session = null) {
    try {
      // update the user by id with the new user data
      const result = await this.user.findByIdAndUpdate(
        id,
        userData,
        { new: true, session }
      );
      // check if the user was not updated
      if (!result) {
        throw new Error('Failed to update user');
      }
      return this.filterUserData(result);
    }
    catch (error) {
      throw new Error('Failed to update user');
    }
  }

  /* generateConfirmationToken method generates a confirmation token for a user by id in the users collection
    Parameters:
      - id: string or ObjectId of the user
      - session: optional session for the transaction
    Returns:
      - confirmation token
    Errors:
      - User not found
  */
  async generateConfirmationToken(id, session = null) {
    try {
      // generate a random token form of 6 numbers
      const token = Math.floor(100000 + Math.random() * 900000);
      const time = Date.now() + 900000;
      // update the user by id with the new confirmation token
      const result = await this.user.findByIdAndUpdate(
        id,
        { confirmationToken: token, confirmationTokenExpires: time },
        { new: true, session }
      );
      // check if the user was not updated
      if (!result) {
        throw new Error('User not found');
      }
      return result.confirmationToken;
    }
    catch (error) {
      // throw an error if the user was not updated
      throw new Error('User not found');
    }
  }

  /* confirmUser method updates the confirmed field to true for a user by id in the users collection
    Parameters:
      - userId: string or ObjectId of the user
      - token: string value of the confirmation token
      - session: optional session for the transaction
    Returns:
      - true if the user was confirmed successfully
    Errors:
      - Failed to confirm user
  */
  async confirmUser(userId, token, session = null) {
    try {
      // update the user by token with the confirmed field to true
      const result = await this.user.findOneAndUpdate(
        { _id: userId, confirmationToken: token, confirmationTokenExpires: { $gt: Date.now() } },
        { confirmed: true, confirmationToken: null, confirmationTokenExpires: null },
        { new: true, session }
      );
      // check if the user was not updated
      if (!result) {
        throw new Error('Failed to confirm user');
      }
      return result.confirmed;
    }
    catch (error) {
      // throw an error if the user was not updated
      throw new Error('Failed to confirm user');
    }
  }

  /* addNewRole method adds a new role to a user by id in the users collection
    Parameters:
      - id: string or ObjectId of the user
      - role: string value of the new role either 'learner' or 'instructor'
      - session: optional session for the transaction
    Returns:
      - array of roles of the user
    Errors:
      - Invalid role
      - User not found
  */
  async addNewRole(id, role, session = null) {
    // check if the role is valid in the list of roles ['learner', 'instructor'] else throw an error invalid role 
    if (!['learner', 'instructor'].includes(role)) {
      throw new Error('Invalid role');
    }

    try {
      // update the user by id with the new role
      const result = await this.user.findByIdAndUpdate(
        id,
        { $addToSet: { roles: role } },
        { new: true, session }
      );
      // check if the user was not updated
      if (!result) {
        throw new Error('User not found');
      }
      return result.roles;
    }
    catch (error) {
      // throw an error if the user was not updated or not found
      throw new Error('User not found');
    }
  }

  /* checkUserPassword method checks if the user password is correct
    Parameters:
      - email: string value of the user email
      - password: string value of the user password
      - session: optional session for the transaction
    Returns:
      - user data
    Errors:
      - User not found
      - Password is incorrect
  */
  async checkUserPassword(email, password, session = null) {
    try {
      // find the user by email and if not found throw an error
      const user = await this.user.findOne({ email }, {}, { session });
      if (!user) {
        throw new Error('User not found');
      }
      // compare the password with the hashed password and if not correct throw an error
      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        throw new Error('Password is incorrect');
      }
      return user;
    }
    catch (error) {
      // throw an error if the user was not found or password is incorrect
      throw new Error(error.message);
    }
  }

  /* resetPassword method resets the user password with create a new token and expiration time
    Parameters:
      - email: string value of the user email
      - session: optional session for the transaction
    Returns:
      - reset password token
    Errors:
      - User not found
  */
  async resetPasswordToken(email, session = null) {
    try {
      // generate a random token form of 6 numbers
      const token = Math.floor(100000 + Math.random() * 900000);
      // set the token expiration time 15 minutes
      const time = Date.now() + 900000;
      // update the user by email with the new token and expiration time
      const result = await this.user.findOneAndUpdate(
        { email },
        { resetPasswordToken: token, resetPasswordExpires: time },
        { new: true, session }
      );
      // check if the user was not found
      if (!result) {
        throw new Error('User not found');
      }
      return result.resetPasswordToken;
    }
    catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* verifyByToken method verifies the reset password token and expiration time
    Parameters:
      - token: string value of the reset password token
      - session: optional session for the transaction
    Returns:
      - user id
    Errors:
      - Token is invalid or expired
  */
  async verifyByToken(token, session = null) {
    try {
      // find the user by the reset password token and expiration time is greater than the current time
      const user = await this.user.findOne(
        { resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } },
        {},
        { session }
      );
      // check if the user was not found
      if (!user) {
        throw new Error('Token is invalid or expired');
      }
      return user._id;
    }
    catch (error) {
      // throw an error if the token is invalid or expired
      throw new Error('Token is invalid or expired');
    }
  }

  /* updatePassword method updates the user password with a new password
    Parameters:
      - id: string or ObjectId of the user
      - password: string value of the new password
      - session: optional session for the transaction
    Returns:
      - message 'Password updated successfully'
    Errors:
      - User not found
  */
  async updatePassword(id, password, session = null) {
    try {
      // encrypt the new password before updating the user
      const hashedPassword = await bcrypt.hash(password, 10);
      // update the user by id with the new password
      const result = await this.user.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true, session }
      );
      // check if the user was not found
      if (!result) {
        throw new Error('User not found');
      }
      return 'Password updated successfully';
    }
    catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* addCourseToEnrolledList method adds a course to the enrolled list of a user by id
    Parameters:
      - id: string or ObjectId of the user
      - courseId: string or ObjectId of the course
      - paymentId: string or ObjectId of the payment
      - session: optional session for the transaction
    Returns:
      - courseId
    Errors:
      - User not found
  */
  async addCourseToEnrolledList(id, courseId, paymentId, session = null) {
    try {
      // define the course object with the course id and payment id to add to the enrolled list
      const course = {
        courseId: courseId.toString(),
        paymentId: paymentId.toString(),
      };
      const result = await this.user.findByIdAndUpdate(
        id,
        { $addToSet: { enrolled: course } },
        { new: true, session }
      );
      // check if the user was not found
      if (!result) {
        throw new Error('User not found');
      }
      return courseId;
    }
    catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* updateCourseProgress method updates the progress of a course in the enrolled list of a user by id
    Parameters:
      - id: string or ObjectId of the user
      - courseId: string or ObjectId of the course
      - progress: number value to add to the current progress of the course
      - session: optional session for the transaction
    Returns:
      - current progress of the course
    Errors:
      - User not found
  */
  async updateCourseProgress(id, courseId, progress, session = null) {
    try {
      // update the user by id with the added progress to current progress of the course
      const result = await this.user.findOneAndUpdate(
        { _id: id },
        { $inc: { 'enrolled.$[course].progress': progress } }, // increment the progress of the course
        {
          new: true,
          session,
          arrayFilters: [{ 'course.courseId': courseId }] // filter the course by courseId
        }
      );
      // check if the user was not found
      if (!result) {
        throw new Error('User not found');
      }
      // find the course in the enrolled list of the user by courseId and get the current progress
      const currentProgress = result.enrolled.find(course => course.courseId === courseId.toString()).progress;
      return currentProgress;
    }
    catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }

  /* addCourseToWishlistorCreatedList method adds a course to the wishlist or created list of a user by id
    Parameters:
      - id: string or ObjectId of the user
      - addedList: string value of the list to add the course to either 'wishlist' or 'createdList'
      - courseId: string or ObjectId of the course
      - session: optional session for the transaction
    Returns:
      - string value 'Course added to wishlist successfully' or 'Course added to createdList successfully'
    Errors:
      - User not found
      - User is not an instructor
      - User is not a learner
  */
  async addCourseToWishlistorCreatedList(id, addedList, courseId, session = null) {
    try {
      // get user roles to check if the user role related to the addedList
      const user = await this.user.findById(id, {}, { session });
      // check if the user was not found
      if (!user) {
        throw new Error('User not found');
      }

      // check if the user role is not instructor and the addedList is createdList
      if (!user.roles.includes('instructor') && addedList === 'createdList') {
        throw new Error('User is not an instructor');
      }
      // check if the user role is learner and the addedList is wishlist
      if (!user.roles.includes('learner') && addedList === 'wishList') {
        throw new Error('User is not a learner');
      }

      // add the course to the user's list by id
      const result = await this.user.findByIdAndUpdate(
        id,
        { $addToSet: { [addedList]: courseId.toString() } }, // add the courseId to the addedList array
        { session }
      );
      // check if the user was not found
      if (!result) {
        throw new Error('User not found');
      }
      return `Course added to ${addedList} successfully`;
    }
    catch (error) {
      if (error.message.includes('User')) {
        throw new Error(error.message);
      } else {
        throw new Error('User not found');
      }
    }
  }

  /* removeCourseFromList method removes a course from any list of a user by id
    Parameters:
      - id: string or ObjectId of the user
      - listName: string value of the list to remove the course from either 'wishlist' or 'createdList', 'enrolled'
      - courseId: string or ObjectId of the course
      - session: optional session for the transaction
    Returns:
      - string value 'Course removed from list' where list is the listName
    Errors:
      - User not found
      - User is not an instructor
      - User is not a learner
  */
  async removeCourseFromList(id, listName, courseId, session = null) {
    try {
      // get user roles to check if the user role related to the listName
      const user = await this.user.findById(id, {}, { session });
      // check if the user was not found
      if (!user) {
        throw new Error('User not found');
      }

      // check if the user role is not instructor and the listName is createdList
      if (!user.roles.includes('instructor') && listName === 'createdList') {
        throw new Error('User is not an instructor');
      }
      // check if the user role is learner and the listName is wishlist or enrolled
      if (!user.roles.includes('learner') && (listName === 'wishList' || listName === 'enrolled')) {
        throw new Error('User is not a learner');
      }

      // remove the course from the user's list by id if the listName is enrolled
      if (listName === 'enrolled') {
        const result = await this.user.findByIdAndUpdate(
          id,
          { $pull: { enrolled: { courseId: courseId.toString() } } }, // remove the course from the enrolled list
          { session }
        );
        // check if the user was not found
        if (!result) {
          throw new Error('User not found');
        }
      }
      // remove the course from the user's list by id if the listName is wishlist or createdList
      else {
        const result = await this.user.findByIdAndUpdate(
          id,
          { $pull: { [listName]: courseId.toString() } }, // remove the courseId from the listName array
          { session }
        );
        // check if the user was not found
        if (!result) {
          throw new Error('User not found');
        }
      }

      return `Course removed from ${listName}`;
    }
    catch (error) {
      if (error.message.includes('User')) {
        throw new Error(error.message);
      } else {
        throw new Error('User not found');
      }
    }
  }

  /* deleteUserById method deletes a user by id from the users collection
    Parameters:
      - id: string or ObjectId of the user
      - session: optional session for the transaction
    Returns:
      - deleted user object
    Errors:
      - User not found
  */
  async deleteUserById(id, session = null) {
    try {
      // delete the user by id
      const result = await this.user.findByIdAndDelete(id, { session });
      // check if the user was not found
      if (!result) {
        throw new Error('User not found');
      }
      return this.filterUserData(result);
    } catch (error) {
      // throw an error if the user was not found
      throw new Error('User not found');
    }
  }
}

export default UserModel;
