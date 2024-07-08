import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for course schema with pre and post hooks
class CourseSchema {

  constructor() {
    // Define schema for the courses collection
    this.courseSchema = new Schema({
      title: { type: String, required: true, },
      description: { type: String, required: true, },
      // tags field with custom validation to check if the tags array has at least 3 tags
      tags: {
        type: [String], required: true,
        validate: {
          validator: (tags) => tags.length > 2,
          message: 'Tags field must have at least 3 tags',
        },
      },
      authorId: { type: String, ref: 'users', required: true, },
      lessons: { type: [String], ref: 'lessons', default: [], },
      price: { type: Number, default: 0, },
      discount: { type: Number, default: 0, },
      reviews: { type: [String], ref: 'reviews', default: [], },
      sumReviews: { type: Number, default: 0, },
      courseAvgRating: { type: Number, default: 0, },
      students: { type: Number, default: 0, },
      image: { type: String, default: null, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Add pre hook to calculate the courseAvgRating before saving the course
    this.courseSchema.pre('save', function (next) {
      CourseSchema.calculateAvgCourseRating(this, next);
    });

    // Create a new model for the courses collection with the course schema
    this.course = mongoose.model('courses', this.courseSchema);
  }

  /* calculateAvgCourseRating method to calculate the average rating for the course before saving
    Parameters:
      - course: course data object
      - next: function to call the next middleware
  */
  static calculateAvgCourseRating(course, next) {
    // check if length of reviews is less than 1 and return avg rating as 0
    if (course.reviews.length < 1) {
      course.courseAvgRating = 0;
      return next();
    }
    // calculate the course average rating by dividing the sum of reviews by the number of reviews
    course.courseAvgRating = course.sumReviews / course.reviews.length;
    return next();
  }

}


export default CourseSchema;
