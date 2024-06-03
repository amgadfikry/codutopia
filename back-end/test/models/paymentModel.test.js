import { expect } from "chai";
import { paymentModel } from "../../databases/mongoDB.js";

// Test suite for the paymentModel in the database mongoDB
describe("paymentModel", () => {
  // define the payment and paymentId variables
  let payment;
  let paymentId;

  // Before hook to prepare the data used in the tests
  before(() => {
    // Create a new payment object
    payment = {
      userId: "123",
      courseId: "456",
      paymentMethod: "credit card",
      paymentAmount: 100,
      operationId: "789",
    };
  });

  // After hook to clean up the data used in the tests
  after(async () => {
    // Delete the payments from the database
    await paymentModel.payment.deleteMany({});
  });


  // Test suite for the createPayment method
  describe("createPayment method", () => {
    // Test case for creating a new payment with valid fields
    it("CreatePayment method create a new payment with valid fields", async () => {
      // Create a new payment in the database
      const result = await paymentModel.createPayment(payment);
      // check if the result is not null
      expect(result).to.not.equal(null);
      // save the result to the paymentId variable
      paymentId = result;
    });

    // Test case for creating a new payment with invalid fields not in the schema
    it("CreatePayment method create a new payment with invalid fields not in the schema", async () => {
      try {
        // add invaild field to the payment object
        const tempPayment = { ...payment, invalidField: "invalid" };
        // Create a new payment in the database with invalid field
        await paymentModel.createPayment(tempPayment);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Fields not in schema: invalidField");
      }
    });

    // Test case for creating a new payment with missing required fields
    it("CreatePayment method create a new payment with missing required fields", async () => {
      try {
        // remove required field from the payment object
        const tempPayment = { ...payment };
        delete tempPayment.userId;
        // Create a new payment in the database with missing required field
        await paymentModel.createPayment(tempPayment);
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Missing userId field");
      }
    });

  });


  // Test suite for the getPayment method
  describe("getPayment method", () => {
    // Test case for getting a payment with valid paymentId
    it("GetPayment method get a payment with valid paymentId", async () => {
      // Get the payment from the database
      const result = await paymentModel.getPayment(paymentId);
      // check if the result is not null
      expect(result).to.not.equal(null);
      // check if the result is equal to the payment object
      expect(result.userId).to.equal(payment.userId);
      expect(result.courseId).to.equal(payment.courseId);
      expect(result.paymentMethod).to.equal(payment.paymentMethod);
      expect(result.paymentAmount).to.equal(payment.paymentAmount);
      expect(result.operationId).to.equal(payment.operationId);
      expect(result).to.have.property("createdAt");
      expect(result).to.have.property("updatedAt");
    });

    // Test case for getting a payment with invalid paymentId
    it("GetPayment method get a payment with invalid paymentId", async () => {
      try {
        // Get the payment from the database with invalid paymentId
        await paymentModel.getPayment("invalidId");
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Payment not found");
      }
    });

  });


  // Test suite for the checkPayment method
  describe("checkPayment method", () => {
    // Test case for checking a payment with valid paymentId
    it("CheckPayment method check a payment with valid paymentId", async () => {
      // Check if the payment exists in the database
      const result = await paymentModel.checkPayment(paymentId);
      // check if the result is true
      expect(result).to.equal(true);
    });

    // Test case for checking a payment with invalid paymentId
    it("CheckPayment method check a payment with invalid paymentId", async () => {
      try {
        // Check if the payment exists in the database with invalid paymentId
        await paymentModel.checkPayment("invalidId");
      } catch (error) {
        // check if the error message is correct
        expect(error.message).to.equal("Payment not found");
      }
    });

  });

});
