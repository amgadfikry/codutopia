import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for lesson schema with pre and post hooks
class LessonSchema {

  constructor() {
    // Define the schema of lesson
    this.lessonSchema = new Schema({
      title: { type: String, required: true, },
      courseId: { type: String, ref: 'courses', required: true, }, // course reference
      sectionId: { type: String, required: true, },
      description: { type: String, required: true, },
      content: { type: [String], ref: 'lessonContents', default: [], }, // lesson content reference
      quiz: { type: String, ref: 'quizzes', default: null, }, // quiz reference
      timeToFinish: { type: Number, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the lessons collection with the lesson schema
    this.lesson = mongoose.model('lessons', this.lessonSchema);
  }
}

// Export the LessonSchema class
export default LessonSchema;