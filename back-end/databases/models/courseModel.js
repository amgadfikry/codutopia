// import courseSchema
import CourseSchema from "../schemas/courseSchema.js";

// Create a new class for the course model with the course schema class
class CourseModel extends CourseSchema {

  constructor() {
    super();
  }

  /* CreateCourse method to create a new course
    Parameters:
      - courseData: object with course data
      - session: optional session for the transaction
    Returns:
      - course data object
    Errors:
      - Course could not be created
      - Missing required field
      - Other errors
  */
  async createCourse(courseData, session = null) {
    try {
      // define session in options object if it exists
      const options = session ? { session } : {};
      // create a new course with the course data
      const newCourse = await this.course.create([courseData], options);
      return newCourse[0];
    }
    catch (error) {
      //if the error is a validation error and throw an error with the missing field
      if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        // throw an error with the error message if not a validation error
        throw error;
      }
    }
  }

}

// Export the CourseModel class
export default CourseModel;
