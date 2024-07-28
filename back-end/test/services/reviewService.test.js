import mongoDB, { reviewModel, courseModel } from "../../databases/mongoDB.js";
import * as reviewService from "../../services/reviewService.js";
import sinon from "sinon";
import { expect } from "chai";


//  Test suite for the reviewService functions
describe("Review Service", () => {

  // beforeEach function to stub the functions of transaction
  beforeEach(() => {
    // Mock the startSession, commitTransaction, and abortTransaction functions
    sinon.stub(mongoDB, "startSession").returns('session');
    sinon.stub(mongoDB, "commitTransaction").returns('commit');
    sinon.stub(mongoDB, "abortTransaction").returns('abort');
  });

  // afterEach function to restore the sandbox
  afterEach(() => {
    sinon.restore();
  });


  // Test suite for the createReview function
  describe("createReview", () => {
    let reviewData;

    // beforeEach function to create the reviewData object
    beforeEach(() => {
      reviewData = { courseId: 'courseId', rating: 5, _id: '60f6e1b9b58fe3208a9b8b55' };
    });

    // Test case for create Review function with both createReview and addReviewToCourse functions success calls and return message
    it("create Review function with both createReview and addReviewToCourse functions success calls and return message", async () => {
      // Mock the createReview and addReviewToCourse functions
      sinon.stub(reviewModel, "createReview").returns(reviewData);
      sinon.stub(courseModel, "addReviewToCourse").returns('added');
      // Call the createReview function and store the result
      const result = await reviewService.createReview(reviewData, 'session');
      // Verify stubs are called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(reviewModel.createReview.calledOnceWith(reviewData, 'session')).to.be.true;
      expect(courseModel.addReviewToCourse.calledOnceWith(reviewData.courseId, reviewData._id, reviewData.rating, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.called).to.be.false;
      // Check that the result is equal to the success message
      expect(result).to.equal('Review created and added to the course successfully');
    });

    // Test case for create Review function with createReview function success call and addReviewToCourse function failure call
    it("create Review function with createReview function success call and addReviewToCourse function failure call", async () => {
      // Mock the createReview and addReviewToCourse functions
      sinon.stub(reviewModel, "createReview").returns(reviewData);
      sinon.stub(courseModel, "addReviewToCourse").throws(new Error('Course not found'));
      // Call the createReview function and catch the error
      try {
        await reviewService.createReview(reviewData, 'session');
      } catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(reviewModel.createReview.calledOnceWith(reviewData, 'session')).to.be.true;
        expect(courseModel.addReviewToCourse.calledOnceWith(reviewData.courseId, reviewData._id, reviewData.rating, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.called).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for create Review function with createReview function failure call and addReviewToCourse function success call
    it("create Review function with createReview function failure call and addReviewToCourse function success call", async () => {
      // Mock the createReview and addReviewToCourse functions
      sinon.stub(reviewModel, "createReview").throws(new Error('Review could not be created'));
      sinon.stub(courseModel, "addReviewToCourse").returns('added');
      // Call the createReview function and catch the error
      try {
        await reviewService.createReview(reviewData, 'session');
      } catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(reviewModel.createReview.calledOnceWith(reviewData, 'session')).to.be.true;
        expect(courseModel.addReviewToCourse.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.called).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Review could not be created');
      }
    });

    // Test case for create Review function with createReview function failure call and addReviewToCourse function failure call
    it("create Review function with createReview function failure call and addReviewToCourse function failure call", async () => {
      // Mock the createReview and addReviewToCourse functions
      sinon.stub(reviewModel, "createReview").throws(new Error('Review could not be created'));
      sinon.stub(courseModel, "addReviewToCourse").throws(new Error('Course not found'));
      // Call the createReview function and catch the error
      try {
        await reviewService.createReview(reviewData, 'session');
      } catch (error) {
        // Verify stubs are called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(reviewModel.createReview.calledOnceWith(reviewData, 'session')).to.be.true;
        expect(courseModel.addReviewToCourse.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.called).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Review could not be created');
      }
    });
  });


  // Test suite for the getReview function
  describe("getReview", () => {
    let reviewId;

    // beforeEach function to create the reviewId string
    beforeEach(() => {
      reviewId = '60f6e1b9b58fe3208a9b8b55';
    });

    // Test case for get Review function with getReview function success call and return review object data
    it("get Review function with getReview function success call and return review object data", async () => {
      // Mock the getReview function
      sinon.stub(reviewModel, "getReview").returns({ _id: reviewId });
      // Call the getReview function and store the result
      const result = await reviewService.getReview(reviewId);
      // Verify stub is called with correct arguments
      expect(reviewModel.getReview.calledOnceWith(reviewId)).to.be.true;
      // Check that the result is equal to the review object data
      expect(result).to.deep.equal({ _id: reviewId });
    });

    // Test case for get Review function with getReview function failure call
    it("get Review function with getReview function failure call", async () => {
      // Mock the getReview function
      sinon.stub(reviewModel, "getReview").throws(new Error('Review not found'));
      // Call the getReview function and catch the error
      try {
        await reviewService.getReview(reviewId);
      } catch (error) {
        // Verify stub is called with correct arguments
        expect(reviewModel.getReview.calledOnceWith(reviewId)).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Review not found');
      }
    });
  });


  // Test suite for the getAllReviewsOfUser function
  describe("getAllReviewsOfUser", () => {
    let userId;

    // beforeEach function to create the userId string
    beforeEach(() => {
      userId = '60f6e1b9b58fe3208a9b8b55';
    });

    // Test case for get All Reviews Of User function with getAllReviewsByUserId function success call and return array of reviews
    it("get All Reviews Of User function with getAllReviewsByUserId function success call and return array of reviews", async () => {
      // Mock the getAllReviewsByUserId function
      sinon.stub(reviewModel, "getAllReviewsByUserId").returns([{ userId }]);
      // Call the getAllReviewsOfUser function and store the result
      const result = await reviewService.getAllReviewsOfUser(userId);
      // Verify stub is called with correct arguments
      expect(reviewModel.getAllReviewsByUserId.calledOnceWith(userId)).to.be.true;
      // Check that the result is equal to the array of review objects data
      expect(result.length).to.equal(1);
      expect(result[0]).to.deep.equal({ userId });
    });

    // Test case for get All Reviews Of User function with getAllReviewsByUserId function failure call
    it("get All Reviews Of User function with getAllReviewsByUserId function failure call", async () => {
      // Mock the getAllReviewsByUserId function
      sinon.stub(reviewModel, "getAllReviewsByUserId").throws(new Error('User did not created any reviews yet'));
      // Call the getAllReviewsOfUser function and catch the error
      try {
        await reviewService.getAllReviewsOfUser(userId);
      } catch (error) {
        // Verify stub is called with correct arguments
        expect(reviewModel.getAllReviewsByUserId.calledOnceWith(userId)).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('User did not created any reviews yet');
      }
    });
  });


  // Test suite for the getAllReviewsOfCourse function 
  describe("getAllReviewsOfCourse", () => {
    let courseId;

    // beforeEach function to create the courseId string
    beforeEach(() => {
      courseId = '60f6e1b9b58fe3208a9b8b55';
    });

    // Test case for get All Reviews Of Course function with getAllReviewsByCourseId function success call and return array of reviews
    it("get All Reviews Of Course function with getAllReviewsByCourseId function success call and return array of reviews", async () => {
      // Mock the getAllReviewsByCourseId function
      sinon.stub(reviewModel, "getAllReviewsByCourseId").returns([{ courseId }]);
      // Call the getAllReviewsOfCourse function and store the result
      const result = await reviewService.getAllReviewsOfCourse(courseId);
      // Verify stub is called with correct arguments
      expect(reviewModel.getAllReviewsByCourseId.calledOnceWith(courseId)).to.be.true;
      // Check that the result is equal to the array of review objects data
      expect(result.length).to.equal(1);
      expect(result[0]).to.deep.equal({ courseId });
    });

    // Test case for get All Reviews Of Course function with getAllReviewsByCourseId function failure call
    it("get All Reviews Of Course function with getAllReviewsByCourseId function failure call", async () => {
      // Mock the getAllReviewsByCourseId function
      sinon.stub(reviewModel, "getAllReviewsByCourseId").throws(new Error('Course has no reviews'));
      // Call the getAllReviewsOfCourse function and catch the error
      try {
        await reviewService.getAllReviewsOfCourse(courseId);
      } catch (error) {
        // Verify stub is called with correct arguments
        expect(reviewModel.getAllReviewsByCourseId.calledOnceWith(courseId)).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Course has no reviews');
      }
    });
  });


  // Test suite for the removeReview function
  describe("removeReview", () => {
    let reviewId;
    let reviewData;

    // beforeEach function to create the reviewId string and reviewData object
    beforeEach(() => {
      reviewId = '60f6e1b9b58fe3208a9b8b55';
      reviewData = { _id: reviewId, courseId: 'courseId', rating: 5 };
    });

    // Test case for remove Review function with removeReview and removeReviewFromCourse functions success calls and return message
    it("remove Review function with removeReview and removeReviewFromCourse functions success calls and return message", async () => {
      // Mock the removeReview function and removeReviewFromCourse function
      sinon.stub(reviewModel, "removeReview").returns(reviewData);
      sinon.stub(courseModel, "removeReviewFromCourse").returns('removed');
      // Call the removeReview function and store the result
      const result = await reviewService.removeReview(reviewId, 'session');
      // Verify stub is called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(reviewModel.removeReview.calledOnceWith(reviewId, 'session')).to.be.true;
      expect(courseModel.removeReviewFromCourse.calledOnceWith(reviewData.courseId, reviewId, reviewData.rating, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.called).to.be.false;
      // Check that the result is equal to the review object data
      expect(result).to.be.equal('Review removed from the course and deleted successfully')
    });

    // Test case for remove Review function with removeReview function success call and removeReviewFromCourse function failure call
    it("remove Review function with removeReview function success call and removeReviewFromCourse function failure call", async () => {
      // Mock the removeReview function and removeReviewFromCourse function
      sinon.stub(reviewModel, "removeReview").returns(reviewData);
      sinon.stub(courseModel, "removeReviewFromCourse").throws(new Error('Course not found'));
      // Call the removeReview function and catch the error
      try {
        await reviewService.removeReview(reviewId, 'session');
      } catch (error) {
        // Verify stub is called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(reviewModel.removeReview.calledOnceWith(reviewId, 'session')).to.be.true;
        expect(courseModel.removeReviewFromCourse.calledOnceWith(reviewData.courseId, reviewId, reviewData.rating, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.called).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Course not found');
      }
    });

    // Test case for remove Review function with removeReview function failure call and removeReviewFromCourse function success call
    it("remove Review function with removeReview function failure call and removeReviewFromCourse function success call", async () => {
      // Mock the removeReview function and removeReviewFromCourse function
      sinon.stub(reviewModel, "removeReview").throws(new Error('Review not found'));
      sinon.stub(courseModel, "removeReviewFromCourse").returns('removed');
      // Call the removeReview function and catch the error
      try {
        await reviewService.removeReview(reviewId, 'session');
      } catch (error) {
        // Verify stub is called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(reviewModel.removeReview.calledOnceWith(reviewId, 'session')).to.be.true;
        expect(courseModel.removeReviewFromCourse.called).to.be.false;
        expect(mongoDB.commitTransaction.called).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Review not found');
      }
    });

    // Test case for remove Review function with removeReview function failure call and removeReviewFromCourse function failure call
    it("remove Review function with removeReview function failure call and removeReviewFromCourse function failure call", async () => {
      // Mock the removeReview function and removeReviewFromCourse function
      sinon.stub(reviewModel, "removeReview").throws(new Error('Review not found'));
      sinon.stub(courseModel, "removeReviewFromCourse").throws(new Error('Course not found'));
      // Call the removeReview function and catch the error
      try {
        await reviewService.removeReview(reviewId, 'session');
      } catch (error) {
        // Verify stub is called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(reviewModel.removeReview.calledOnceWith(reviewId, 'session')).to.be.true;
        expect(courseModel.removeReviewFromCourse.called).to.be.false;
        expect(mongoDB.commitTransaction.called).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check that the error message is thrown
        expect(error.message).to.equal('Review not found');
      }
    });
  });

}).timeout(5000);
