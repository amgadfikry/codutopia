import ReviewSchema from "../schemas/reviewSchema.js";

// ReviewModel class to interact with the reviews collection in the database
class ReviewModel extends ReviewSchema {

  constructor() {
    super();
  }

  /* CreateReview method to create a new review in the database
    Parameters:
      - review: object with the review data
      - session: optional session for the transaction
    Returns:
      - created object data
    Errors:
      - Review could not be created
      - Missing required field
      - Other errors
  */
  async createReview(review, session = null) {
    try {
      // Create a new review in the database
      const newReview = await this.review.create([review], { session });
      // if the review could not be created, throw an error
      if (!newReview) {
        throw new Error(`Review could not be created`);
      }
      return newReview[0];
    }
    catch (error) {
      // if there is a unique constraint error, throw an error with the existing review
      if (error.code === 11000) {
        throw new Error(`You already have a review for this course`);
      }
      // If the error is a validation error, throw an error with the missing field
      else if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        throw new Error(error.message);
      }
    }
  }

  /* GetReview method to get a review from the database
    Parameters:
      - reviewId: string with the review id
      - session: optional session for the transaction
    Returns:
      - review object data
    Errors:
      - Review not found
      - Other errors
  */
  async getReview(reviewId, session = null) {
    try {
      // Get the review from the database
      const review = await this.review.findById(reviewId, {}, { session });
      // if the review is not found, throw an error
      if (!review) {
        throw new Error(`Review not found`);
      }
      return review;
    }
    catch (error) {
      throw new Error('Review not found');
    }
  }

  /* removeReview method to remove a review from the database
    Parameters:
      - reviewId: string with the review id
      - session: optional session for the transaction
    Returns:
      - deleted review object data
    Errors:
      - Review not found
      - Other errors
  */
  async removeReview(reviewId, session = null) {
    try {
      // Get the review from the database
      const review = await this.review.findByIdAndDelete(reviewId, { session });
      // if the review is not found, throw an error
      if (!review) {
        throw new Error(`Review not found`);
      }
      return review;
    } catch (error) {
      throw new Error('Review not found');
    }
  }

  /*GetAllReviewsByUserId method to get all reviews from the database by userId
    Parameters:
      - userId: string with the user id
      - session: optional session for the transaction
    Returns:
      - Array of review objects data
    Errors:
      - User did not created any reviews yet
      - Other errors
  */
  async getAllReviewsByUserId(userId, session = null) {
    try {
      // Get all reviews from the database by userId
      const reviews = await this.review.find({ userId }, {}, { session });
      // if the reviews are not found, throw an error
      if (reviews.length === 0) {
        throw new Error(`User did not created any reviews yet`);
      }
      return reviews;
    } catch (error) {
      throw new Error('User did not created any reviews yet');
    }
  }

  /*GetAllReviewsByCourseId method to get all reviews from the database by courseId
    Parameters:
      - courseId: string with the course id
      - session: optional session for the transaction
    Returns:
      - Array of review objects data
    Errors:
      - Course has no reviews
      - Other errors
  */
  async getAllReviewsByCourseId(courseId, session = null) {
    try {
      // Get all reviews from the database by courseId
      const reviews = await this.review.find({ courseId }, {}, { session });
      // if the reviews are not found, throw an error
      if (reviews.length === 0) {
        throw new Error(`Course has no reviews`);
      }
      return reviews;
    } catch (error) {
      throw new Error('Course not found');
    }
  }

  /* RemoveAllReviewsByUserId method to remove all reviews from the database by userId
    Parameters:
      - userId: string with the user id
      - session: optional session for the transaction
    Returns:
      - Message 'Reviews removed successfully'
    Errors:
      - Reviews not found
      - Other errors
  */
  async removeAllReviewsByUserId(userId, session = null) {
    try {
      // Get all reviews from the database by userId
      const reviews = await this.review.deleteMany({ userId }, { session });
      // return a message if the reviews are removed successfully
      return 'Reviews removed successfully';
    } catch (error) {
      throw new Error('User not found or has no reviews');
    }
  }


  /* RemoveAllReviewsByCourseId method to remove all reviews from the database by courseId
    Parameters:
      - courseId: string with the course id
      - session: optional session for the transaction
    Returns:
      - Message 'Reviews removed successfully'
    Errors:
      - Reviews not found
      - Other errors
  */
  async removeAllReviewsByCourseId(courseId, session = null) {
    try {
      // Get all reviews from the database by courseId
      const reviews = await this.review.deleteMany({ courseId }, { session });
      // return a message if the reviews are removed successfully
      return 'Reviews removed successfully';
    } catch (error) {
      throw new Error('Course not found or has no reviews');
    }
  }

}

export default ReviewModel;
