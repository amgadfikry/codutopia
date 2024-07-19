import { expect } from "chai";
import mongoDB, { paymentModel } from "../../../databases/mongoDB.js";

// Test suite for to test all the methods in the paymentModel class
describe("PaymentModel", () => {
  // Declare variables to be used across all the tests
  let payment;
  let paymentId;

  // Before hook to prepare the data before all test start
  before(() => {
    // Create a new payment object
    payment = {
      userId: "60f6e1b9b58fe3208a9b8b55",
      courseId: "60f6e1b9b58fe3208a9b8b56",
      paymentMethod: "credit card",
      paymentAmount: 100,
      operationId: "789",
    };
  });

  // After hook to clean up payments collection after all tests are done
  after(async () => {
    // Delete the payments from the database
    await paymentModel.payment.deleteMany({});
  });


  // Test suite for the createPayment method with all scenarios
  describe("Test suite for createPayment method", () => {

    // after hook to clean up payments collection after tests in this suite are done
    after(async () => {
      await paymentModel.payment.deleteMany({});
    });

    // Test case for creating a new payment with valid fields and return created payment object
    it("create a new payment with valid fields and return created payment object", async () => {
      const result = await paymentModel.createPayment(payment);
      // check if the result is correct
      expect(result.userId).to.equal(payment.userId);
      expect(result.courseId).to.equal(payment.courseId);
      expect(result.paymentMethod).to.equal(payment.paymentMethod);
      expect(result.paymentAmount).to.equal(payment.paymentAmount);
      expect(result.operationId).to.equal(payment.operationId);
      // save the paymentId for future tests
      paymentId = result._id;
    });

    // Test case for creating a new payment with missing required fields and throw an error
    it("create a new payment with missing required fields and throw an error", async () => {
      try {
        // create temporary payment object with missing required field
        const tempPayment = { ...payment };
        delete tempPayment.userId;
        await paymentModel.createPayment(tempPayment);
      }
      catch (error) {
        expect(error.message).to.equal("Missing userId field");
      }
    });

    // Test case for creating a new payment with valid fields in a transaction with success transaction
    it("create a new payment with valid fields in a transaction with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // create a 2 new payments in a transaction
      await paymentModel.createPayment(payment, session);
      await paymentModel.createPayment(payment, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the payments are created
      const result = await paymentModel.payment.find({});
      expect(result.length).to.equal(3);
    });

    // Test case for creating a new payment with invalid fields in a transaction with failed transaction
    it("create a new payment with invalid fields in a transaction with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // create 2 new payments in a transaction one with missing required field and other with valid fields
        await paymentModel.createPayment(payment, session);
        const tempPayment = { ...payment };
        delete tempPayment.userId;
        await paymentModel.createPayment(tempPayment, session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Missing userId field");
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the payments are not created
      const result = await paymentModel.payment.find({});
      expect(result.length).to.equal(3);
    });

  });


  // Test suite for the getPayment method with all scenarios
  describe("Test suite for getPayment method", () => {

    // before hook to create a new payment before all tests start and save the paymentId
    before(async () => {
      const result = await paymentModel.createPayment(payment);
      paymentId = result._id;
    });

    // after hook to clean up payments collection after tests in this suite are done
    after(async () => {
      await paymentModel.payment.deleteMany({});
    });

    // Test case for getting a payment with valid paymentId and return the payment object
    it("get a payment with valid paymentId and return the payment object", async () => {
      const result = await paymentModel.getPayment(paymentId);
      // check if the result is correct
      expect(result.userId).to.equal(payment.userId);
      expect(result.courseId).to.equal(payment.courseId);
      expect(result.paymentMethod).to.equal(payment.paymentMethod);
      expect(result.paymentAmount).to.equal(payment.paymentAmount);
      expect(result.operationId).to.equal(payment.operationId);
      expect(result).to.have.property("createdAt");
      expect(result).to.have.property("updatedAt");
    });

    // Test case for getting a payment with invalid paymentId and throw an error
    it("get a payment with invalid paymentId and throw an error", async () => {
      try {
        await paymentModel.getPayment("5f6e1b9b58fe3208a9b8b55");
      }
      catch (error) {
        expect(error.message).to.equal("Payment not found");
      }
    });

    // Test case for getting a payment with valid paymentId in a transaction with success transaction
    it("get a payment with valid paymentId in a transaction with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // get the payment in a transaction 2 times and create a new payment
      await paymentModel.getPayment(paymentId, session);
      await paymentModel.getPayment(paymentId, session);
      await paymentModel.createPayment(payment, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the payments are created
      const result = await paymentModel.payment.find({});
      expect(result.length).to.equal(2);
    });

    // Test case for getting a payment with invalid paymentId in a transaction with failed transaction
    it("get a payment with invalid paymentId in a transaction with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // get payment twice one with valid paymentId and other with invalid paymentId and create a new payment
        await paymentModel.createPayment(payment, session);
        await paymentModel.getPayment(paymentId, session);
        await paymentModel.getPayment("5f6e1b9b58fe3208a9b8b55", session);
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Payment not found");
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
      // check if the payments are not created
      const result = await paymentModel.payment.find({});
      expect(result.length).to.equal(2);
    });
  });


  // Test suite for the checkPayment method with all scenarios
  describe("Test suite for checkPayment method", () => {

    // before hook to create a new payment before all tests start and save the paymentId
    before(async () => {
      const result = await paymentModel.createPayment(payment);
      paymentId = result._id;
    });

    // after hook to clean up payments collection after tests in this suite are done
    after(async () => {
      await paymentModel.payment.deleteMany({});
    });

    // Test case for checking a payment with valid paymentId and return true
    it("check a payment with valid paymentId and return true", async () => {
      const result = await paymentModel.checkPayment(paymentId);
      expect(result).to.equal(true);
    });

    // Test case for checking a payment with invalid paymentId and return false
    it("check a payment with invalid paymentId and return false", async () => {
      const result = await paymentModel.checkPayment("5f6e1b9b58fe3208a9b8b55");
      expect(result).to.equal(false);
    });
  });


  // Test suite for the getAllPaymentsByUser method with all scenarios
  describe("Test suite for getAllPaymentsByUser method", () => {

    // before hook to create multiple payments with the same userId
    beforeEach(async () => {
      await paymentModel.createPayment(payment);
      await paymentModel.createPayment(payment);
    });

    // after hook to clean up payments collection after tests in this suite are done
    afterEach(async () => {
      await paymentModel.payment.deleteMany({});
    });

    // Test case for getting all payments for a user with valid userId and return the payments array
    it("get all payments for a user with valid userId and return the payments array", async () => {
      const result = await paymentModel.getAllPaymentsByUser(payment.userId);
      // check if the result is correct
      expect(result.length).to.equal(2);
      expect(result[0].userId).to.equal(payment.userId);
      expect(result[1].userId).to.equal(payment.userId);
    });

    // Test case for getting all payments for a user with userId not have payments yet and throw an error
    it("get all payments for a user with userId not have payments yet and throw an error", async () => {
      try {
        await paymentModel.getAllPaymentsByUser("5f6e1b9b58fe3208a9b8b55");
      } catch (error) {
        expect(error.message).to.equal("User have no payments yet");
      }
    });

    // Test case for getting all payments for a user with valid userId in a transaction with success transaction
    it("get all payments for a user with valid userId in a transaction with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // get all payments for the user in a transaction
      await paymentModel.getAllPaymentsByUser(payment.userId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for getting all payments for a user with userId not have payments yet with failed transaction
    it("get all payments for a user with userId not have payments yet with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        await paymentModel.getAllPaymentsByUser(payment.userId, session);
        // get all payments for the user in a transaction with userId not have payments yet
        await paymentModel.getAllPaymentsByUser("5f6e1b9b58fe3208a9b8b55", session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("User have no payments yet");
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the courseTotalPayment method with all scenarios
  describe("Test suite for courseTotalPayment method", () => {

    // before hook to create multiple payments with the same courseId and one with diffrent courseId
    beforeEach(async () => {
      await paymentModel.createPayment(payment);
      await paymentModel.createPayment(payment);
      await paymentModel.createPayment({ ...payment, courseId: "60f6e1b9b58fe3208a9b8b57" });
    });

    // after hook to clean up payments collection after tests in this suite are done
    afterEach(async () => {
      await paymentModel.payment.deleteMany({});
    });

    // Test case for calculating the total payment amount for a course with valid courseId and return the total payment amount
    it("calculate the total payment amount for a course with valid courseId and return the total payment amount", async () => {
      const result = await paymentModel.courseTotalPayment(payment.courseId);
      expect(result).to.equal(payment.paymentAmount * 2);
    });

    // Test case for calculating the total payment amount for a course with courseId not have payments yet and throw an error
    it("calculate the total payment amount for a course with invalid courseId and throw an error", async () => {
      try {
        await paymentModel.courseTotalPayment("5f6e1b9b58fe3208a9b8b55");
      } catch (error) {
        expect(error.message).to.equal("Course have no payments yet");
      }
    });

    // Test case for calculating the total payment amount for a course with valid courseId in a transaction with success transaction
    it("calculate the total payment amount for a course with valid courseId in a transaction with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // calculate the total payment amount for the course in a transaction 
      await paymentModel.courseTotalPayment(payment.courseId, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for calculating the total payment amount for a course with courseId not have payments yet with failed transaction
    it("calculate the total payment amount for a course with invalid courseId with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // calculate the total payment amount for the course in a transaction one with valid courseId
        // and other with courseId not have payments yet
        await paymentModel.courseTotalPayment(payment.courseId, session);
        await paymentModel.courseTotalPayment("5f6e1b9b58fe3208a9b8b55", session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Course have no payments yet");
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the getTotalPaymentForInstuctor method with all scenarios
  describe("Test suite for getTotalPaymentForInstuctor method", () => {
    let coursesIds;

    // before hook to create multiple payments with diffrent coursesIds before all tests start and save the paymentId to array
    beforeEach(async () => {
      const result1 = await paymentModel.createPayment(payment);
      const result2 = await paymentModel.createPayment({ ...payment, courseId: "60f6e1b9b58fe3208a9b8b57" });
      const result3 = await paymentModel.createPayment({ ...payment, courseId: "60f6e1b9b58fe3208a9b8b58" });
      coursesIds = [result1.courseId, result2.courseId, result3.courseId];
    });

    // after hook to clean up payments collection after tests in this suite are done
    afterEach(async () => {
      await paymentModel.payment.deleteMany({});
    });

    // Test case for calculating the total payment amount for an instructor with valid coursesIds and return the total payment amount
    it("calculate the total payment amount for an instructor with valid coursesIds and return the total payment amount", async () => {
      const result = await paymentModel.getTotalPaymentForInstuctor(coursesIds);
      expect(result).to.equal(payment.paymentAmount * 3);
    });

    // Test case for calculating the total payment amount for an instructor with courseId not have payments yet and throw an error
    it("calculate the total payment amount for an instructor with courseId not have payments yet and throw an error", async () => {
      try {
        await paymentModel.getTotalPaymentForInstuctor(["5f6e1b9b58fe3208a9b8b55"]);
      } catch (error) {
        expect(error.message).to.equal("Courses have no payments yet");
      }
    });

    // Test case calculating the total payment amount for an instructor with coursesIds and one in not have payments yet
    it("calculate the total payment amount for an instructor with coursesIds and one in not have payments yet", async () => {
      // Delete the payment with the last courseId
      await paymentModel.payment.deleteOne({ courseId: coursesIds[2] });
      const result = await paymentModel.getTotalPaymentForInstuctor(coursesIds);
      expect(result).to.equal(payment.paymentAmount * 2);
    });

    // Test case for calculating the total payment amount for an instructor with valid coursesIds in a transaction with success transaction
    it("calculate the total payment amount for an instructor with valid coursesIds in a transaction with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // calculate the total payment amount for the instructor in a transaction 
      await paymentModel.getTotalPaymentForInstuctor(coursesIds, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
    });

    // Test case for calculating the total payment amount for an instructor with courseId not have payments yet with failed transaction
    it("calculate the total payment amount for an instructor with invalid coursesIds with failed transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      try {
        // calculate the total payment amount for the instructor in a transaction with invalid coursesIds
        await paymentModel.getTotalPaymentForInstuctor(["5f6e1b9b58fe3208a9b8b55"], session);
        // commit the transaction
        await mongoDB.commitTransaction(session);
      }
      catch (error) {
        expect(error.message).to.equal("Courses have no payments yet");
        // abort the transaction
        await mongoDB.abortTransaction(session);
      }
    });
  });


  // Test suite for the totalPayment method with all scenarios
  describe("Test suite for totalPayment method", () => {

    // before hook to create a new payment before all tests start and save the paymentId
    before(async () => {
      const result = await paymentModel.createPayment(payment);
      paymentId = result._id;
    });

    // after hook to clean up payments collection after tests in this suite are done
    after(async () => {
      await paymentModel.payment.deleteMany({});
    });

    // Test case for calculating the total payment amount for all courses and return the total payment amount
    it("TotalPayment method calculate the total payment amount for all courses and return the total payment amount", async () => {
      const result = await paymentModel.totalPayment();
      expect(result).to.equal(payment.paymentAmount);
    });

    // Test case for calculating the total payment amount for all courses in a transaction with success transaction
    it("calculate the total payment amount for all courses in a transaction with success transaction", async () => {
      // Start a new session
      const session = await mongoDB.startSession();
      // calculate the total payment amount for all courses in a transaction 2 times and create a new payment
      await paymentModel.totalPayment(session);
      await paymentModel.totalPayment(session);
      await paymentModel.createPayment(payment, session);
      // commit the transaction
      await mongoDB.commitTransaction(session);
      // check if the payments are created
      const result = await paymentModel.payment.find({});
      expect(result.length).to.equal(2);
    });

    // Test case for calculating the total payment amount for all of empty payments collection and return 0
    it("calculate the total payment amount for all of empty payments collection and return 0", async () => {
      // Delete all the payments from the database
      await paymentModel.payment.deleteMany({});
      const result = await paymentModel.totalPayment();
      expect(result).to.equal(0);
    });
  });

}).timeout(10000); // Increase the timeout to 10 seconds
