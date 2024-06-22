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
      quizScore: { type: [Number], default: [], },
    }, { timestamps: true, }); // add timestamps to the schema

    // Define the userSchema for the users collection
    this.userSchema = new Schema({
      userName: { type: String, required: true, unique: true, },
      email: { type: String, required: true, unique: true, },
      password: { type: String, required: true, },
      confirmed: { type: Boolean, default: false, },
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

    // add post hook to the userSchema to calculate the profile completed percentage
    // after a user is found
    this.userSchema.post('findOne', (doc) => {
      UserSchema.postProfileComplete(doc);
    })

    // after find and update a user
    this.userSchema.post('findOneAndUpdate', (doc) => {
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
      let completed = 0;
      // list of fields to ignore in the calculation
      const ignoreFields = [
        'enrolled', 'wishList', 'createdAt', 'updatedAt', 'resetPasswordToken', 'resetPasswordExpires', '__v', '_id', 'createdList'
      ];
      // list of fields without the ignored fields
      const calculatedFields = Object.keys(doc._doc).filter(key => !ignoreFields.includes(key));
      // loop through the list of fields to check if the field is not null or empty to increment the completed count
      for (const key of calculatedFields) {
        if (doc[key]) {
          completed++;
        }
      }
      // set the profileCompleted field to the percentage of completed fields from the total fields
      doc.profileCompleted = Math.floor((completed / calculatedFields.length) * 100);
    }
  }

}


// export the UserSchema class
export default UserSchema;
