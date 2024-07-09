import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for review schema with pre and post hooks
class ReviewSchema {

  constructor() {
    // Define the schema of review
    this.reviewSchema = new Schema({
      userId: { type: String, ref: 'users', required: true, },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true, default: '' },
      courseId: { type: String, ref: 'courses', required: true },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create compound index for userId and courseId
    this.reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

    // Create a new model for the reviews collection with the review schema
    this.review = mongoose.model('reviews', this.reviewSchema);
  }
}

// Export the ReviewSchema class
export default ReviewSchema;