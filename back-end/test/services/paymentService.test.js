import { paymentModel } from "../../databases/mongoDB.js";
import * as paymentService from "../../services/paymentService.js";
import Sinon from "sinon";
import { expect } from "chai";


// Test suite for paymentService functions
describe("paymentService", () => {

  // After each test, restore the default sandbox
  afterEach(() => {
    Sinon.restore();
  });


  // Test suite for getPaymentDetails function
  describe("getPaymentDetails", () => {

    // afterEach test, restore the default sandbox
    afterEach(() => {
      Sinon.restore();
    });

    // Test case for get payment details with success getPayment method call and return the payment document
    it("get payment details with success getPayment method call and return the payment document", async () => {
      // Mock the getPayment function to return a payment document
      Sinon.stub(paymentModel, "getPayment").returns({ paymentId: "1", amount: 10 });
      // Call the getPaymentDetails function
      const payment = await paymentService.getPaymentDetails('60f6e1b9b58fe3208a9b8b55');
      // verify that functions called with correct arguments
      expect(paymentModel.getPayment.calledWith('60f6e1b9b58fe3208a9b8b55')).to.be.true;
      // Check that the result is correct
      expect(payment).deep.equal({ paymentId: "1", amount: 10 });
    });

    // Test case for get payment details with error getPayment method call and throw an error
    it("get payment details with error getPayment method call and throw an error", async () => {
      // Mock the getPayment function to throw an error payment not found
      Sinon.stub(paymentModel, "getPayment").throws(new Error("Payment not found"));
      // Call the getPaymentDetails function and catch the error
      try {
        await paymentService.getPaymentDetails('60f6e1b9b58fe3208a9b8b55');
      } catch (error) {
        // verify that functions called with correct arguments
        expect(paymentModel.getPayment.calledWith('60f6e1b9b58fe3208a9b8b55')).to.be.true;
        // Check that the error is correct
        expect(error.message).to.equal("Payment not found");
      }
    });
  });


  // Test suite for getPaymentHistoryForUser function
  describe("getPaymentHistoryForUser", () => {

    // afterEach test, restore the default sandbox
    afterEach(() => {
      Sinon.restore();
    });

    // Test case for get payment history for user with success getAllPaymentsByUser method call and return the payment history
    it("get payment history for user with success getAllPaymentsByUser method call and return the payment history", async () => {
      // Mock the getAllPaymentsByUser function to return the payment history
      Sinon.stub(paymentModel, "getAllPaymentsByUser").returns([{ paymentId: "1", amount: 10 }]);
      // Call the getPaymentHistoryForUser function
      const payments = await paymentService.getPaymentHistoryForUser('60f6e1b9b58fe3208a9b8b55');
      // verify that functions called with correct arguments
      expect(paymentModel.getAllPaymentsByUser.calledOnceWith('60f6e1b9b58fe3208a9b8b55')).to.be.true;
      // Check that the result is correct
      expect(payments.length).to.equal(1);
      expect(payments[0]).deep.equal({ paymentId: "1", amount: 10 });
    });

    // Test case for get payment history for user with error getAllPaymentsByUser method call and throw an error
    it("get payment history for user with error getAllPaymentsByUser method call and throw an error", async () => {
      // Mock the getAllPaymentsByUser function to throw an error user have no payments yet
      Sinon.stub(paymentModel, "getAllPaymentsByUser").throws(new Error("User have no payments yet"));
      // Call the getPaymentHistoryForUser function and catch the error
      try {
        await paymentService.getPaymentHistoryForUser('60f6e1b9b58fe3208a9b8b55');
      } catch (error) {
        // verify that functions called with correct arguments
        expect(paymentModel.getAllPaymentsByUser.calledOnceWith('60f6e1b9b58fe3208a9b8b55')).to.be.true;
        // Check that the error is correct
        expect(error.message).to.equal("User have no payments yet");
      }
    });

  });


  // Test suite for getCourseTotalRevenue function
  describe("getCourseTotalRevenue", () => {

    // afterEach test, restore the default sandbox
    afterEach(() => {
      Sinon.restore();
    });

    // Test case for get course total revenue with success courseTotalPayment method call and return the total revenue
    it("get course total revenue with success courseTotalPayment method call and return the total revenue", async () => {
      // Mock the courseTotalPayment function to return the total revenue
      Sinon.stub(paymentModel, "courseTotalPayment").returns(100);
      // Call the getCourseTotalRevenue function
      const totalRevenue = await paymentService.getCourseTotalRevenue('60f6e1b9b58fe3208a9b8b55');
      // verify that functions called with correct arguments
      expect(paymentModel.courseTotalPayment.calledWith('60f6e1b9b58fe3208a9b8b55')).to.be.true;
      // Check that the result is correct
      expect(totalRevenue).to.equal(100);
    });

    // Test case for get course total revenue with error courseTotalPayment method call and throw an error
    it("get course total revenue with error courseTotalPayment method call and throw an error", async () => {
      // Mock the courseTotalPayment function to throw an error course not found
      Sinon.stub(paymentModel, "courseTotalPayment").throws(new Error("Course not found"));
      // Call the getCourseTotalRevenue function and catch the error
      try {
        await paymentService.getCourseTotalRevenue('60f6e1b9b58fe3208a9b8b55');
      } catch (error) {
        // verify that functions called with correct arguments
        expect(paymentModel.courseTotalPayment.calledWith('60f6e1b9b58fe3208a9b8b55')).to.be.true;
        // Check that the error is correct
        expect(error.message).to.equal("Course not found");
      }
    });
  });


  // Test suite for getInstructorTotalRevenue function
  describe("getInstructorTotalRevenue", () => {

    // afterEach test, restore the default sandbox
    afterEach(() => {
      Sinon.restore();
    });

    // Test case for get instructor total revenue with success getTotalPaymentForInstuctor method call and return the total revenue
    it("get instructor total revenue with success getTotalPaymentForInstuctor method call and return the total revenue", async () => {
      // Mock the getTotalPaymentForInstuctor function to return the total revenue
      Sinon.stub(paymentModel, "getTotalPaymentForInstuctor").returns(1000);
      // Call the getInstructorTotalRevenue function
      const totalRevenue = await paymentService.getInstructorTotalRevenue(['60f6e1b9b58fe3208a9b8b55']);
      // verify that functions called with correct arguments
      expect(paymentModel.getTotalPaymentForInstuctor.calledOnceWith(['60f6e1b9b58fe3208a9b8b55'])).to.be.true;
      // Check that the result is correct
      expect(totalRevenue).to.equal(1000);
    });

    // Test case for get instructor total revenue with error getTotalPaymentForInstuctor method call and throw an error
    it("get instructor total revenue with error getTotalPaymentForInstuctor method call and throw an error", async () => {
      // Mock the getTotalPaymentForInstuctor function to throw an error courses have no payments yet
      Sinon.stub(paymentModel, "getTotalPaymentForInstuctor").throws(new Error("Courses have no payments yet"));
      // Call the getInstructorTotalRevenue function and catch the error
      try {
        await paymentService.getInstructorTotalRevenue(['60f6e1b9b58fe3208a9b8b55']);
      } catch (error) {
        // verify that functions called with correct arguments
        expect(paymentModel.getTotalPaymentForInstuctor.calledOnceWith(['60f6e1b9b58fe3208a9b8b55'])).to.be.true;
        // Check that the error is correct
        expect(error.message).to.equal("Courses have no payments yet");
      }
    });
  });


  // Test suite for getTotalRevenue function
  describe("getTotalRevenue", () => {

    // afterEach test, restore the default sandbox
    afterEach(() => {
      Sinon.restore();
    });

    // Test case for get total revenue with success totalPayment method call and return the total revenue
    it("get total revenue with success totalPayment method call and return the total revenue", async () => {
      // Mock the totalPayment function to return the total revenue
      Sinon.stub(paymentModel, "totalPayment").returns(1000);
      // Call the getTotalRevenue function
      const totalRevenue = await paymentService.getTotalRevenue();
      // verify that functions called with correct arguments
      expect(paymentModel.totalPayment.calledOnce).to.be.true;
      // Check that the result is correct
      expect(totalRevenue).to.equal(1000);
    });

    // Test case for get total revenue with error totalPayment method call and throw an error
    it("get total revenue with error totalPayment method call and throw an error", async () => {
      // Mock the totalPayment function to throw an error failed to get total revenue
      Sinon.stub(paymentModel, "totalPayment").throws(new Error("Failed to get total revenue"));
      // Call the getTotalRevenue function and catch the error
      try {
        await paymentService.getTotalRevenue();
      } catch (error) {
        // verify that functions called with correct arguments
        expect(paymentModel.totalPayment.calledOnce).to.be.true;
        // Check that the error is correct
        expect(error.message).to.equal("Failed to get total revenue");
      }
    });
  });


}).timeout(5000);