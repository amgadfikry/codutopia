// Import schema of the lessonSchema
import LessonSchema from "../schemas/lessonSchema.js";

// LessonModel class to interact with the lessons collection in the database
class LessonModel extends LessonSchema {
  constructor() {
    // Call the parent class constructor which initializes the lesson schema and model
    super();
  }

  /* CreateLesson method to create a new lesson in the database
    Parameters:
      - lesson: object with the lesson data
    Returns:
      - the ID of the new lesson
      - error if the lesson could not be created with specific message
  */
  async createLesson(lesson) {
    // check if lesson object is contain invalid fields
    const invalidFields = Object.keys(lesson).filter(key => !Object.keys(this.lessonSchema.obj).includes(key));
    // throw an error if the lesson object contain invalid fields
    if (invalidFields.length > 0) {
      throw new Error(`Fields not in schema: ${invalidFields.join(', ')}`);
    }

    try {
      // Create a new lesson in the database
      const newLesson = await this.lesson.create(lesson);
      // Return the ID of the new lesson
      return newLesson._id;
    } catch (error) {
      // throw an error if the lesson could not be created
      throw new Error(`Missing ${Object.keys(error.errors)[0]} field`);
    }
  }

  /* GetLesson method to get a lesson from the database
    Parameters:
      - lessonId: ID of the lesson to get
    Returns:
      - the lesson object
      - error if the lesson could not be found with specific message
  */
  async getLesson(lessonId) {
    try {
      // Get the lesson from the database
      const result = await this.lesson.findById(lessonId);
      // Return the result object
      console.log(result);
      return result;
    } catch (error) {
      // throw an error if the lesson could not be found
      throw new Error(`Lesson not found`);
    }
  }

  /* UpdateLesson method to update a lesson in the database
    Parameters:
      - lessonId: ID of the lesson to update
      - lesson: object with the lesson data to update
    Returns:
      - the updated lesson object
      - error if the lesson could not be updated with specific message
  */
  async updateLesson(lessonId, lesson) {
    // check if lesson object is contain invalid fields
    const invalidFields = Object.keys(lesson).filter(key => !Object.keys(this.lessonSchema.obj).includes(key));
    // throw an error if the lesson object contain invalid fields
    if (invalidFields.length > 0) {
      throw new Error(`Fields not in schema: ${invalidFields.join(', ')}`);
    }

    try {
      // Update the lesson in the database
      await this.lesson.findByIdAndUpdate(
        lessonId,
        lesson,
      );
      // return message if the lesson is updated
      return "Lesson updated successfully";
    } catch (error) {
      // throw an error if the lesson could not be updated
      throw new Error(`Lesson not found`);
    }
  }

  /* DeleteLesson method to delete a lesson from the database
    Parameters:
      - lessonId: ID of the lesson to delete
    Returns:
      - the deleted lesson object
      - error if the lesson could not be deleted with specific message
  */
  async deleteLesson(lessonId) {
    try {
      // Delete the lesson from the database
      const result = await this.lesson.findByIdAndDelete(lessonId);
      // Return message if the lesson is deleted
      return "Lesson deleted successfully";
    } catch (error) {
      // throw an error if the lesson could not be deleted
      throw new Error(`Lesson not found`);
    }
  }
}

// Export the LessonModel class
export default LessonModel;
