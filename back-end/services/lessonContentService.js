import mongoDB, { lessonModel, lessonContentModel } from "../databases/mongoDB.js";
import oracleStorage from "../oracleStorage/oracleStorage.js";


/* createNewContent function to create a new content for a lesson in the database
  , upload the content to the cloud storage if it is a file , and add the content to the lesson
  Parameters:
    - courseId: id of the course that the lesson belongs to
    - content: content object to add to the lesson
    - file: file to upload to the cloud storage if the content is a file
  Returns:
    - Message of success of create the content and add it to the lesson
  Errors:
    - Throw error according to the error that occurred
    - File is required for this content type
*/
export async function createNewContent(courseId, content, file = null) {
  // Start a session for the transaction
  const session = await mongoDB.startSession();
  const lessonId = content.lessonId;
  try {
    // If the content type is not text
    if (content.type !== 'text') {
      // Check if the file is provided for the content type other than text
      if (!file) {
        throw new Error('File is required for this content type');
      }
      // make name for the file assign it to the content value and upload the file to the cloud storage
      const file_name = `${lessonId}_${content.value}`;
      await oracleStorage.createObj(courseId, file_name, file);
      // Assign the URL of the file in the cloud storage to the content URL
      content.url = oracleStorage.createUrl(courseId, file_name);
    }
    // Create the lesson content in the database
    const newContent = await lessonContentModel.createLessonContent(content, session);
    // Add the content to the lesson
    await lessonModel.addContentToLesson(lessonId, newContent._id, session);
    // Commit the transaction
    await mongoDB.commitTransaction(session);
    return 'Content created and added to the lesson successfully';
  }
  catch (error) {
    // if error occur after uploading the file to the cloud storage delete the file from the cloud storage
    if (content.type !== 'text' && content.url) {
      await oracleStorage.deleteObj(courseId, `${lessonId}_${content.value}`);
    }
    // Abort the transaction
    await mongoDB.abortTransaction(session);
    throw new Error(error.message);
  }
}


/* getOneContent function to get a content from the database
  Parameters:
    - contentId: ID of the content to get
  Returns:
    - the content object
  Errors:
    - Throw error according to the error that occurred
*/
export async function getOneContent(contentId) {
  try {
    // Get the content from the database
    const result = await lessonContentModel.getLessonContent(contentId);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* getAllContentsForLesson function to get all the contents for a lesson from the database
  Parameters:
    - lessonId: ID of the lesson to get the contents for
  Returns:
    - Array of content objects
  Errors:
    - Throw error according to the error that occurred
*/
export async function getAllContentsForLesson(lessonId) {
  try {
    // Get the contents for the lesson from the database
    const contents = await lessonContentModel.getLessonContentByLessonId(lessonId);
    return contents;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* updateMetaDataOrTextContent function to update the metadata or text content in the database
  Parameters:
    - contentId: ID of the content to update
    - content: content object to update
  Returns:
    - Message of success of update the content
  Errors:
    - Throw error according to the error that occurred
*/
export async function updateMetaDataOrTextContent(contentId, content) {
  try {
    // filter data to update only the metadata and text content
    const data = {
      title: content.title,
    }
    // if type is text add the value to the data
    if (content.type === 'text') {
      data.value = content.value;
    }
    // Update the content in the database
    await lessonContentModel.updateLessonContent(contentId, data);
    return 'Content updated successfully';
  } catch (error) {
    throw new Error(error.message);
  }
}


/* removeOneContent function to remove a content from the lesson in the database
  Parameters:
    - courseId: ID of the course that the lesson belongs to
    - contentId: ID of the content to remove
  Returns:
    - Message that the content is removed from the lesson
  Errors:
    - Throw error according to the error that occurred
*/
export async function removeOneContent(courseId, contentId) {
  // Start a session for the transaction
  const session = await mongoDB.startSession();
  try {
    // delete the content from the lessonContent collection and return the content object
    const content = await lessonContentModel.deleteLessonContent(contentId, session);
    // if the content is not text delete the file from the cloud storage
    if (content.type !== 'text') {
      await oracleStorage.deleteObj(courseId, `${content.lessonId}_${content.value}`);
    }
    // Remove the content from the lesson
    await lessonModel.removeContentFromLesson(content.lessonId, contentId, session);
    // Commit the transaction
    await mongoDB.commitTransaction(session);
    return 'Content removed successfully';
  } catch (error) {
    // Abort the transaction
    await mongoDB.abortTransaction(session);
    throw new Error(error.message);
  }
}
