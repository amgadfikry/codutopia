import mongoose from "mongoose";
// Save schema class from mongoose to a variable
const Schema = mongoose.Schema;

// Abstract class for payment schema with pre and post hooks
class PaymentSchema {

  constructor() {
    // Create a new schema for the payments collection
    this.paymentSchema = new Schema({
      // userId: string value that represents the user id
      userId: { type: String, ref: 'users', required: true, },
      // courseId: string value that represents the course id
      courseId: { type: String, ref: 'courses', required: true, },
      // paymentMethod: string value that represents the payment method
      paymentMethod: { type: String, required: true, },
      // paymentAmount: number value that represents the payment amount
      paymentAmount: { type: Number, required: true, },
      // operationId: string value that represents the id of operation
      operationId: { type: String, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the payments collection with the payment schema
    this.payment = mongoose.model('payments', this.paymentSchema);
  }
}

// Export the PaymentSchema class
export default PaymentSchema;
