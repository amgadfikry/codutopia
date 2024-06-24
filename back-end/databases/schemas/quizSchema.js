import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Abstract class for quiz schema with pre and post hooks
class QuizSchema {

  constructor() {
    // Define schema for the quizzes collection
    this.quizSchema = new Schema({
      title: { type: String, required: true, },
      questions: {
        _id: false, // disable _id for subdocuments
        required: true,
        validate: { // validate: validate the length of the questions array
          validator: (questions) => QuizSchema.validateArrayLength(questions, 1),
          message: 'Quiz must have at least one question',
        },
        type: [{ // describe the type of the questions array with subdocument schema
          id: { type: Number, required: true, },
          question: { type: String, required: true, },
          options: {
            required: true,
            validate: { // validate: validate the length of the options array
              validator: (options) => QuizSchema.validateArrayLength(options, 2),
              message: 'Quiz must have at least two options for each question',
            },
            type: [{ type: String, required: true, }],
          }
        }],
      },
      answers: [{ type: String, required: true, }], // array of correct answers
      questionsPerQuiz: { type: Number, required: true, default: 1, }, // number of questions per quiz
      timeToFinish: { type: Number, required: true, },
    }, { timestamps: true, }); // add timestamps to the schema

    // Create a new model for the quizzes collection with the quiz schema
    this.quiz = mongoose.model('quizzes', this.quizSchema);
  }

  /* static method validateArrayLength to validate the length of the array
    Parameters:
    - arr: array to validate
    - len: length of the array
    Returns:
    - boolean value of the validation result
  */
  static validateArrayLength(arr, len) {
    return arr.length >= len;
  }
}


export default QuizSchema;
