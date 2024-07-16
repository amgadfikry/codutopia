import { expect } from "chai";
import { reviewModel } from "../../databases/mongoDB.js";
import mongoDB from "../../databases/mongoDB.js";

// Test suite for to test all the methods in the ReviewModel class
describe("ReviewModel", () => {
  // Declare variables to be used across all the tests
  let review;
  let reviewId;

  // Before hook to prepare the data before all test start
  before(async () => {
    // Create a new review object
    review = {
      userId: '60f6e1b9b58fe3208a9b8b55',
      rating: 5,
      comment: "Great course",
      courseId: '60f6e1b9b58fe3208a9b8b56',
    };
  });

  // After hook to clean up reviews collection after all tests are done
  after(async () => {
    // Delete the review from the database
    await reviewModel.review.deleteMany({});
  });


  // Test suite for the createReview method with all scenarios
  describe("Test suite for createReview method", () => {

    // after hook to clean up reviews collection after each test
    afterEach(async () => {
      await reviewModel.review.deleteMany({});
    });

    // Test case for creating a new review with valid fields and return created review
    it('Create a new review with valid fields and return created review', async () => {
      // Create a new review in the database
      const newReview = await reviewModel.createReview(review);
      // Check if the result is correct
      expect(newReview).to.be.an('object');
      expect(newReview.userId).to.equal(review.userId);
      expect(newReview.rating).to.equal(review.rating);
      expect(newReview.comment).to.equal(review.comment);
      expect(newReview.courseId).to.equal(review.courseId);
    });

    // Test case for creating a new review with missing userId field and throw an error 'Missing userId field'
    it('Create a new review with missing userId field and throw an error "Missing userId field"', async () => {
      // Create temp review object with missing userId field
      const tempReview = { ...review, userId: null };
      // Try to create a new review in the database
      try {
        await reviewModel.createReview(tempReview);
      } catch (error) {
        expect(error.message).to.equal('Missing userId field');
      }
    });

    // Test case for creating a new review with duplicate userId and courseId fields and throw an error
    it('Create a new review with duplicate userId and courseId fields and throw an error', async () => {
      // Try to create a new review in the database with the same userId and courseId
      try {
        await reviewModel.createReview(review);
        await reviewModel.createReview(review);
      } catch (error) {
        expect(error.message).to.equal('You already have a review for this course');
      }
    });

    // Test case for creating a new review with valid fields using a transaction with session with success transaction
    it('Create a new review with valid fields using a transaction with session with success transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Create a new review in the database with the session
      await reviewModel.createReview(review, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // Check if review is created
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(1);
    });

    // Test case for creating a new review with valid fields using a transaction with session with failed transaction
    it('Create a new review with valid fields using a transaction with session with failed transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {// Create two reviews in the database with the session one will fail
        await reviewModel.createReview(review, session);
        await reviewModel.createReview(review, session);
        // abort the transaction
        await mongoDB.abortTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('You already have a review for this course');
        await mongoDB.abortTransaction(session);
      }
      // Check if review is created
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(0);
    });
  });


  // Test suite for the getReview method with all scenarios
  describe("Test suite for getReview method", () => {

    // before hook to create a review before each test
    beforeEach(async () => {
      // Create a new review in the database
      const newReview = await reviewModel.createReview(review);
      reviewId = newReview._id;
    });

    // after hook to clean up reviews collection after each test
    afterEach(async () => {
      await reviewModel.review.deleteMany({});
    });

    // Test case for getting a review with valid reviewId and return the review object
    it('Get a review with valid reviewId and return the review object', async () => {
      // Get the review from the database
      const newReview = await reviewModel.getReview(reviewId);
      // Check if the result is correct
      expect(newReview).to.be.an('object');
      expect(newReview.userId).to.equal(review.userId);
      expect(newReview.rating).to.equal(review.rating);
      expect(newReview.comment).to.equal(review.comment);
      expect(newReview.courseId).to.equal(review.courseId);
    });

    // Test case for getting a review with invalid reviewId and throw an error 'Review not found'
    it('Get a review with invalid reviewId and throw an error "Review not found"', async () => {
      // Try to get a review from the database with invalid reviewId
      try {
        await reviewModel.getReview('60f6e1b9b58fe3208a9b8b57');
      } catch (error) {
        expect(error.message).to.equal('Review not found');
      }
    });

    // Test case for getting a review with valid reviewId using a transaction with session with success transaction
    it('Get a review with valid reviewId using a transaction with session with success transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Get the review from the database with the session
      await reviewModel.getReview(reviewId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting a review with invalid reviewId using a transaction with session with failed transaction
    it('Get a review with invalid reviewId using a transaction with session with failed transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Get the review from the database with the session
        await reviewModel.getReview('60f6e1b9b58fe3208a9b8b57', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('Review not found');
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the removeReview method with all scenarios
  describe("Test suite for removeReview method", () => {

    // before hook to create a review before each test
    beforeEach(async () => {
      // Create a new review in the database
      const newReview = await reviewModel.createReview(review);
      reviewId = newReview._id;
    });

    // after hook to clean up reviews collection after each test
    afterEach(async () => {
      await reviewModel.review.deleteMany({});
    });

    // Test case for removing a review with valid reviewId and return deleted review object
    it('Remove a review with valid reviewId and return deleted review object', async () => {
      // Remove the review from the database
      const result = await reviewModel.removeReview(reviewId);
      // Check if the result is correct
      expect(result).to.be.an('object');
      expect(result.userId).to.equal(review.userId);
      expect(result.rating).to.equal(review.rating);
      expect(result.comment).to.equal(review.comment);
      expect(result.courseId).to.equal(review.courseId);
    });

    // Test case for removing a review with invalid reviewId and throw an error 'Review not found'
    it('Remove a review with invalid reviewId and throw an error "Review not found"', async () => {
      // Try to remove a review from the database with invalid reviewId
      try {
        await reviewModel.removeReview('60f6e1b9b58fe3208a9b8b57');
      } catch (error) {
        expect(error.message).to.equal('Review not found');
      }
    });

    // Test case for removing a review with valid reviewId using a transaction with session with success transaction
    it('Remove a review with valid reviewId using a transaction with session with success transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Remove the review from the database with the session
      await reviewModel.removeReview(reviewId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for removing a review with invalid reviewId using a transaction with session with failed transaction
    it('Remove a review with invalid reviewId using a transaction with session with failed transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Remove the review twice from the database with the session
        await reviewModel.removeReview(reviewId, session);
        await reviewModel.removeReview(reviewId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('Review not found');
        await mongoDB.abortTransaction(session);
      }
      // check if review is not removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(1);
    });
  });


  // Test suite for the getAllReviewsByUserId method with all scenarios
  describe("Test suite for getAllReviewsByUserId method", () => {

    // before hook to create two reviews before each test to same userId
    beforeEach(async () => {
      // Create a new review in the database
      await reviewModel.createReview(review);
      // Create a new review review object with different courseId
      const review2 = { ...review, courseId: '60f6e1b9b58fe3208a9b8b57' };
      await reviewModel.createReview(review2);
    });

    // after hook to clean up reviews collection after each test
    afterEach(async () => {
      await reviewModel.review.deleteMany({});
    });

    // Test case for getting all reviews with valid userId and return an array of review objects
    it('Get all reviews with valid userId and return an array of review objects', async () => {
      // Get all reviews from the database
      const reviews = await reviewModel.getAllReviewsByUserId(review.userId);
      // Check if the result is correct
      expect(reviews).to.be.an('array');
      expect(reviews.length).to.equal(2);
      expect(reviews[0].userId).to.equal(review.userId);
      expect(reviews[1].userId).to.equal(review.userId);
    });

    // Test case for getting all reviews with invalid userId and throw an error 'User did not created any reviews yet'
    it('Get all reviews with invalid userId and throw an error "User did not created any reviews yet"', async () => {
      // Try to get all reviews from the database with invalid userId
      try {
        await reviewModel.getAllReviewsByUserId('60f6e1b9b58fe3208a9b8b57');
      } catch (error) {
        expect(error.message).to.equal('User did not created any reviews yet');
      }
    });

    // Test case for getting all reviews with valid userId using a transaction with session with success transaction
    it('Get all reviews with valid userId using a transaction with session with success transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Get all reviews from the database with the session
      await reviewModel.getAllReviewsByUserId(review.userId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting all reviews with invalid userId using a transaction with session with failed transaction
    it('Get all reviews with invalid userId using a transaction with session with failed transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Get all reviews from the database with the session
        await reviewModel.getAllReviewsByUserId('60f6e1b9b58fe3208a9b8b57', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('User did not created any reviews yet');
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the getAllReviewsByCourseId method with all scenarios
  describe("Test suite for getAllReviewsByCourseId method", () => {

    // before hook to create two reviews before each test to same courseId
    beforeEach(async () => {
      // Create a new review in the database
      await reviewModel.createReview(review);
      // Create a new review review object with different userId
      const review2 = { ...review, userId: '60f6e1b9b58fe3208a9b8b57' };
      await reviewModel.createReview(review2);
    });

    // after hook to clean up reviews collection after each test
    afterEach(async () => {
      await reviewModel.review.deleteMany({});
    });

    // Test case for getting all reviews with valid courseId and return an array of review objects
    it('Get all reviews with valid courseId and return an array of review objects', async () => {
      // Get all reviews from the database
      const reviews = await reviewModel.getAllReviewsByCourseId(review.courseId);
      // Check if the result is correct
      expect(reviews).to.be.an('array');
      expect(reviews.length).to.equal(2);
      expect(reviews[0].courseId).to.equal(review.courseId);
      expect(reviews[1].courseId).to.equal(review.courseId);
    });

    // Test case for getting all reviews with invalid courseId and throw an error 'Course has no reviews'
    it('Get all reviews with invalid courseId and throw an error "Course has no reviews"', async () => {
      // Try to get all reviews from the database with invalid courseId
      try {
        await reviewModel.getAllReviewsByCourseId('60f6e1b9b58fe3208a9b8b57');
      } catch (error) {
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for getting all reviews with valid courseId using a transaction with session with success transaction
    it('Get all reviews with valid courseId using a transaction with session with success transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Get all reviews from the database with the session
      await reviewModel.getAllReviewsByCourseId(review.courseId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting all reviews with invalid courseId using a transaction with session with failed transaction
    it('Get all reviews with invalid courseId using a transaction with session with failed transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Get all reviews from the database with the session
        await reviewModel.getAllReviewsByCourseId('60f6e1b9b58fe3208a9b8b57', session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('Course not found');
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the removeAllReviewsByUserId method with all scenarios
  describe("Test suite for removeAllReviewsByUserId method", () => {

    // before hook to create two reviews before each test to same userId
    beforeEach(async () => {
      // Create a new review in the database
      await reviewModel.createReview(review);
      // Create a new review review object with different courseId
      const review2 = { ...review, courseId: '60f6e1b9b58fe3208a9b8b57' };
      await reviewModel.createReview(review2);
    });

    // after hook to clean up reviews collection after each test
    afterEach(async () => {
      await reviewModel.review.deleteMany({});
    });

    // Test case for removing all reviews with valid userId and return 'Reviews removed successfully'
    it('Remove all reviews with valid userId and return "Reviews removed successfully"', async () => {
      // Remove all reviews from the database
      const result = await reviewModel.removeAllReviewsByUserId(review.userId);
      // Check if the result is correct
      expect(result).to.equal('Reviews removed successfully');
      // Check if reviews are removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(0);
    });

    // Test case for removing all reviews with invalid userId and throw an error 'User has no reviews'
    it('Remove all reviews with invalid userId and throw an error "User has no reviews"', async () => {
      // Try to remove all reviews from the database with invalid userId
      try {
        await reviewModel.removeAllReviewsByUserId('60f6e1b9b58fe3208a9b8b57');
      } catch (error) {
        expect(error.message).to.equal('User not found or has no reviews');
      }
      // Check if reviews are not removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(2);
    });

    // Test case for removing all reviews with valid userId using a transaction with session with success transaction
    it('Remove all reviews with valid userId using a transaction with session with success transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Remove all reviews from the database with the session
      await reviewModel.removeAllReviewsByUserId(review.userId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // Check if reviews are removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(0);
    });

    // Test case for removing all reviews with invalid userId using a transaction with session with failed transaction
    it('Remove all reviews with invalid userId using a transaction with session with failed transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Remove all reviews from the database with the session twice
        await reviewModel.removeAllReviewsByUserId(review.userId, session);
        await reviewModel.removeAllReviewsByUserId(review.userId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('User not found or has no reviews');
        await mongoDB.abortTransaction(session);
      }
      // Check if reviews are not removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(2);
    });
  });


  // Test suite for the removeAllReviewsByCourseId method with all scenarios
  describe("Test suite for removeAllReviewsByCourseId method", () => {

    // before hook to create two reviews before each test to same courseId
    beforeEach(async () => {
      // Create a new review in the database
      await reviewModel.createReview(review);
      // Create a new review review object with different userId
      const review2 = { ...review, userId: '60f6e1b9b58fe3208a9b8b57' };
      await reviewModel.createReview(review2);
    });

    // after hook to clean up reviews collection after each test
    afterEach(async () => {
      await reviewModel.review.deleteMany({});
    });

    // Test case for removing all reviews with valid courseId and return 'Reviews removed successfully'
    it('Remove all reviews with valid courseId and return "Reviews removed successfully"', async () => {
      // Remove all reviews from the database
      const result = await reviewModel.removeAllReviewsByCourseId(review.courseId);
      // Check if the result is correct
      expect(result).to.equal('Reviews removed successfully');
      // Check if reviews are removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(0);
    });

    // Test case for removing all reviews with invalid courseId and throw an error 'Course has no reviews'
    it('Remove all reviews with invalid courseId and throw an error "Course has no reviews"', async () => {
      // Try to remove all reviews from the database with invalid courseId
      try {
        await reviewModel.removeAllReviewsByCourseId('60f6e1b9b58fe3208a9b8b57');
      } catch (error) {
        expect(error.message).to.equal('Course not found or has no reviews');
      }
      // Check if reviews are not removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(2);
    });

    // Test case for removing all reviews with valid courseId using a transaction with session with success transaction
    it('Remove all reviews with valid courseId using a transaction with session with success transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // Remove all reviews from the database with the session
      await reviewModel.removeAllReviewsByCourseId(review.courseId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // Check if reviews are removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(0);
    });

    // Test case for removing all reviews with invalid courseId using a transaction with session with failed transaction
    it('Remove all reviews with invalid courseId using a transaction with session with failed transaction', async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // Remove all reviews from the database with the session twice
        await reviewModel.removeAllReviewsByCourseId(review.courseId, session);
        await reviewModel.removeAllReviewsByCourseId(review.courseId, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      } catch (error) {
        expect(error.message).to.equal('Course not found or has no reviews');
        await mongoDB.abortTransaction(session);
      }
      // Check if reviews are not removed
      const newReview = await reviewModel.review.find({});
      expect(newReview.length).to.equal(2);
    });
  });


}).timeout(15000); // Set timeout for the test to 5 seconds
