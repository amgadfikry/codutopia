// Import schema of the paymentSchema
import PaymentSchema from "../schemas/paymentSchema.js";

// PaymentModel class to interact with the payments collection in the database
class PaymentModel extends PaymentSchema {
  constructor() {
    // Call the parent class constructor
    super();
  }

  /* CreatePayment method to create a new payment in the database
    Parameters:
      - payment: object with the payment data
    Returns:
      - the ID of the new payment
      - error if the payment could not be created with specific message
  */
  async createPayment(payment) {
    // check if payment object is contain invalid fields
    const invalidFields = Object.keys(payment).filter(key => !Object.keys(this.paymentSchema.obj).includes(key));
    // throw an error if the payment object contain invalid fields
    if (invalidFields.length > 0) {
      throw new Error(`Fields not in schema: ${invalidFields.join(', ')}`);
    }

    try {
      // Create a new payment in the database
      const newPayment = await this.payment.create(payment);
      // Return the ID of the new payment
      return newPayment._id;
    } catch (error) {
      // throw an error if the payment could not be created
      throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
    }
  }

  /* GetPayment method to get a payment from the database
    Parameters:
      - paymentId: string value that represents the payment id
    Returns:
      - the payment object
      - error if the payment could not be found with specific message
  */
  async getPayment(paymentId) {
    try {
      // Get the payment from the database
      const result = await this.payment.findById(paymentId);
      // Return the result object
      return result;
    } catch (error) {
      // throw an error if the payment could not be found
      throw new Error(`Payment not found`);
    }
  }

  /* CheckPayment method to check if a payment exists in the database
    Parameters:
      - paymentId: string value that represents the payment id
    Returns:
      - true if the payment exists
      - error if the payment does not exist with specific message
  */
  async checkPayment(paymentId) {
    try {
      // Get the payment from the database
      const result = await this.payment.findById(paymentId);
      // Return true if the payment exists
      return true;
    }
    catch (error) {
      // throw an error if the payment does not exist
      throw new Error(`Payment not found`);
    }
  }

  /* CourseTotalPayment method calculate the total payment amount for specific course
    Parameters:
      - courseId: string value that represents the course id
    Returns:
      - the total payment amount for the course
      - error if not course found with specific message
  */
  async courseTotalPayment(courseId) {
    try {
      // Get the total payment amount for the course
      const totalPayment = await this.payment.aggregate([
        { $match: { courseId: courseId } },
        { $group: { _id: null, total: { $sum: "$paymentAmount" } } }
      ]);
      // Return the total payment amount
      return totalPayment[0].total;
    } catch (error) {
      // throw an error if the course does not exist
      throw new Error(`Course not found`);
    }
  }

  /* TotalPayment method calculate the total payment amount for all courses
    Parameters:
      - None
    Returns:
      - the total payment amount for all courses
  */
  async totalPayment() {
    // Get the total payment amount for all courses
    const totalPayment = await this.payment.aggregate([
      { $group: { _id: null, total: { $sum: "$paymentAmount" } } }
    ]);
    // Return the total payment amount
    return totalPayment[0].total;
  }
}

// Export the PaymentModel class
export default PaymentModel;
