import LessonContentSchema from '../schemas/lessonContentSchema.js';

// LessonContentModel class to interact with the lessonContents collection in the database
class LessonContentModel extends LessonContentSchema {

  constructor() {
    super();
  }

  /* CreateLessonContent method to create a new lesson content in the database
    Parameters:
      - lessonContentData: object with the lesson content data
      - session: optional session for the transaction
    Returns:
      - created object data
    Errors:
      - Lesson content could not be created
      - Missing required field
      - Other errors
  */
  async createLessonContent(lessonContentData, session = null) {
    try {
      // Create a new lesson content in the database
      const newLessonContent = await this.lessonContent.create([lessonContentData], { session });
      // if the lesson content could not be created, throw an error
      if (!newLessonContent) {
        throw new Error(`Lesson content could not be created`);
      }
      return newLessonContent[0];
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

  /* GetLessonContent method to get a lesson content from the database
    Parameters:
      - lessonContentId: ID of the lesson content to get
      - session: optional session for the transaction
    Returns:
      - the lesson content object
    Errors:
      - Lesson content could not be found
  */
  async getLessonContent(lessonContentId, session = null) {
    try {
      // Get the lesson content from the database
      const result = await this.lessonContent.findById(lessonContentId, {}, { session });
      // if the lesson content is not found, throw an error
      if (!result) {
        throw new Error(`LessonContent not found`);
      }
      return result;
    }
    catch (error) {
      throw new Error('LessonContent not found');
    }
  }

  /* getLessonContentByIdsList method to get a list of lesson contents from the database
    Parameters:
      - lessonContentIds: list of lesson content IDs to get
      - session: optional session for the transaction
    Returns:
      - the list of lesson content objects
    Errors:
      - Lesson content could not be found
  */
  async getLessonContentByIdsList(lessonContentIds, session = null) {
    try {
      // Get the lesson content from the database
      const result = await this.lessonContent.find({ _id: { $in: lessonContentIds } }, {}, { session });
      // if the lesson content is not found, throw an error
      if (result.length === 0) {
        throw new Error('No lesson content found');
      }
      return result;
    }
    catch (error) {
      if (error.message === 'No lesson content found') {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to get lesson Content');
      }
    }
  }

  /* getLessonContentByLessonId method to get a list of lesson contents from the database
    Parameters:
      - lessonId: ID of the lesson to get the lesson contents
      - session: optional session for the transaction
    Returns:
      - the list of lesson content objects
    Errors:
      - Lesson content could not be found
  */
  async getLessonContentByLessonId(lessonId, session = null) {
    try {
      // Get the lesson content from the database
      const result = await this.lessonContent.find({ lessonId }, {}, { session });
      // if the lesson content is not found, throw an error
      if (result.length === 0) {
        throw new Error('Lesson has no content');
      }
      return result;
    }
    catch (error) {
      if (error.message === 'Lesson has no content') {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to get lesson Content');
      }
    }
  }

  /* updateLessonContent method to update a lesson content in the database
    Parameters:
      - lessonContentId: ID of the lesson content to update
      - lessonContentData: object with the lesson content data
      - session: optional session for the transaction
    Returns:
      - updated object data
    Errors:
      - Lesson content could not be updated
      - Missing required field
      - Other errors
  */
  async updateLessonContent(lessonContentId, lessonContentData, session = null) {
    try {
      // Update the lesson content in the database
      const updatedLessonContent = await this.lessonContent.findByIdAndUpdate(
        lessonContentId,
        lessonContentData,
        { session, new: true, runValidators: true }
      );
      // if the lesson content could not be updated, throw an error
      if (!updatedLessonContent) {
        throw new Error(`Failed to update lesson content`);
      }
      return updatedLessonContent;
    }
    catch (error) {
      // If the error is a validation error, throw an error with the missing field
      if (error.name === 'ValidationError') {
        throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
      } else if (error.message === 'Failed to update lesson content') {
        throw new Error(error.message);
      } else {
        throw new Error('Could not found lessonContent');
      }
    }
  }

  /* deleteLessonContent method to delete a lesson content from the database
    Parameters:
      - lessonContentId: ID of the lesson content to delete
      - session: optional session for the transaction
    Returns:
      - deleted object data
    Errors:
      - Failed to delete or not found lesson content
  */
  async deleteLessonContent(lessonContentId, session = null) {
    try {
      // Delete the lesson content from the database and return deleted object
      const result = await this.lessonContent.findByIdAndDelete(lessonContentId, { session });
      // if the lesson content could not be deleted, throw an error
      if (!result) {
        throw new Error(`Failed to delete or not found lesson content`);
      }
      return result;
    }
    catch (error) {
      throw new Error('Failed to delete or not found lesson content');
    }
  }

  /* deleteLessonContentByLessonId method to delete a lesson content from the database
    Parameters:
      - lessonId: ID of the lesson to delete the lesson contents
      - session: optional session for the transaction
    Returns:
      - Message of Lesson contents deleted successfully
    Errors:
      - Failed to delete or not found lesson content
  */
  async deleteLessonContentByLessonId(lessonId, session = null) {
    try {
      // Delete the lesson content from the database
      const result = await this.lessonContent.deleteMany({ lessonId }, { session });
      // if the lesson content could not be deleted, throw an error
      if (result.deletedCount === 0) {
        throw new Error(`Failed to delete or not found lesson content`);
      }
      return 'Lesson contents deleted successfully';
    }
    catch (error) {
      throw new Error('Failed to delete or not found lesson content');
    }
  }

  /* deleteLessonContentByLessonsIdsList method to delete a list of lesson contents from the database by lesson IDs
    Parameters:
      - lessonsIds: list of lesson IDs to delete the lesson contents
      - session: optional session for the transaction
    Returns:
      - Message of Lesson contents deleted successfully
    Errors:
      - Failed to delete or not found lesson content
  */
  async deleteLessonContentByLessonsIdsList(lessonsIds, session = null) {
    try {
      // Delete the lesson content from the database
      const result = await this.lessonContent.deleteMany({ lessonId: { $in: lessonsIds } }, { session });
      // if the lesson content could not be deleted, throw an error
      if (result.deletedCount === 0) {
        throw new Error(`Failed to delete or not found lesson content`);
      }
      return 'Lesson contents deleted successfully';
    }
    catch (error) {
      throw new Error('Failed to delete or not found lesson content');
    }
  }
}

export default LessonContentModel;
