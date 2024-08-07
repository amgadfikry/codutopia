// Import schema of the paymentSchema
import PaymentSchema from "../schemas/paymentSchema.js";

// PaymentModel class to interact with the payments collection in the database
class PaymentModel extends PaymentSchema {

  constructor() {
    super();
  }

  /* CreatePayment method to create a new payment in the database
    Parameters:
      - payment: object with the payment data
      - session: optional session for the transaction
    Returns:
      - Payment object data of the created payment
    Errors:
      - Payment could not be created
      - Missing required field
      - Other errors
  */
  async createPayment(payment, session = null) {
    try {
      // Define session in options object if it exists
      const options = session ? { session } : {};
      // Create a new payment in the database
      const newPayment = await this.payment.create([payment], options);
      // if the payment could not be created, throw an error
      if (!newPayment) {
        throw new Error(`Payment could not be created`);
      }
      return newPayment[0];
    }
    catch (error) {
      // If the error is a validation error, throw an error with the missing field
      if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        throw error;
      }
    }
  }

  /* GetPayment method to get a payment from the database
    Parameters:
      - paymentId: string value that represents the payment id
      - session: optional session for the transaction
    Returns:
      - payment object data
    Errors:
      - Payment not found
  */
  async getPayment(paymentId, session = null) {
    try {
      // Define session in options object if it exists
      const options = session ? { session } : {};
      // Get the payment from the database
      const result = await this.payment.findById(paymentId, {}, options);
      // if the payment is not found, throw an error
      if (!result) {
        throw new Error(`Payment not found`);
      }
      return result;
    }
    catch (error) {
      throw new Error(`Payment not found`);
    }
  }

  /* CheckPayment method to check if a payment exists in the database
    Parameters:
      - paymentId: string value that represents the payment id
      - session: optional session for the transaction
    Returns:
      - true if the payment exists
      - false if the payment does not exist
  */
  async checkPayment(paymentId, session = null) {
    try {
      // Define session in options object if it exists
      const options = session ? { session } : {};
      // Get the payment from the database
      const result = await this.payment.findById(paymentId, {}, options);
      if (!result) {
        return false;
      }
      return true;
    }
    catch (error) {
      return false;
    }
  }

  /* getAllPaymentsByUser method to get all payments for a specific user
    Parameters:
      - userId: string value that represents the user id
      - session: optional session for the transaction
    Returns:
      - array of payment objects data
    Errors:
      - User have no payments yet
  */
  async getAllPaymentsByUser(userId, session = null) {
    try {
      // Get all payments for the user
      const payments = await this.payment.find({ userId: userId }, {}, { session });
      // if the user does not have payments, throw an error
      if (payments.length === 0) {
        throw new Error(`User have no payments yet`);
      }
      return payments;
    }
    catch (error) {
      throw new Error(`User have no payments yet`);
    }
  }

  /* CourseTotalPayment method calculate the total payment amount for specific course
    Parameters:
      - courseId: string value that represents the course id
      - session: optional session for the transaction
    Returns:
      - the total payment amount for the course
    Errors:
      - Course have no payments yet
  */
  async courseTotalPayment(courseId, session = null) {
    try {
      // Get the total payment amount for the course
      const totalPayment = await this.payment.aggregate([
        { $match: { courseId: courseId } },
        { $group: { _id: null, total: { $sum: "$paymentAmount" } } }
      ]).session(session);
      // if the course does not exist, throw an error
      if (totalPayment.length === 0) {
        throw new Error(`Course have no payments yet`);
      }
      return totalPayment[0].total;
    }
    catch (error) {
      // throw an error if the course does not exist
      throw new Error(`Course have no payments yet`);
    }
  }

  /* getTotalPaymentForInstuctor method calculate the total payment amount for specific instructor
    Parameters:
      - coursesIds: array of string values that represents the course ids
      - session: optional session for the transaction
    Returns:
      - the total payment amount for the instructor courses
    Errors:
      - Courses have no payments yet
  */
  async getTotalPaymentForInstuctor(coursesIds, session = null) {
    try {
      // Get the total payment amount for the instructor
      const totalPayment = await this.payment.aggregate([
        { $match: { courseId: { $in: coursesIds } } },
        { $group: { _id: null, total: { $sum: "$paymentAmount" } } }
      ]).session(session);
      // if the instructor does not exist, throw an error
      if (totalPayment.length === 0) {
        throw new Error('Courses have no payments yet');
      }
      return totalPayment[0].total;
    }
    catch (error) {
      throw new Error('Courses have no payments yet');
    }
  }

  /* TotalPayment method calculate the total payment amount for all courses
    Parameters:
      - session: optional session for the transaction
    Returns:
      - the total payment amount for all courses
  */
  async totalPayment(session = null) {
    // Get the total payment amount for all courses
    const totalPayment = await this.payment.aggregate([
      { $group: { _id: null, total: { $sum: "$paymentAmount" } } }
    ]).session(session);
    // if there are no payments, return 0
    if (totalPayment.length === 0) {
      return 0;
    }
    return totalPayment[0].total;
  }
}

export default PaymentModel;
