import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for course schema with pre and post hooks
class CourseSchema {

  constructor() {
    // Define schema for subdocument of sections in the courses collection
    this.sectionSchema = new Schema({
      title: { type: String, required: true, },
      description: { type: String, default: '', },
      lessons: { type: [String], ref: 'lessons', default: [], },
    });

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
      sections: { type: [this.sectionSchema], default: [], },
      price: { type: Number, default: 0, },
      discount: { type: Number, default: 0, },
      reviews: { type: [String], ref: 'reviews', default: [], },
      sumReviews: { type: Number, default: 0, },
      courseAvgRating: { type: Number, default: 0, },
      students: { type: [String], ref: 'users', default: [], },
      image: { type: String, default: null, },
    }, { timestamps: true, }); // add timestamps to the schema

    // post hook to calculate the average rating for the course after saving
    this.courseSchema.post('findOneAndUpdate', async function (doc) {
      // get the update object which contains the update operation
      const update = this.getUpdate();
      // check if the update object contains the reviews field either to push or pull a review
      if ((update.$push && update.$push.reviews) || (update.$pull && update.$pull.reviews)) {
        if (doc) {
          // get the session object from the options passed to the update operation to use it in the save operation
          // to make sure the update operation is part of the same session
          const session = this.getOptions().session;
          await CourseSchema.calculateAvgCourseRating(doc, session);
        }
      }
    });

    // Create a new model for the courses collection with the course schema
    this.course = mongoose.model('courses', this.courseSchema);
  }

  /* calculateAvgCourseRating method to calculate the average rating for the course before saving
    Parameters:
      - doc: the document object that contains the course data
      - session: the session object to use it in the save operation
  */
  static async calculateAvgCourseRating(doc, session) {
    // calculate the average rating for the course
    const avg = doc.sumReviews / doc.reviews.length;
    // update the courseAvgRating field with the new average rating value or 0 if there are no reviews
    if (avg) {
      doc.courseAvgRating = avg;
    } else {
      doc.courseAvgRating = 0;
    }
    // save the updated course document
    await doc.save({ session });
  }

}


export default CourseSchema;
