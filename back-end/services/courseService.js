import mongoDB, { courseModel, userModel, reviewModel, lessonModel, lessonContentModel, quizModel }
  from "../databases/mongoDB.js";
import oracleStorage from "../oracleStorage/oracleStorage.js";


/* createNewCourse function creates a new course in the database, add it
    to author courses list, and create bucket in oracle storage for the course
    Parameteres:
      - courseData: object with course data
    Returns:
      - message of 'Course created successfully'
    Errors:
      - Throw error according to the error that occurred
*/
export async function createNewCourse(courseData) {
  // Start a session for the transaction
  const session = await mongoDB.startSession();
  try {
    // Create the course in the database
    const course = await courseModel.createCourse(courseData, session);
    // Add the course to the author courses list
    await userModel.addCourseToWishlistorCreatedList(courseData.authorId, course._id, session);
    // Create a bucket in oracle storage for the course
    await oracleStorage.createBucket(course._id);
    // Commit the transaction
    await mongoDB.commitTransaction(session);
    // Return the message of success
    return 'Course created successfully';
  } catch (error) {
    // Abort the transaction if an error occurred
    await mongoDB.abortTransaction(session);
    throw new Error(error.message);
  }
}


/* getCourseSummary function gets the course summary data from the database
    Parameters:
      - courseId: string of the course id
    Returns:
      - object with course brief data
    Errors:
      - Throw error according to the error that occurred
*/
export async function getCourseSummary(courseId) {
  try {
    // Get the course brief data from the database
    const course = await courseModel.getCourseWithLessons(courseId);
    return course;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* getCoursesWithFilters function gets the courses with filters from the database
    Parameters:
      - filters: object with filters data
    Returns:
      - array of objects with courses data
    Errors:
      - Throw error according to the error that occurred
*/
export async function getCoursesWithFilters(filters) {
  try {
    // check filter object and add values to function if present
    const courses = await courseModel.filterCourses(filters);
    // return the courses data
    return courses;
  } catch (error) {
    throw new Error(error.message);
  }
}


/* updateCourseMetadata function updates the course metadata in the database
    and if contains image field, upload the image to oracle storage and get the image url
    Parameters:
      - courseId: string of the course id
      - metadata: object with course metadata
      - file: image file to upload to oracle storage
    Returns:
      - message of 'Course metadata updated successfully'
    Errors:
      - Throw error according to the error that occurred
      - File is required
*/
export async function updateCourseMetadata(courseId, metadata, file = null) {
  // start a session for the transaction
  const session = await mongoDB.startSession();
  try {
    // filter metadata object to remove not metadata fields
    const metadataFields = ['title', 'description', 'tags', 'price', 'discount', 'image'];
    for (const field in metadata) {
      if (!metadataFields.includes(field)) {
        delete metadata[field];
      }
    }
    // check if the metadata contains image field
    if (metadata.image) {
      // if file is not provided, throw an error
      if (!file) {
        throw new Error('File is required');
      }
      // create image name
      const image_name = `${courseId}_${metadata.image}`;
      // upload the image to oracle storage and get the image url
      await oracleStorage.createObj(courseId, image_name, file);
      // assign the image url to the metadata image field
      metadata.image = oracleStorage.createUrl(courseId, image_name);
    }
    // Update the course metadata in the database
    await courseModel.updateCourse(courseId, metadata, session);
    // Commit the transaction
    await mongoDB.commitTransaction(session);
    // Return the message of success
    return 'Course metadata updated successfully';
  } catch (error) {
    // abort the transaction if an error occurred
    await mongoDB.abortTransaction(session);
    throw new Error(error.message);
  }
}


/* createNewSection function creates a new section in the course in the database
    Parameters:
      - courseId: string of the course id
      - sectionData: object with section data
    Returns:
      - message of 'Section created successfully'
    Errors:
      - Throw error according to the error that occurred
*/
export async function createNewSection(courseId, sectionData) {
  try {
    // Create the section in the course in the database
    await courseModel.addSectionToCourse(courseId, sectionData);
    return 'Section created successfully';
  } catch (error) {
    // abort the transaction if an error occurred
    throw new Error(error.message);
  }
}


/* updateSectionMetadata function updates the section metadata in the course in the database
    Parameters:
      - courseId: string of the course id
      - sectionId: string of the section id
      - metadata: object with section metadata
    Returns:
      - message of 'Section metadata updated successfully'
    Errors:
      - Throw error according to the error that occurred
*/
export async function updateSectionMetadata(courseId, sectionId, metadata) {
  try {
    // remove lesssons field from metadata object if exists
    if (metadata.lessons) {
      delete metadata.lessons;
    }
    // Update the section metadata in the course in the database
    await courseModel.updateSection(courseId, sectionId, metadata);
    return 'Section metadata updated successfully';
  } catch (error) {
    // abort the transaction if an error occurred
    throw new Error(error.message);
  }
}


/* removeSection function removes the section from the course in the database, all lessons, quizzes, files, content
    Parameters:
      - courseId: string of the course id
      - sectionId: string of the section id
    Returns:
      - message of 'Section removed successfully'
    Errors:
      - Throw error according to the error that occurred
*/
export async function removeSection(courseId, sectionId) {
  // start a session for the transaction
  const session = await mongoDB.startSession();
  try {
    // remove the section from the course in the database
    const section = await courseModel.removeSectionFromCourse(courseId, sectionId, session);
    if (section.lessons.length > 0) {
      // delete all lessons of the section by section id
      await lessonModel.deleteAllLessonsBySectionId(sectionId, session);
      // delete all lesson contents of lessons of the section with lessons ids
      await lessonContentModel.deleteLessonContentByLessonsIdsList(section.lessons, session);
      // remove all quizzez of lessons of the section with lessons ids
      await quizModel.deleteAllQuizzezByLessonIdList(section.lessons, session);
      // get list of all files on oracle storage in course bucket
      const files = await oracleStorage.getAllObj(courseId);
      // filter files to get only files of the lessons in section where each file start with lesson id
      const sectionFiles = files.filter(
        file => section.lessons.some(
          lessonId => file.startsWith(lessonId))
      );
      // delete all files in the section from oracle storage
      for (const file of sectionFiles) {
        await oracleStorage.deleteObj(courseId, file);
      }
    }
    // Commit the transaction
    await mongoDB.commitTransaction(session);
    return 'Section removed successfully';
  } catch (error) {
    // abort the transaction if an error occurred
    await mongoDB.abortTransaction(session);
    throw new Error(error.message);
  }
}
