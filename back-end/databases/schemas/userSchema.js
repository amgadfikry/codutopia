import mongoose from "mongoose";
// save schema class from mongoose to a variable
const Schema = mongoose.Schema;


// abstract class for user schema with pre and post hooks
class UserSchema {

  constructor() {
    // create schema for subdocument of courses enrolled by the user
    this.enrolledSchema = new Schema({
      // courseId: ObjectId of the course with reference to the courses collection
      courseId: { type: String, ref: 'courses', required: true, },
      // progress: number value of the progress of the course with default value 0
      progress: { type: Number, default: 0, },
      // paymentId: of the course with reference to the payments collection with default value null
      paymentId: { type: String, ref: 'payments', default: null, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // create a new schema for the users collection
    this.userSchema = new Schema({
      // userName: string value that is required and unique
      userName: { type: String, required: true, unique: true, },
      // email: string value that is required and unique
      email: { type: String, required: true, unique: true, },
      // password: string value that is required
      password: { type: String, required: true, },
      // confirmed: boolean value if the user email is confirmed with default value false
      confirmed: { type: Boolean, default: false, },
      // resetPasswordToken: string value when the user request to reset the password with default value null
      resetPasswordToken: { type: String, default: null, },
      // resetPasswordExpires: date value when the reset password token expires with default value null
      resetPasswordExpires: { type: Date, default: null, },
      // roles: array of strings with default value ['learner'] and values 'learner' or 'instructor'
      roles: { type: [String], default: ['learner'], enum: ['learner', 'instructor'], },
      // firstName: string value with default value null
      firstName: { type: String, default: null, },
      // lastName: string value with default value null
      lastName: { type: String, default: null, },
      // phoneNumber: string value with default value null
      phoneNumber: { type: String, default: null, },
      // address: string value with default value null
      address: { type: String, default: null, },
      // avatar: string value of image id in oracle cloud storage with default value null
      avatar: { type: String, default: null, },
      // enrolled: array of subdocuments of courses enrolled by the user with reference to the courses collection
      enrolled: { type: [this.enrolledSchema], default: [], },
      // wishlist: array of ObjectIds to courses in the user's wishlist with reference to the courses collection
      wishlist: { type: [String], ref: 'courses', default: [] },
    }, { timestamps: true, }); // add timestamps to the schema

    // add post hook to the userSchema to calculate the profile completed percentage
    // after a user is found
    this.userSchema.post('findOne', (doc) => {
      // call the postProfileComplete method with the user instance
      UserSchema.postProfileComplete(doc);
    })

    // after find and update a user
    this.userSchema.post('findOneAndUpdate', (doc) => {
      // call the postProfileComplete method with the user instance
      UserSchema.postProfileComplete(doc);
    })

    // create a new model for the users collection with the userSchema
    this.user = mongoose.model("users", this.userSchema);
  }

  /* static postProfileComplete method calculates the profile completed percentage
    Parameters:
      - instance: user instance with user data
      - next: function to call the next middleware
  */
  static postProfileComplete(doc) {
    // check if the profileCompleted field exists and is equal to 100 to skip the calculation and call the next middleware
    if (doc) {
      if (doc.profileCompleted && doc.profileCompleted === 100) {
        return;
      }
      // number of fields completed
      let completed = 0;
      // list of fields to ignore in the calculation
      const ignoreFields = [
        'enrolled', 'wishlist', 'createdAt', 'updatedAt', 'resetPasswordToken', 'resetPasswordExpires', '__v', '_id'
      ];
      // list of fields without the ignored fields
      const calculatedFields = Object.keys(doc._doc).filter(key => !ignoreFields.includes(key));
      // loop through the list of fields to check if the field is not null or empty to increment the completed count
      for (const key of calculatedFields) {
        if (doc[key]) {
          completed++;
        }
      }
      // set the profileCompleted field to the percentage of completed fields from the total fields and call the next middleware
      doc.profileCompleted = Math.floor((completed / calculatedFields.length) * 100);
    }
  }

}


// export the UserSchema class
export default UserSchema;
