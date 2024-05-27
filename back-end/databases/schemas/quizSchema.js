import mongoose from "mongoose";
// Save schema class from mongoose to a variable
const Schema = mongoose.Schema;

// Abstract class for quiz schema with pre and post hooks
class QuizSchema {

  constructor() {
    // Create a new schema for the quizzes collection
    this.quizSchema = new Schema({
      // title: string value that is required
      title: { type: String, required: true, },
      // questions: list of questions in quiz with validation format of question, options
      questions: {
        // disable _id for subdocuments
        _id: false,
        // required: true to enforce the validation
        required: true,
        // validate: validate the length of the questions array
        validate: {
          validator: (questions) => QuizSchema.validateArrayLength(questions, 1),
          message: 'Quiz must have at least one question',
        },
        // type: array of objects with question, options, and answers
        type: [{
          // id: number value that is required
          id: { type: Number, required: true, },
          // question: string value that is required
          question: { type: String, required: true, },
          // options: list of options for the question
          options: {
            // required: true to enforce the validation
            required: true,
            // validate: validate the length of the options array
            validate: {
              validator: (options) => QuizSchema.validateArrayLength(options, 2),
              message: 'Quiz must have at least two options for each question',
            },
            // type: array of strings
            type: [{ type: String, required: true, }],
          }
        }],
      },
      // answers: list of answers in quiz with validation format of string
      answers: [{ type: String, required: true, }],
      // qusetionsPerQuiz: number value that is required
      questionsPerQuiz: { type: Number, required: true, default: 1, },
      // timeToFinish: number value that is required
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

  /* static method retrieve specific number of questions from the quiz accord to the number of questions per quiz
    Parameters:
    - doc: quiz document to retrieve questions from
    Returns:
    - doc with specific number of questions randomly selected
  */
}

// Export the QuizSchema class
export default QuizSchema;
