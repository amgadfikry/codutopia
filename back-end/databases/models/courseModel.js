// import courseSchema
import CourseSchema from "../schemas/courseSchema.js";

// CourseModel class to interact with the courses collection in the database
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
      // create a new course with the course data
      const newCourse = await this.course.create([courseData], { session });
      // check if the course could not be created and throw an error
      if (!newCourse) {
        throw new Error(`Course could not be created`);
      }
      return newCourse[0];
    }
    catch (error) {
      // check if the error is a validation error for the tags field and throw an error with the message
      if (error.message.includes('Tags field')) {
        throw new Error(error.message.split(': ')[2]);
      }
      //if the error is a validation error and throw an error with the missing field
      else if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        throw error;
      }
    }
  }

  /* GetCourse method to get a course by id
    Parameters:
      - courseId: string with course id
      - session: optional session for the transaction
    Returns:
      - course data object
    Errors:
      - Course not found
      - Other errors
  */
  async getCourse(courseId, session = null) {
    try {
      // find the course by id
      const course = await this.course.findById(courseId, {}, { session });
      // check if the course is not found and throw an error
      if (!course) {
        throw new Error(`Course not found`);
      }
      return course;
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* getAllCoursesPagination method to get all courses with pagination and offset
    Parameters:
      - page: number with the page number and default to 1
      - limit: number with the number of courses per page and default to 10
    Returns:
      - array of course data objects
    Errors:
      - Failed to get courses
  */
  async getAllCoursesPagination(page = 1, limit = 10, session = null) {
    try {
      // find all courses with pagination and offset
      const courses = await this.course.find({}, {}, { skip: (page - 1) * limit, limit: limit, session });
      return courses;
    }
    catch (error) {
      throw new Error(`Failed to get courses`);
    }
  }

  /* getCoursesByListOfIds method to get courses by a list of ids
    Parameters:
      - courseIds: array of strings with course ids
    Returns:
      - array of course data objects
    Errors:
      - Failed to get courses
  */
  async getCoursesByListOfIds(courseIds, session = null) {
    try {
      // find courses by list of ids
      const courses = await this.course.find({ _id: { $in: courseIds } }, {}, { session });
      return courses;
    }
    catch (error) {
      throw new Error(`Failed to get courses`);
    }
  }

  /* filterCourses method to filter courses by query filters and pagination
    Parameters:
      - query: object with query filters
      - tags: array of strings with tags or default to empty array
      - sortField: string with sort field or default to 'createdAt'
      - order: number with sort order or default to -1 [ for descending use -1, for ascending use 1]
      - page: number with the page number or default to 1
      - limit: number with the number of courses per page or default to 10
    Returns:
      - array of course data objects
    Errors:
      - Failed to filter courses
  */
  async filterCourses(query, tags = [], sortField = 'createdAt', order = -1, page = 1, limit = 10, session = null) {
    try {
      // create a filter object with the query filters
      const filter = { ...query };
      // check if query contain title field and add regex search for title
      if (query.title) {
        filter.title = { $regex: query.title, $options: 'i' };
      }
      // check if query contain price field and add price from 0 to the price value
      if (query.price) {
        filter.price = { $lte: query.price };
      }
      // add tags filter if tags array is not empty
      if (tags.length > 0) {
        filter.tags = { $all: tags };
      }
      // claculate skip value for pagination
      const skip = (page - 1) * limit;
      // find courses with the filter, sort, pagination, and offset
      const courses = await this.course.find(filter, {},
        {
          sort: { [sortField]: order },
          skip,
          limit,
          session
        });
      return courses;
    }
    catch (error) {
      throw new Error(`Failed to filter courses`);
    }
  }

  /* updateCourse method to update a course by id
    Parameters:
      - courseId: string with course id
      - courseData: object with course data to update
      - session: optional session for the transaction
    Returns:
      - message with success 'Course updated successfully'
    Errors:
      - Course not found
      - Other errors
      - Missing required field
  */
  async updateCourse(courseId, courseData, session = null) {
    try {
      // find the course by id and update it
      const updatedCourse = await this.course.findByIdAndUpdate(courseId, courseData, { new: true, session, runValidators: true });
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Course updated successfully';
    }
    catch (error) {
      // check if the error is a validation error for the tags field and throw an error with the message
      if (error.message.includes('Tags field')) {
        throw new Error(error.message.split(': ')[2]);
      } else if (error.name === 'ValidationError') {
        //if the error is a validation error and throw an error with the missing field
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      }
      else {
        throw error;
      }
    }
  }

  /* addLessonToCourse method to add a lesson to a course
    Parameters:
      - courseId: string or object id with course id
      - lessonId: string or object id with lesson id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Lesson added to course successfully'
    Errors:
      - Course not found
      - Other errors
  */
  async addLessonToCourse(courseId, lessonId, session = null) {
    try {
      // find the course by id and add the lesson to the lessons array
      const updatedCourse = await this.course.findByIdAndUpdate(courseId, { $push: { lessons: String(lessonId) } }, { session });
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Lesson added to course successfully';
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* removeLessonFromCourse method to remove a lesson from a course
    Parameters:
      - courseId: string or object id with course id
      - lessonId: string or object id with lesson id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Lesson removed from course successfully'
    Errors:
      - Course not found
      - Other errors
  */
  async removeLessonFromCourse(courseId, lessonId, session = null) {
    try {
      // find the course by id and remove the lesson from the lessons array
      const updatedCourse = await this.course.findByIdAndUpdate(courseId, { $pull: { lessons: String(lessonId) } }, { session });
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Lesson removed from course successfully';
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* deleteCourse method to remove a course by id
    Parameters:
      - courseId: string with course id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Course deleted successfully'
    Errors:
      - Course not found
      - Other errors
  */
  async deleteCourse(courseId, session = null) {
    try {
      // find the course by id and remove it
      const deletedCourse = await this.course.findByIdAndDelete(courseId, { session });
      // check if the course is not found and throw an error
      if (!deletedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Course deleted successfully';
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* deleteAllCoursesByAuthorId method to remove all courses by author id
    Parameters:
      - authorId: string with author id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Courses deleted successfully'
    Errors:
      - Failed to delete courses
  */
  async deleteAllCoursesByAuthorId(authorId, session = null) {
    try {
      // find the course by authorId and remove it
      await this.course.deleteMany({ authorId }, { session });
      return 'Courses deleted successfully';
    }
    catch (error) {
      throw new Error('Failed to delete courses');
    }
  }

  /* addNewStudentToCourse method to add a new student to a course
    Parameters:
      - courseId: string or object id with course id
      - studentId: string or object id with student id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Student added to course successfully'
    Errors:
      - Course not found
      - Other errors
  */
  async addNewStudentToCourse(courseId, studentId, session = null) {
    try {
      // find the course by id and add the student to the students array
      const updatedCourse = await this.course.findByIdAndUpdate(courseId, { $push: { students: String(studentId) } }, { session });
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Student added to course successfully';
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* removeStudentFromCourse method to remove a student from a course
    Parameters:
      - courseId: string or object id with course id
      - studentId: string or object id with student id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Student removed from course successfully'
    Errors:
      - Course not found
      - Other errors
  */
  async removeStudentFromCourse(courseId, studentId, session = null) {
    try {
      // find the course by id and remove the student from the students array
      const updatedCourse = await this.course.findByIdAndUpdate(courseId, { $pull: { students: String(studentId) } }, { session });
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Student removed from course successfully';
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* addReviewToCourse method to add a review to a course
    Parameters:
      - courseId: string or object id with course id
      - reviewId: string or object id with review id
      - rating: number with review rating
      - session: optional session for the transaction
    Returns:
      - Message with success 'Review added to course successfully'
    Errors:
      - Course not found
      - Other errors
  */
  async addReviewToCourse(courseId, reviewId, rating, session = null) {
    try {
      // find the course by id and add the review to the reviews array and add the rating to total sum of reviews
      const updatedCourse = await this.course.findByIdAndUpdate(
        courseId,
        {
          $push: { reviews: String(reviewId) },
          $inc: { sumReviews: rating }
        },
        { session, new: true }
      );
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Review added to course successfully';
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* removeReviewFromCourse method to remove a review from a course
    Parameters:
      - courseId: string or object id with course id
      - reviewId: string or object id with review id
      - rating: number with review rating
      - session: optional session for the transaction
    Returns:
      - Message with success 'Review removed from course successfully'
    Errors:
      - Course not found
      - Other errors
  */
  async removeReviewFromCourse(courseId, reviewId, rating, session = null) {
    try {
      // check if course is found by id
      const course = await this.course.findOne({ _id: courseId }, {}, { session });
      if (!course) {
        throw new Error(`Course not found`);
      }
      // check if review is found in the reviews array of the course
      const reviewIndex = course.reviews.findIndex(review => review.toString() === reviewId);
      if (reviewIndex === -1) {
        throw new Error(`Review not found in course`);
      }
      // find the course by id and remove the review from the reviews array and remove the rating from total sum of reviews
      const updatedCourse = await this.course.findByIdAndUpdate(
        courseId,
        {
          $pull: { reviews: String(reviewId) },
          $inc: { sumReviews: -rating }
        },
        { session, new: true }
      );
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return 'Review removed from course successfully';
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}

// Export the CourseModel class
export default CourseModel;
