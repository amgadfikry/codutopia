import mongoose from "mongoose";
// Save schema class from mongoose to a variable
const Schema = mongoose.Schema;

// Abstract class for lesson schema with pre and post hooks
class LessonSchema {

  constructor() {
    // Create a new schema for the lessons collection
    this.lessonSchema = new Schema({
      // title: string value that is required
      title: { type: String, required: true, },
      // content: list of content in lesson
      content: [
        {
          // title: string value that is required
          title: { type: String, required: true, },
          // type: string value that is required
          type: { type: String, required: true, },
          // value: string value that is required
          value: { type: String, required: true, },
        },
      ],
      // timeToFinish: number value that is required
      timeToFinish: { type: Number, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the lessons collection with the lesson schema
    this.lesson = mongoose.model('lessons', this.lessonSchema);
  }
}

// Export the LessonSchema class
export default LessonSchema;