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
      // Create a new lesson in the database
      const newLesson = await this.lesson.create([lesson], { session });
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
        throw new Error('Lesson could not be created');
      }
    }
  }

  /* addContentToLesson method to add content to a lesson in the database
    Parameters:
      - lessonId: ID of the lesson to update
      - contentId: ID of the content to add
      - session: optional session for the transaction
    Returns:
      - message that the content is added to the lesson
    Errors:
      - Lesson not found
  */
  async addContentToLesson(lessonId, contentId, session = null) {
    try {
      // Update the lesson in the database
      const result = await this.lesson.findByIdAndUpdate(
        lessonId,
        // Add the content to the lesson content array without duplicates
        { $addToSet: { content: contentId } },
        { new: true, session }
      );
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found`);
      }
      return 'Content added to the lesson successfully';
    }
    catch (error) {
      throw new Error('Lesson not found');
    }
  }

  /* removeContentFromLesson method to remove content from a lesson in the database
    Parameters:
      - lessonId: ID of the lesson to update
      - contentId: ID of the content to remove
      - session: optional session for the transaction
    Returns:
      - message that the content is removed from the lesson
    Errors:
      - Lesson not found
  */
  async removeContentFromLesson(lessonId, contentId, session = null) {
    try {
      // Update the lesson in the database
      const result = await this.lesson.findByIdAndUpdate(
        lessonId,
        { $pull: { content: contentId } },
        { new: true, session }
      );
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found`);
      }
      return 'Content removed from the lesson successfully';
    }
    catch (error) {
      throw new Error('Lesson not found');
    }
  }

  /* getLessonWithContent method to get a lesson from the database with content populated
    Parameters:
      - lessonId: ID of the lesson to get
      - session: optional session for the transaction
    Returns:
      - the lesson object
    Errors:
      - Lesson could not be found
  */
  async getLessonWithContent(lessonId, session = null) {
    try {
      // Get the lesson from the database
      const result = await this.lesson.findById(lessonId, {}, { session }).populate('content')
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

  /* getAllLessonsIdsByCourseId method to get all lessons from the database by course ID
    Parameters:
      - courseId: ID of the course to get the lessons
      - session: optional session for the transaction
    Returns:
      - all lessons objects
    Errors:
      - Failed to get lessons
  */
  async getAllLessonsIdsByCourseId(courseId, session = null) {
    try {
      // Get all lessons from the database
      const result = await this.lesson.find({ courseId }, {}, { session });
      // filter the result to get only the lessons ids
      const lessonsIds = result.map(lesson => lesson._id);
      // return the lessons ids
      return lessonsIds;
    } catch (error) {
      throw new Error('Failed to get lessons');
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
      - Missing required field
  */
  async updateLesson(lessonId, lessonData, session = null) {
    try {
      // Update the lesson in the database
      const result = await this.lesson.findByIdAndUpdate(
        lessonId,
        lessonData,
        { new: true, session, runValidators: true }
      );
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Failed to update lesson`);
      }
      return result;
    }
    catch (error) {
      if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else {
        throw new Error('Failed to update lesson');
      }
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
      - lesson deleted object data
    Errors:
      - Lesson not found
  */
  async deleteLesson(lessonId, session = null) {
    try {
      // Delete the lesson from the database
      const result = await this.lesson.findByIdAndDelete(lessonId, { session });
      // if the lesson is not found, throw an error
      if (!result) {
        throw new Error(`Lesson not found or could not be deleted`);
      }
      return result;
    }
    catch (error) {
      throw new Error('Lesson not found or could not be deleted');
    }
  }

  /* deleteAllLessonsBySectionId method to delete all lessons from the database by section ID
    Parameters:
      - sectionId: ID of the section to delete the lessons
      - session: optional session for the transaction
    Returns:
      - message that the lessons are deleted
    Errors:
      - Lessons not found or could not be deleted
  */
  async deleteAllLessonsBySectionId(sectionId, session = null) {
    try {
      // Delete all lessons from the database
      const result = await this.lesson.deleteMany({ sectionId }, { session });
      // return message that the lessons are deleted
      return "Lessons deleted successfully";
    }
    catch (error) {
      throw new Error('Lessons not found or could not be deleted');
    }
  }

  /* deleteAllLessonsByCourseId method to delete all lessons from the database by course ID
    Parameters:
      - courseId: ID of the course to delete the lessons
      - session: optional session for the transaction
    Returns:
      - message that the lessons are deleted
    Errors:
      - Lessons not found or could not be deleted
  */
  async deleteAllLessonsByCourseId(courseId, session = null) {
    try {
      // Delete all lessons from the database
      const result = await this.lesson.deleteMany({ courseId }, { session });
      // return message that the lessons are deleted
      return "Lessons deleted successfully";
    } catch (error) {
      throw new Error('Lessons not found or could not be deleted');
    }
  }

}


export default LessonModel;
