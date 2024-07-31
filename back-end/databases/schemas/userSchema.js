import mongoose from "mongoose";
const Schema = mongoose.Schema;


// abstract class for user schema with pre and post hooks
class UserSchema {

  constructor() {
    // Define the enrolledSchema for the enrolled courses by the learner user
    this.enrolledSchema = new Schema({
      _id: false, // disable the _id field for the subdocument
      courseId: { type: String, ref: 'courses', required: true, },
      progress: { type: Number, default: 0, },
      paymentId: { type: String, ref: 'payments', default: null, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Define the userSchema for the users collection
    this.userSchema = new Schema({
      userName: { type: String, required: true, unique: true, },
      email: { type: String, required: true, unique: true, },
      password: { type: String, required: true, },
      confirmed: { type: Boolean, default: false, },
      confirmationToken: { type: String, default: null, },
      profileCompleted: { type: Number, default: 0, },
      resetPasswordToken: { type: String, default: null, },
      resetPasswordExpires: { type: Date, default: null, },
      roles: { type: [String], default: ['learner'], enum: ['learner', 'instructor'], },
      firstName: { type: String, default: null, },
      lastName: { type: String, default: null, },
      phoneNumber: { type: String, default: null, },
      address: { type: String, default: null, },
      avatar: { type: String, default: null, },
      enrolled: { type: [this.enrolledSchema], default: [], },
      wishList: { type: [String], ref: 'courses', default: [] },
      createdList: { type: [String], ref: 'courses', default: [] },
    }, { timestamps: true, }); // add timestamps to the schema

    // after save or update a user document check percentage of profile completed
    // and set the profileCompleted field to the percentage
    this.userSchema.post('save', async function (doc, next) {
      try {
        await UserSchema.postProfileComplete(doc);
        next();
      } catch (error) {
        next(error);
      }
    });

    // after find and update a user
    this.userSchema.post('findOneAndUpdate', async function (doc, next) {
      try {
        await UserSchema.postProfileComplete(doc);
        next();
      } catch (error) {
        next(error);
      }
    });

    // create a new model for the users collection with the userSchema
    this.user = mongoose.model("users", this.userSchema);
  }

  /* static postProfileComplete method calculates the profile completed percentage
    Parameters:
      - instance: user instance with user data
      - next: function to call the next middleware
  */
  static async postProfileComplete(doc) {
    // check if the profileCompleted field exists and is equal to 100 to skip the calculation and call the next middleware
    if (doc) {
      if (doc.profileCompleted && doc.profileCompleted === 100) {
        return;
      }
      // list of fields to ignore in the calculation
      const ignoreFields = [
        'enrolled', 'wishList', 'createdAt', 'updatedAt', 'resetPasswordToken', 'confirmationToken',
        'resetPasswordExpires', '__v', '_id', 'createdList', 'profileCompleted'
      ];
      // list of fields without the ignored fields
      const completed = Object.keys(doc._doc).filter(key => !ignoreFields.includes(key) && doc[key]);
      const total = Object.keys(doc._doc).length - ignoreFields.length;
      // set the profileCompleted field to the percentage of completed fields from the total fields
      doc.profileCompleted = Math.floor((completed.length / total) * 100);
      // save the user data
      // Save the updated document
      if (doc.isModified()) {
        await doc.save();
      }
    }
  }

  /* filterUserData method to filter user data by remove password, resetPasswordToken, resetPasswordExpires
    and check if the user role in only instructor remove the wishList and enrolled fields
    and check if the user role is only learner remove the createdList field
    Parameters:
      - userDate: user data to filter
    return:
      - filtered user data
  */
  filterUserData(userData) {
    // check if the user data is not null or empty
    if (userData) {
      // copy the user data to a new object
      const user = userData.toObject();
      // remove the password, resetPasswordToken, and resetPasswordExpires fields
      delete user.password;
      delete user.resetPasswordToken;
      delete user.resetPasswordExpires;
      delete user.confirmationToken;
      // check if the user role is only instructor remove the wishList and enrolled fields
      if (user.roles.length === 1 && user.roles[0] === 'instructor') {
        delete user.wishList;
        delete user.enrolled;
      }
      // check if the user role is only learner remove the createdList field
      if (user.roles.length === 1 && user.roles[0] === 'learner') {
        delete user.createdList;
      }
      // return the filtered user data
      return user;
    }
  }

}


// export the UserSchema class
export default UserSchema;
