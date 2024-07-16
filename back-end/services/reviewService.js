import mongoDB, { reviewModel, courseModel } from '../databases/mongoDB.js';


/* createReview function to create a review document then add it to the course document
  Parameters:
    - reviewData: an object containing the review data
  Returns:
    - Message: 'Review created and added to the course successfully'
  Errors:
    - missing required fields
    - You already have a review for this course
    - Review could not be created
    - Course not found
  */
export async function createReview(reviewData) {
  // start a new session with the database
  const session = mongoDB.startSession();
  try {
    // create a new review document in the database
    const newReview = await reviewModel.createReview(reviewData, session);
    // add the review to the course document
    await courseModel.addReviewToCourse(newReview.courseId, newReview._id, reviewData.rating, session);
    // commit the transaction
    await mongoDB.commitTransaction(session);
    // return a success message
    return 'Review created and added to the course successfully';
  } catch (error) {
    // abort the transaction
    await mongoDB.abortTransaction(session);
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}


/* getReview function to get a review document from the database
  Parameters:
    - reviewId: string with the review id
  Returns:
    - review object data
  Errors:
    - Review not found
    - Other errors
  */
export async function getReview(reviewId) {
  try {
    // get the review document from the database
    const review = await reviewModel.getReview(reviewId);
    // return the review object data
    return review;
  } catch (error) {
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}


/* getAllReviewsOfUser function to get all the reviews of a user from the database
  Parameters:
    - userId: string with the user id
  Returns:
    - Array of review objects data
  Errors:
    - Reviews not found
    - Other errors
  */
export async function getAllReviewsOfUser(userId) {
  try {
    // get all the reviews of a user from the database
    const reviews = await reviewModel.getAllReviewsByUserId(userId);
    // return the array of review objects data
    return reviews;
  } catch (error) {
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}


/* getAllReviewsOfCourse function to get all the reviews of a course from the database
  Parameters:
    - courseId: string with the course id
  Returns:
    - Array of review objects data
  Errors:
    - Reviews not found
    - Other errors
  */
export async function getAllReviewsOfCourse(courseId) {
  try {
    // get all the reviews of a course from the database
    const reviews = await reviewModel.getAllReviewsByCourseId(courseId);
    // return the array of review objects data
    return reviews;
  } catch (error) {
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}


/* removeReview function to remove a review document from the database then remove it from the course document
  Parameters:
    - reviewId: string with the review id
  Returns:
    - Message 'Review removed from the course and deleted successfully'
  Errors:
    - Review not found
    - Other errors
  */
export async function removeReview(reviewId) {
  // start a new session with the database
  const session = mongoDB.startSession();
  try {
    // remove the review document from the database
    const review = await reviewModel.removeReview(reviewId, session);
    // remove the review from the course document
    await courseModel.removeReviewFromCourse(review.courseId, reviewId, review.rating, session);
    // commit the transaction
    await mongoDB.commitTransaction(session);
    // return a success message
    return 'Review removed from the course and deleted successfully';
  } catch (error) {
    // abort the transaction
    await mongoDB.abortTransaction(session);
    // throw an error accoding to the error message
    throw new Error(error.message);
  }
}
