import mongoDB, { lessonModel, courseModel, quizModel, lessonContentModel } from '../databases/mongoDB.js';
import oracleStorage from '../oracleStorage/oracleStorage.js';

/* createNewLesson function creates a new lesson in the database
    add it to section sundocument within course document
    Parameters:
      - lessonData: object containing lesson data
    Returns:
      - Message 'Lesson created and added to course section successfully'
    Errors:
      - Error according to the error that occurred
*/
export async function createNewLesson(lessonData) {
  // create session and start transaction
  const session = await mongoDB.startSession();
  try {
    // create lesson document in database
    const lesson = await lessonModel.createLesson(lessonData, session);
    // add lesson to section subdocument within course document
    await courseModel.addLessonToSection(lesson.courseId, lesson.sectionId, lesson._id, session);
    // commit transaction
    await mongoDB.commitTransaction(session);
    // return success message
    return 'Lesson created and added to course section successfully';
  } catch (error) {
    // abort transaction
    await mongoDB.abortTransaction(session);
    // throw error according to the error that occurred
    throw new Error(error.message);
  }
}


/* getLessonDetails function returns the full details of a lesson
    including the lesson data, and lesson content data
    Parameters:
      - lessonId: string containing lesson id
    Returns:
      - Object containing lesson data, and lesson content data
    Errors:
      - Error according to the error that occurred
*/
export async function getLessonDetails(lessonId) {
  try {
    // get lesson with content data
    const lesson = await lessonModel.getLessonWithContent(lessonId);
    // return lesson data
    return lesson;
  } catch (error) {
    // throw error according to the error that occurred
    throw new Error(error.message);
  }
}


/* updateLessonMetadata function updates the metadata of a lesson
    Parameters:
      - lessonId: string containing lesson id
      - lessonData: object containing lesson data
    Returns:
      - Message 'Lesson metadata updated successfully'
    Errors:
      - Error according to the error that occurred
*/
export async function updateLessonMetadata(lessonId, lessonData) {
  try {
    // create lesson metadata object to update
    const metadata = {};
    for (const key in lessonData) {
      if (['title', 'description', 'timeToFinish'].includes(key)) {
        metadata[key] = lessonData[key];
      }
    }
    // update lesson metadata
    await lessonModel.updateLesson(lessonId, metadata);
    // return success message
    return 'Lesson metadata updated successfully';
  } catch (error) {
    // throw error according to the error that occurred
    throw new Error(error.message);
  }
}


/* removeLesson function removes a lesson from the database, all its content, files on oci,
    quiz and remove it from the section subdocument within course document
    Parameters:
      - lessonId: string containing lesson id
    Returns:
      - Message 'Lesson removed with all its content and files successfully'
    Errors:
      - Error according to the error that occurred
*/
export async function removeLesson(lessonId) {
  // create session and start transaction
  const session = await mongoDB.startSession();
  try {
    // delete lesson document and return it's object
    const lesson = await lessonModel.deleteLesson(lessonId, session);
    // if there is quiz in the lesson remove it
    if (lesson.quiz) {
      await quizModel.deleteQuiz(lesson.quiz, session);
    }
    // remove lesson from section subdocument within course document
    await courseModel.removeLessonFromSection(lesson.courseId, lesson.sectionId, lessonId, session);
    // if there is content in the lesson remove it
    if (lesson.content.length > 0) {
      await lessonContentModel.deleteLessonContentByLessonId(lessonId, session);
      // get list of all files inside course bucket
      const allFilesInBucket = await oracleStorage.getAllObj(lesson.courseId);
      // filter files to delete only files related to the lesson
      const filesToDelete = allFilesInBucket.filter(name => name.startsWith(String(lessonId)));
      // delete files from oci storage
      for (const name of filesToDelete) {
        await oracleStorage.deleteObj(lesson.courseId, name);
      }
    }
    // commit transaction
    await mongoDB.commitTransaction(session);
    // return success message
    return 'Lesson removed with all its content and files successfully';
  } catch (error) {
    // abort transaction
    await mongoDB.abortTransaction(session);
    // throw error according to the error that occurred
    throw new Error(error.message);
  }
}
