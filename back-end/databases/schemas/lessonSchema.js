import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for lesson schema with pre and post hooks
class LessonSchema {

  constructor() {
    // Define the schema of content in lesson
    this.contentSchema = new Schema({
      _id: false, // disable _id
      title: { type: String, required: true },
      type: { type: String, required: true, enum: ['text', 'video', 'image'] },
      value: { type: String, required: true }
    });

    // Define the schema of lesson
    this.lessonSchema = new Schema({
      title: { type: String, required: true, },
      description: { type: String, required: true, },
      content: [this.contentSchema], // array of content schema subdocuments
      quiz: { type: String, ref: 'quizzes', default: null, }, // quiz reference
      timeToFinish: { type: Number, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the lessons collection with the lesson schema
    this.lesson = mongoose.model('lessons', this.lessonSchema);
  }
}

// Export the LessonSchema class
export default LessonSchema;