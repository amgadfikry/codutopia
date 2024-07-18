import LessonSchema from "../schemas/lessonSchema.js";

// LessonModel class to interact with the lessons collection in the database
class LessonModel extends LessonSchema {

  constructor() {
    super();
  }

  /* CreateLesson method to create a new lesson in the database
    Parameters:
      - lesson: object with the lesson data
      - session: optional session for the transaction
    Returns:
      - created object data
    Errors:
      - Lesson could not be created
      - Missing required field
      - Other errors
  */
  async createLesson(lesson, session = null) {
    try {
      // Define session in options object if it exists
      const options = session ? { session } : {};
      // Create a new lesson in the database
      const newLesson = await this.lesson.create([lesson], options);
      // if the lesson could not be created, throw an error
      if (!newLesson) {
        throw new Error(`Lesson could not be created`);
      }
      return newLesson[0];
    }
    catch (error) {
      // If the error is a validation error, throw an error with the missing field
      if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        throw new Error(error.message);
      }
    }
  }

  /* GetLesson method to get a lesson from the database
    Parameters:
      - lessonId: ID of the lesson to get
      - session: optional session for the transaction
    Returns:
      - the lesson object
    Errors:
      - Lesson could not be found
  */
  async getLesson(lessonId, session = null) {
    try {
      // Define session in options object if it exists
      const options = session ? { session } : {};
      // Get the lesson from the database
      const result = await this.lesson.findById(lessonId, {}, options);
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found`);
      }
      return result;
    }
    catch (error) {
      throw new Error('Lesson not found');
    }
  }

  /* UpdateLesson method to update a lesson in the database
    Parameters:
      - lessonId: ID of the lesson to update
      - lessonData: object with new lesson data to update
      - session: optional session for the transaction
    Returns:
      - Update lesson object data
    Errors:
      - Lesson not found
  */
  async updateLesson(lessonId, lesson, session = null) {
    try {
      // Define session in options object if it exists
      const options = session ? { session } : {};
      // Update the lesson in the database
      const result = await this.lesson.findByIdAndUpdate(
        lessonId,
        lesson,
        { new: true, ...options }
      );
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found`);
      }
      return result;
    }
    catch (error) {
      throw new Error('Lesson not found');
    }
  }

  /* addQuizToLesson method to add a quiz to a lesson in the database
    Parameters:
      - lessonId: ID of the lesson to update
      - quizId: ID of the quiz to add
      - session: optional session for the transaction
    Returns:
      - message that the quiz is added to the lesson
    Errors:
      - Lesson not found
  */
  async addQuizToLesson(lessonId, quizId, session = null) {
    try {
      // Update the lesson in the database
      const result = await this.lesson.findByIdAndUpdate(
        lessonId,
        { quiz: String(quizId) },
        { new: true, session }
      );
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found`);
      }
      return 'Quiz added to the lesson successfully';
    }
    catch (error) {
      throw new Error('Lesson not found');
    }
  }

  /* removeQuizFromLesson method to remove a quiz from a lesson in the database
    Parameters:
      - lessonId: ID of the lesson to update
      - session: optional session for the transaction
    Returns:
      - message that the quiz is removed from the lesson
    Errors:
      - Lesson not found
  */
  async removeQuizFromLesson(lessonId, session = null) {
    try {
      // Update the lesson in the database
      const result = await this.lesson.findByIdAndUpdate(lessonId, { quiz: null }, { new: true, session });
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found`);
      }
      return 'Quiz removed from the lesson successfully';
    }
    catch (error) {
      throw new Error('Lesson not found');
    }
  }

  /* DeleteLesson method to delete a lesson from the database
    Parameters:
      - lessonId: ID of the lesson to delete
      - session: optional session for the transaction
    Returns:
      - message that the lesson is deleted
    Errors:
      - Lesson not found
  */
  async deleteLesson(lessonId, session = null) {
    try {
      // Define session in options object if it exists
      const options = session ? { session } : {};
      // Delete the lesson from the database
      const result = await this.lesson.findByIdAndDelete(lessonId, options);
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found`);
      }
      return "Lesson deleted successfully";
    }
    catch (error) {
      throw new Error('Lesson not found');
    }
  }
}


export default LessonModel;
