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
      // create object of course metadata to use it in the update operation
      const courseMetadata = {
        title: courseData.title,
        description: courseData.description,
        tags: courseData.tags,
        price: courseData.price,
        discount: courseData.discount,
        image: courseData.image
      };
      // find the course by id and update it
      const updatedCourse = await this.course.findByIdAndUpdate(
        courseId,
        courseMetadata,
        { new: true, session, runValidators: true }
      );
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
        throw new Error(error.message);
      }
    }
  }

  /* addSectionToCourse method to add a section to a course
    Parameters:
      - courseId: string or object id with course id
      - sectionData: object with section data
      - session: optional session for the transaction
    Returns:
      - created section object
    Errors:
      - Course not found
      - Other errors
  */
  async addSectionToCourse(courseId, sectionData, session = null) {
    try {
      // find the course by id and add a new section to the sections array
      const updatedCourse = await this.course.findByIdAndUpdate(
        courseId,
        { $addToSet: { sections: sectionData } },
        { session, runValidators: true, new: true }
      );
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found`);
      }
      return updatedCourse.sections.pop();
    }
    catch (error) {
      if (error.name === 'ValidationError') {
        throw new Error(`Missing title field`);
      }
      throw new Error('Course not found');
    }
  }

  /* getSectionWithLessonsData method to get a section with lessons data details
    Parameters:
      - courseId: string or object id with course id
      - sectionId: string or object id with section id
    Returns:
      - section data object with lessons data
    Errors:
      - Course or section not found
      - Other errors
  */
  async getSectionWithLessonsData(courseId, sectionId, session = null) {
    try {
      // find the course by id and section field and get the section data with lessons data
      const course = await this.course.findOne(
        { _id: courseId, 'sections._id': sectionId },
        { 'sections.$': 1 },
        { session }
      ).populate('sections.lessons');
      // check if the course is not found and throw an error
      if (!course) {
        throw new Error(`Course or section not found`);
      }
      return course.sections[0];
    }
    catch (error) {
      throw new Error('Course or section not found');
    }
  }

  /* getAllSectionsWithLessonsData method to get all sections with lessons data details
    Parameters:
      - courseId: string or object id with course id
    Returns:
      - array of section data objects with lessons data
    Errors:
      - Course not found
      - Other errors
  */
  async getAllSectionsWithLessonsData(courseId, session = null) {
    try {
      // find the course by id and get all sections data with lessons data
      const course = await this.course.findById(courseId, {}, { session }).populate('sections.lessons');
      // check if the course is not found and throw an error
      if (!course) {
        throw new Error(`Course not found`);
      }
      return course.sections;
    }
    catch (error) {
      throw new Error('Course not found');
    }
  }

  /* updateSection method to update a section data in a course
    Parameters:
      - courseId: string or object id with course id
      - sectionId: string or object id with section id
      - sectionData: object with section data
      - session: optional session for the transaction
    Returns:
      - Message with success 'Section updated successfully'
    Errors:
      - Course or section not found
      - Other errors
  */
  async updateSection(courseId, sectionId, sectionData, session = null) {
    try {
      // find the course by id and section field and update the section data title and description and lessons remain the same
      const updatedCourse = await this.course.findOneAndUpdate(
        { _id: courseId, 'sections._id': sectionId },
        { $set: { 'sections.$.title': sectionData.title, 'sections.$.description': sectionData.description } },
        { session, runValidators: true }
      );
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course or section not found`);
      }
      return 'Section updated successfully';
    }
    catch (error) {
      if (error.name === 'ValidationError') {
        throw new Error(`Missing title field`);
      }
      throw new Error('Course or section not found');
    }
  }

  /* removeSectionFromCourse method to remove a section from a course
    Parameters:
      - courseId: string or object id with course id
      - sectionId: string or object id with section id
      - session: optional session for the transaction
    Returns:
      - deleted section object
    Errors:
      - Course or section not found
      - Other errors
  */
  async removeSectionFromCourse(courseId, sectionId, session = null) {
    try {
      // find the course by id and remove the section from the sections array
      const updatedCourse = await this.course.findByIdAndUpdate(
        courseId,
        { $pull: { sections: { _id: sectionId } } },
        { session }
      );
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course or section not found`);
      }
      // return deleted section object
      return updatedCourse.sections.filter(section => String(section._id) === String(sectionId))[0];
    }
    catch (error) {
      throw new Error('Course or section not found');
    }
  }

  /* addLessonToSection method to add a lesson to a course
    Parameters:
      - courseId: string or object id with course id
      - lessonId: string or object id with lesson id
      - sectionId: string or object id with section id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Lesson added to course successfully'
    Errors:
      - Course not found or section not found
      - Other errors
  */
  async addLessonToSection(courseId, sectionId, lessonId, session = null) {
    try {
      // find the course by id and section field and add the lesson to the lessons array
      const updatedCourse = await this.course.findOneAndUpdate(
        { _id: courseId, 'sections._id': sectionId },
        { $addToSet: { 'sections.$.lessons': String(lessonId) } },
        { session }
      );
      // check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found or section not found`);
      }
      return 'Lesson added to course successfully';
    }
    catch (error) {
      throw new Error('Course not found or section not found');
    }
  }

  /* removeLessonFromSection method to remove a lesson from a course
    Parameters:
      - courseId: string or object id with course id
      - lessonId: string or object id with lesson id
      - sectionId: string or object id with section id
      - session: optional session for the transaction
    Returns:
      - Message with success 'Lesson removed from course successfully'
    Errors:
      - Course not found or section not found
      - Other errors
  */
  async removeLessonFromSection(courseId, sectionId, lessonId, session = null) {
    try {
      // Find the course by id and section subdocument, then remove the lesson from the lessons array
      const updatedCourse = await this.course.findOneAndUpdate(
        { _id: courseId, 'sections._id': sectionId },
        { $pull: { 'sections.$.lessons': String(lessonId) } },
        { session, new: true }
      );
      // Check if the course is not found and throw an error
      if (!updatedCourse) {
        throw new Error(`Course not found or section not found`);
      }
      return 'Lesson removed from course successfully';
    } catch (error) {
      throw new Error('Course not found or section not found');
    }
  }

  /* deleteCourse method to remove a course by id
    Parameters:
      - courseId: string with course id
      - session: optional session for the transaction
    Returns:
      - deleted object
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
      return deletedCourse;
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
      - message with success 'All courses deleted successfully'
    Errors:
      - Failed to delete courses
      - User has no courses
  */
  async deleteAllCoursesByAuthorId(authorId, session = null) {
    try {
      // find the course by authorId and remove it
      const deletedCourses = await this.course.deleteMany({ authorId }, { session });
      if (deletedCourses.deletedCount === 0) {
        throw new Error(`User has no courses`);
      }
      return 'All courses deleted successfully';
    }
    catch (error) {
      if (error.message === 'User has no courses') {
        throw new Error(error.message);
      }
      throw new Error(`Failed to delete courses`);
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
      const updatedCourse = await this.course.findByIdAndUpdate(
        courseId,
        { $push: { students: String(studentId) } },
        { session }
      );
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
      const updatedCourse = await this.course.findByIdAndUpdate(
        courseId,
        { $pull: { students: String(studentId) } },
        { session }
      );
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
      throw new Error('Course not found');
    }
  }
}

// Export the CourseModel class
export default CourseModel;
