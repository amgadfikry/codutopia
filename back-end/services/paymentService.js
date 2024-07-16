import { paymentModel } from '../databases/mongoDB.js';


/* getPaymentDetails function to get the payment details from the database
  Parameters:
    - paymentId: the id of the payment document in the database
  Return:
    - Payment document data
  Errors:
    - Payment not found
  */
export async function getPaymentDetails(paymentId) {
  try {
    // get the payment document from the database
    const payment = await paymentModel.getPayment(paymentId);
    // return the payment document
    return payment;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* getPaymentHistoryForUser function to get the payment history for a specific user from the database
  Parameters:
    - userId: the id of the user document in the database
  Return:
    - Array of payment documents data
  Errors:
    - User have no payments yet
  */
export async function getPaymentHistoryForUser(userId) {
  try {
    // get the payment history for the user from the database
    const payments = await paymentModel.getAllPaymentsByUser(userId);
    // return the payment history
    return payments;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* getCourseTotalRevenue function to get the total revenue of a course from the database
  Parameters:
    - courseId: the id of the course document in the database
  Return:
    - Total revenue of the course
  Errors:
    - Course not found
  */
export async function getCourseTotalRevenue(courseId) {
  try {
    // get the total revenue of the course from the database
    const totalRevenue = await paymentModel.courseTotalPayment(courseId);
    // return the total revenue
    return totalRevenue;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* getInstructorTotalRevenue function to get the total revenue of an instructor from the database
  Parameters:
    - coursesIds: an array of course ids that the instructor teaches
  Return:
    - Total revenue of the instructor
  Errors:
    - Courses have no payments yet
  */
export async function getInstructorTotalRevenue(coursesIds) {
  try {
    // get the total revenue of the instructor from the database
    const totalRevenue = await paymentModel.getTotalPaymentForInstuctor(coursesIds);
    // return the total revenue
    return totalRevenue;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* getTotalRevenue function to get the total revenue of all courses from the database
  Return:
    - Total revenue of all courses
  Errors:
    - Failed to get total revenue
  */
export async function getTotalRevenue() {
  try {
    // get the total revenue of all courses from the database
    const totalRevenue = await paymentModel.totalPayment();
    // return the total revenue
    return totalRevenue;
  } catch (error) {
    throw new Error('Failed to get total revenue');
  }
}


