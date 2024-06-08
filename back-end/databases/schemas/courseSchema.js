import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for course schema with pre and post hooks
class CourseSchema {

  constructor() {
    // Define schema for the review subdocument in the courses collection
    this.reviewSchema = new Schema({
      _id: false, // disable _id for subdocument
      userId: { type: String, ref: 'users', required: true, },
      rating: { type: Number, required: true, range: [1, 5], },
      comment: { type: String, default: null, },
    }, { timestamps: true, }); // add timestamps to the schema 

    // Define schema for the courses collection
    this.courseSchema = new Schema({
      title: { type: String, required: true, },
      description: { type: String, required: true, },
      authorId: { type: String, ref: 'users', required: true, },
      lessons: { type: [String], ref: 'lessons', default: [], },
      price: { type: Number, default: 0, },
      discount: { type: Number, default: 0, },
      reviews: { type: [this.reviewSchema], default: [], }, // array of review subdocuments
      students: { type: Number, default: 0, },
      image: { type: String, default: null, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the courses collection with the course schema
    this.course = mongoose.model('courses', this.courseSchema);
  }

}


export default CourseSchema;
