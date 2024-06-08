import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for payment schema with pre and post hooks
class PaymentSchema {

  constructor() {
    // Define the schema of the payments collection
    this.paymentSchema = new Schema({
      userId: { type: String, ref: 'users', required: true, },
      courseId: { type: String, ref: 'courses', required: true, },
      paymentMethod: { type: String, required: true, },
      paymentAmount: { type: Number, required: true, },
      operationId: { type: String, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the payments collection with the payment schema
    this.payment = mongoose.model('payments', this.paymentSchema);
  }
}


export default PaymentSchema;
