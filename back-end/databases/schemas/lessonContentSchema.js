import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for lessonContent schema with pre and post hooks
class LessonContentSchema {

  constructor() {
    // Define the schema of lessonContent document
    this.lessonContentSchema = new Schema({
      lessonId: { type: String, ref: 'lessons', required: true },
      title: { type: String, required: true },
      type: { type: String, required: true, enum: ['text', 'video', 'image', 'pdf'] },
      value: { type: String, required: true }, // name of the file for pdf, video, image and text for text
      url: { type: String, default: null }, // URL for video, image and pdf and null for text
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the lessonContent collection with the lessonContent schema
    this.lessonContent = mongoose.model('lessonContents', this.lessonContentSchema);
  }
}

// Export the LessonContentSchema class
export default LessonContentSchema;
