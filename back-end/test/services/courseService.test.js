import mongoDB, { courseModel, userModel, reviewModel, lessonModel, lessonContentModel, quizModel }
  from "../../databases/mongoDB.js";
import oracleStorage from "../../oracleStorage/oracleStorage.js";
import * as courseService from "../../services/courseService.js";
import sinon from "sinon";
import { expect } from "chai";

// Test suite for courseService functions
describe("courseService", () => {
  // Variables for courseData
  let courseData;
  let returnCourseData;

  // beforeEach test define courseData object and stubs for transaction functions
  beforeEach(() => {
    courseData = {
      _id: '60f6e1b9b58fe3208a9b8b57',
      title: "Test Course",
      description: "Test Description",
      tags: ['tag1', 'tag2'],
      authorId: '60f6e1b9b58fe3208a9b8b58',
      price: 100,
      discount: 10,
    };
    returnCourseData = {
      ...courseData,
      sections: [],
      reviews: [],
      students: 0,
      courseAvgRating: 0,
      image: null,
    };
    // Mock the startSession, commitTransaction, and abortTransaction functions
    sinon.stub(mongoDB, "startSession").returns('session');
    sinon.stub(mongoDB, "commitTransaction").returns('commit');
    sinon.stub(mongoDB, "abortTransaction").returns('abort');
  });

  // After each test suite, restore the default sandbox
  afterEach(() => {
    sinon.restore();
  });


  // Test suite for createNewCourse function
  describe("createNewCourse", () => {
    // Variables for createCourse, addCourseToWishlistorCreatedList, and createBucket functions
    let createCourseStub;
    let addCourseToWishlistorCreatedListStub;
    let createBucketStub;

    // beforeEach test define stubs for createCourse, addCourseToWishlistorCreatedList, and createBucket functions
    beforeEach(() => {
      createCourseStub = sinon.stub(courseModel, "createCourse").returns(returnCourseData);
      addCourseToWishlistorCreatedListStub = sinon.stub(userModel, "addCourseToWishlistorCreatedList").returns('added');
      createBucketStub = sinon.stub(oracleStorage, "createBucket").returns('bucket');
    });

    // Test case for create new course with success call all methods and return success message
    it("create new course with success call all methods and return success message", async () => {
      // Call the createNewCourse function
      const result = await courseService.createNewCourse(courseData);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.createCourse.calledOnceWith(courseData, 'session')).to.be.true;
      expect(userModel.addCourseToWishlistorCreatedList.calledOnceWith(
        courseData.authorId, 'createdList', courseData._id, 'session')).to.be.true;
      expect(oracleStorage.createBucket.calledOnceWith(courseData._id)).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course created successfully');
    });

    // Test case for create new course with error in createCourse calls and throw error
    it("create new course with error in createCourse calls and throw error", async () => {
      // Mock the createCourse function to throw an error
      createCourseStub.throws(new Error('Error in createCourse'));
      try {
        // Call the createNewCourse function
        await courseService.createNewCourse(courseData);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.createCourse.calledOnceWith(courseData, 'session')).to.be.true;
        expect(userModel.addCourseToWishlistorCreatedList.calledOnce).to.be.false;
        expect(oracleStorage.createBucket.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in createCourse');
      }
    });

    // Test case for create new course with error in addCourseToWishlistorCreatedList calls and throw error
    it("create new course with error in addCourseToWishlistorCreatedList calls and throw error", async () => {
      // Mock the createCourse and addCourseToWishlistorCreatedList functions
      addCourseToWishlistorCreatedListStub.throws(new Error('Error in addCourseToWishlistorCreatedList'));
      try {
        // Call the createNewCourse function
        await courseService.createNewCourse(courseData);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.createCourse.calledOnceWith(courseData, 'session')).to.be.true;
        expect(userModel.addCourseToWishlistorCreatedList.calledOnceWith(
          courseData.authorId, 'createdList', courseData._id, 'session')).to.be.true;
        expect(oracleStorage.createBucket.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in addCourseToWishlistorCreatedList');
      }
    });

    // Test case for create new course with error in createBucket calls and throw error
    it("create new course with error in createBucket calls and throw error", async () => {
      // Mock the createCourse and addCourseToWishlistorCreatedList functions
      createBucketStub.throws(new Error('Error in createBucket'));
      try {
        // Call the createNewCourse function
        await courseService.createNewCourse(courseData);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.createCourse.calledOnceWith(courseData, 'session')).to.be.true;
        expect(userModel.addCourseToWishlistorCreatedList.calledOnceWith(
          courseData.authorId, 'createdList', courseData._id, 'session')).to.be.true;
        expect(oracleStorage.createBucket.calledOnceWith(courseData._id)).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in createBucket');
      }
    });
  });


  // Test suite for getCourseSummary function
  describe("getCourseSummary", () => {

    // Test case for get course summary with success call getCourseWithLessons and return course data
    it("get course summary with success call getCourseWithLessons and return course data", async () => {
      // Mock the getCourseWithLessons function
      sinon.stub(courseModel, "getCourseWithLessons").returns(returnCourseData);
      // Call the getCourseSummary function
      const result = await courseService.getCourseSummary(courseData._id);
      // Verify that the function was called with the argument correctly
      expect(courseModel.getCourseWithLessons.calledOnceWith(courseData._id)).to.be.true;
      // Check if the result is as expected
      expect(result).to.deep.equal(returnCourseData);
    });

    // Test case for get course summary with error in getCourseWithLessons calls and throw error
    it("get course summary with error in getCourseWithLessons calls and throw error", async () => {
      // Mock the getCourseWithLessons function to throw an error
      sinon.stub(courseModel, "getCourseWithLessons").throws(new Error('Error in getCourseWithLessons'));
      try {
        // Call the getCourseSummary function
        await courseService.getCourseSummary(courseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(courseModel.getCourseWithLessons.calledOnceWith(courseData._id)).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in getCourseWithLessons');
      }
    });
  });


  // Test suite for getCoursesWithFilters function
  describe("getCoursesWithFilters", () => {

    // Test case for get courses with filters with success call filterCourses and return courses data
    it("get courses with filters with success call filterCourses and return courses data", async () => {
      // Variables for filters
      const filters = { title: 'Test', tags: ['tag1', 'tag2'], };
      // Mock the getCoursesWithFilters function
      sinon.stub(courseModel, "filterCourses").returns([returnCourseData]);
      // Call the getCoursesWithFilters function
      const result = await courseService.getCoursesWithFilters(filters);
      // Verify that the function was called with the argument correctly
      expect(courseModel.filterCourses.calledOnceWith(filters)).to.be.true;
      // Check if the result is as expected
      expect(result[0]).to.deep.equal(returnCourseData);
    });

    // Test case for get courses with filters with error in filterCourses calls and throw error
    it("get courses with filters with error in filterCourses calls and throw error", async () => {
      // Variables for filters
      const filters = { title: 'Test', tags: ['tag1', 'tag2'], };
      // Mock the getCoursesWithFilters function to throw an error
      sinon.stub(courseModel, "filterCourses").throws(new Error('Error in filterCourses'));
      try {
        // Call the getCoursesWithFilters function
        await courseService.getCoursesWithFilters(filters);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(courseModel.filterCourses.calledOnceWith(filters)).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in filterCourses');
      }
    });
  });


  // Test suite for updateCourseMetadata function
  describe("updateCourseMetadata", () => {
    // variable of updated course data
    let updatedCourseData;
    let updateCourseStub;
    let createObjStub;
    let createUrlStub;

    // beforeEach test define updatedCourseData object
    beforeEach(() => {
      updatedCourseData = {
        title: "Test Course Updated",
        description: "Test Description Updated",
        price: 200,
        discount: 20,
      };
      // Mock the updateCourseMetadata, uploadImageToBucket, and updateCourseImage functions
      updateCourseStub = sinon.stub(courseModel, "updateCourse").returns('updated');
      createObjStub = sinon.stub(oracleStorage, "createObj").returns('uploaded');
      createUrlStub = sinon.stub(oracleStorage, "createUrl").returns('url');
    });

    // Test case for update course metadata without image data with success call all methods and return success message
    it("update course metadata without image data with success call all methods and return success message", async () => {
      // Call the updateCourseMetadata function
      const result = await courseService.updateCourseMetadata(courseData._id, updatedCourseData);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(oracleStorage.createObj.calledOnce).to.be.false;
      expect(oracleStorage.createUrl.calledOnce).to.be.false;
      expect(courseModel.updateCourse.calledOnceWith(courseData._id, updatedCourseData, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course metadata updated successfully');
    });

    // Test case for update course metadata without image data and data other than metadata fields with success call all methods
    it("update course metadata without image data and data other than metadata fields with success call all methods", async () => {
      // Call the updateCourseMetadata function
      await courseService.updateCourseMetadata(courseData._id, { ...updatedCourseData, students: 10 });
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(oracleStorage.createObj.calledOnce).to.be.false;
      expect(oracleStorage.createUrl.calledOnce).to.be.false;
      expect(courseModel.updateCourse.calledOnceWith(courseData._id, updatedCourseData, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
    });

    // Test case for update course metadata without image data with error in updateCourse calls and throw error
    it("update course metadata without image data with error in updateCourse calls and throw error", async () => {
      // Mock the updateCourse function to throw an error
      updateCourseStub.throws(new Error('Error in updateCourse'));
      try {
        // Call the updateCourseMetadata function
        await courseService.updateCourseMetadata(courseData._id, updatedCourseData);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnce).to.be.false;
        expect(oracleStorage.createUrl.calledOnce).to.be.false;
        expect(courseModel.updateCourse.calledOnceWith(courseData._id, updatedCourseData, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in updateCourse');
      }
    });

    // Test case for update course metadata with image data with success call all methods and return success message
    it("update course metadata with image data with success call all methods and return success message", async () => {
      // add image field to updatedCourseData
      updatedCourseData.image = 'image.jpg';
      const image_name = `${courseData._id}_${updatedCourseData.image}`;
      // Call the updateCourseMetadata function
      const result = await courseService.updateCourseMetadata(courseData._id, updatedCourseData, 'file');
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(oracleStorage.createObj.calledOnceWith(courseData._id, image_name, 'file')).to.be.true;
      expect(oracleStorage.createUrl.calledOnceWith(courseData._id, image_name)).to.be.true;
      expect(courseModel.updateCourse.calledOnceWith(courseData._id, { ...updatedCourseData, image: 'url' }, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course metadata updated successfully');
    });

    // Test case for update course metadata with image data and file not provided and throw error
    it("update course metadata with image data and file not provided and throw error", async () => {
      // add image field to updatedCourseData
      updatedCourseData.image = 'image.jpg';
      try {
        // Call the updateCourseMetadata function
        await courseService.updateCourseMetadata(courseData._id, updatedCourseData);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnce).to.be.false;
        expect(oracleStorage.createUrl.calledOnce).to.be.false;
        expect(courseModel.updateCourse.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('File is required');
      }
    });

    // Test case for update course metadata with image data and error in createObj calls and throw error
    it("update course metadata with image data and error in createObj calls and throw error", async () => {
      // add image field to updatedCourseData
      updatedCourseData.image = 'image.jpg';
      const image_name = `${courseData._id}_${updatedCourseData.image}`;
      // Mock the createObj function to throw an error
      createObjStub.throws(new Error('Error in createObj'));
      try {
        // Call the updateCourseMetadata function
        await courseService.updateCourseMetadata(courseData._id, updatedCourseData, 'file');
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnceWith(courseData._id, image_name, 'file')).to.be.true;
        expect(oracleStorage.createUrl.calledOnce).to.be.false;
        expect(courseModel.updateCourse.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in createObj');
      }
    });

    // Test case for update course metadata with image data and error in createUrl calls and throw error
    it("update course metadata with image data and error in createUrl calls and throw error", async () => {
      // add image field to updatedCourseData
      updatedCourseData.image = 'image.jpg';
      const image_name = `${courseData._id}_${updatedCourseData.image}`;
      // Mock the createUrl function to throw an error
      createUrlStub.throws(new Error('Error in createUrl'));
      try {
        // Call the updateCourseMetadata function
        await courseService.updateCourseMetadata(courseData._id, updatedCourseData, 'file');
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnceWith(courseData._id, image_name, 'file')).to.be.true;
        expect(oracleStorage.createUrl.calledOnceWith(courseData._id, image_name)).to.be.true;
        expect(courseModel.updateCourse.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in createUrl');
      }
    });

    // Test case for update course metadata with image data and error in updateCourse calls and throw error
    it("update course metadata with image data and error in updateCourse calls and throw error", async () => {
      // add image field to updatedCourseData
      updatedCourseData.image = 'image.jpg';
      const image_name = `${courseData._id}_${updatedCourseData.image}`;
      // Mock the updateCourse function to throw an error
      updateCourseStub.throws(new Error('Error in updateCourse'));
      try {
        // Call the updateCourseMetadata function
        await courseService.updateCourseMetadata(courseData._id, updatedCourseData, 'file');
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnceWith(courseData._id, image_name, 'file')).to.be.true;
        expect(oracleStorage.createUrl.calledOnceWith(courseData._id, image_name)).to.be.true;
        expect(courseModel.updateCourse.calledOnceWith(courseData._id, { ...updatedCourseData, image: 'url' }, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in updateCourse');
      }
    });
  });


  // Test suite for createNewSection function
  describe("createNewSection", () => {
    // Variables for sectionData
    let sectionData;

    // beforeEach test define sectionData object
    beforeEach(() => {
      sectionData = {
        title: "Test Section",
        description: "Test Description",
      };
    });

    // Test case for create new section with success call addSectionToCourse and return success message
    it("create new section with success call addSectionToCourse and return success message", async () => {
      // Mock the createSection function
      sinon.stub(courseModel, "addSectionToCourse").returns('created');
      // Call the createNewSection function
      const result = await courseService.createNewSection(courseData._id, sectionData);
      // Verify that the function was called with the argument correctly
      expect(courseModel.addSectionToCourse.calledOnceWith(courseData._id, sectionData)).to.be.true;
      // Check if the result is as expected
      expect(result).to.equal('Section created successfully');
    });

    // Test case for create new section with error in addSectionToCourse calls and throw error
    it("create new section with error in addSectionToCourse calls and throw error", async () => {
      // Mock the createSection function to throw an error
      sinon.stub(courseModel, "addSectionToCourse").throws(new Error('Error in addSectionToCourse'));
      try {
        // Call the createNewSection function
        await courseService.createNewSection(courseData._id, sectionData);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(courseModel.addSectionToCourse.calledOnceWith(courseData._id, sectionData)).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in addSectionToCourse');
      }
    });
  });


  // Test suite for updateSectionMetadata function
  describe("updateSectionMetadata", () => {
    // Variables for sectionData
    let sectionData;

    // beforeEach test define sectionData and updatedSectionData objects
    beforeEach(() => {
      sectionData = {
        title: "Test Section",
        description: "Test Description",
      };
    });

    // Test case for update section metadata with success updateSection calls and return success message
    it("update section metadata with success updateSection calls and return success message", async () => {
      // Mock the updateSectionMetadata function
      sinon.stub(courseModel, "updateSection").returns('updated');
      // Call the updateSectionMetadata function
      const result = await courseService.updateSectionMetadata(courseData._id, sectionData, sectionData);
      // Verify that the function was called with the arguments correctly
      expect(courseModel.updateSection.calledOnceWith(courseData._id, sectionData, sectionData)).to.be.true;
      // Check if the result is as expected
      expect(result).to.equal('Section metadata updated successfully');
    });

    // Test case for update section metadata with lessons field in metadata and remove it and return success message
    it("update section metadata with lessons field in metadata and remove it and return success message", async () => {
      // Mock the updateSectionMetadata function
      sinon.stub(courseModel, "updateSection").returns('updated');
      // Call the updateSectionMetadata function
      const result = await courseService.updateSectionMetadata(courseData._id, sectionData, { ...sectionData, lessons: [] });
      // Verify that the function was called with the arguments correctly
      expect(courseModel.updateSection.calledOnceWith(courseData._id, sectionData, sectionData)).to.be.true;
      // Check if the result is as expected
      expect(result).to.equal('Section metadata updated successfully');
    });

    // Test case for update section metadata with error in updateSection calls and throw error
    it("update section metadata with error in updateSection calls and throw error", async () => {
      // Mock the updateSection function to throw an error
      sinon.stub(courseModel, "updateSection").throws(new Error('Error in updateSection'));
      try {
        // Call the updateSectionMetadata function
        await courseService.updateSectionMetadata(courseData._id, sectionData, sectionData);
      } catch (error) {
        // Verify that the function was called with the arguments correctly
        expect(courseModel.updateSection.calledOnceWith(courseData._id, sectionData, sectionData)).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in updateSection');
      }
    });
  });


  // Test suite for removeSection function
  describe("removeSection", () => {
    // Variables for sectionId
    let fullCourseData;
    let files;
    let removeSectionFromCourseStub;
    let deleteAllLessonsBySectionIdStub;
    let deleteLessonContentByLessonsIdsListStub;
    let deleteAllQuizzezByLessonIdListStub;
    let getAllObjStub;
    let deleteObjStub;

    // beforeEach test define sectionId
    beforeEach(() => {
      fullCourseData = {
        ...returnCourseData,
        sections: [{
          _id: '60f6e1b9b58fe3208a9b8b69',
          title: "Test Section",
          description: "Test Description",
          lessons: ['60f6e1b9b58fe3208a9b8b70', '60f6e1b9b58fe3208a9b8b71'],
        }],
      };
      files = [`60f6e1b9b58fe3208a9b8b70_file1`, `60f6e1b9b58fe3208a9b8b71_file2`];
      // Mock all methods with suitable returns value
      removeSectionFromCourseStub = sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      deleteAllLessonsBySectionIdStub = sinon.stub(lessonModel, "deleteAllLessonsBySectionId").returns('deleted');
      deleteLessonContentByLessonsIdsListStub = sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").returns('deleted');
      deleteAllQuizzezByLessonIdListStub = sinon.stub(quizModel, "deleteAllQuizzezByLessonIdList").returns('deleted');
      getAllObjStub = sinon.stub(oracleStorage, "getAllObj").returns(files);
      deleteObjStub = sinon.stub(oracleStorage, "deleteObj").returns('deleted');
    });

    // Test case for remove section with success call methods inside function and return success message
    it("remove section with success call methods inside function and return success message", async () => {
      // Call the removeSection function
      const result = await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.removeSectionFromCourse.calledOnceWith(
        fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
      expect(lessonModel.deleteAllLessonsBySectionId.calledOnceWith(
        fullCourseData.sections[0]._id, 'session')).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(
        fullCourseData.sections[0].lessons, 'session')).to.be.true;
      expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(
        fullCourseData.sections[0].lessons, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
      expect(oracleStorage.deleteObj.calledTwice).to.be.true;
      expect(oracleStorage.deleteObj.firstCall.calledWith(fullCourseData._id, files[0])).to.be.true;
      expect(oracleStorage.deleteObj.secondCall.calledWith(fullCourseData._id, files[1])).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Section removed successfully');
    });

    // Test case for remove section with success call methods inside function and files not in id format and return success message
    it("remove section with success call methods inside function and files not in id format and return success message", async () => {
      // add new file to files with id not in lessons ids
      files.push('50f6e1b9b58fe3208a9b8b72_file3');
      getAllObjStub.returns(files);
      // Call the removeSection function
      const result = await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.removeSectionFromCourse.calledOnceWith(
        fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
      expect(lessonModel.deleteAllLessonsBySectionId.calledOnceWith(
        fullCourseData.sections[0]._id, 'session')).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(
        fullCourseData.sections[0].lessons, 'session')).to.be.true;
      expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(
        fullCourseData.sections[0].lessons, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
      expect(oracleStorage.deleteObj.calledTwice).to.be.true;
      expect(oracleStorage.deleteObj.firstCall.calledWith(fullCourseData._id, files[0])).to.be.true;
      expect(oracleStorage.deleteObj.secondCall.calledWith(fullCourseData._id, files[1])).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Section removed successfully');
    });

    // Test case for remove section with success call methods inside function with empty lessons and return success message
    it("remove section with success call methods inside function with empty lessons and return success message", async () => {
      // remove lessons from section
      fullCourseData.sections[0].lessons = [];
      removeSectionFromCourseStub.returns(fullCourseData.sections[0]);
      const result = await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.removeSectionFromCourse.calledOnceWith(
        fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
      expect(lessonModel.deleteAllLessonsBySectionId.calledOnce).to.be.false;
      expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
      expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
      expect(oracleStorage.getAllObj.calledOnce).to.be.false;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Section removed successfully');
    });

    // Test case for remove section with error in removeSectionFromCourse calls and throw error
    it("remove section with error in removeSectionFromCourse calls and throw error", async () => {
      // Mock the removeSectionFromCourse function to throw an error
      removeSectionFromCourseStub.throws(new Error('Error in removeSectionFromCourse'));
      try {
        // Call the removeSection function
        await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      } catch (error) {
        // Verify that the function was called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.removeSectionFromCourse.calledOnceWith(
          fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsBySectionId.calledOnce).to.be.false;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in removeSectionFromCourse');
      }
    });

    // Test case for remove section with error in deleteAllLessonsBySectionId calls and throw error
    it("remove section with error in deleteAllLessonsBySectionId calls and throw error", async () => {
      // Mock the deleteAllLessonsBySectionId function to throw an error
      deleteAllLessonsBySectionIdStub.throws(new Error('Error in deleteAllLessonsBySectionId'));
      try {
        // Call the removeSection function
        await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.removeSectionFromCourse.calledOnceWith(
          fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsBySectionId.calledOnceWith(
          fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteAllLessonsBySectionId');
      }
    });

    // Test case for remove section with error in deleteLessonContentByLessonsIdsList calls and throw error
    it("remove section with error in deleteLessonContentByLessonsIdsList calls and throw error", async () => {
      // Mock the deleteLessonContentByLessonsIdsList function to throw an error
      deleteLessonContentByLessonsIdsListStub.throws(new Error('Error in deleteLessonContentByLessonsIdsList'));
      try {
        // Call the removeSection function
        await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.removeSectionFromCourse.calledOnceWith(
          fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsBySectionId.calledOnceWith(
          fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(
          fullCourseData.sections[0].lessons, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteLessonContentByLessonsIdsList');
      }
    });

    // Test case for remove section with error in deleteAllQuizzezByLessonIdList calls and throw error
    it("remove section with error in deleteAllQuizzezByLessonIdList calls and throw error", async () => {
      // Mock the deleteAllQuizzezByLessonIdList function to throw an error
      deleteAllQuizzezByLessonIdListStub.throws(new Error('Error in deleteAllQuizzezByLessonIdList'));
      try {
        // Call the removeSection function
        await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.removeSectionFromCourse.calledOnceWith(
          fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsBySectionId.calledOnceWith(
          fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(
          fullCourseData.sections[0].lessons, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(
          fullCourseData.sections[0].lessons, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteAllQuizzezByLessonIdList');
      }
    });

    // Test case for remove section with error in getAllObj calls and throw error
    it("remove section with error in getAllObj calls and throw error", async () => {
      // Mock the getAllObj function to throw an error
      getAllObjStub.throws(new Error('Error in getAllObj'));
      try {
        // Call the removeSection function
        await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.removeSectionFromCourse.calledOnceWith(
          fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsBySectionId.calledOnceWith(
          fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(
          fullCourseData.sections[0].lessons, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(
          fullCourseData.sections[0].lessons, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in getAllObj');
      }
    });

    // Test case for remove section with error in deleteObj calls and throw error
    it("remove section with error in deleteObj calls and throw error", async () => {
      // Mock the deleteObj function to throw an error
      deleteObjStub.throws(new Error('Error in deleteObj'));
      try {
        // Call the removeSection function
        await courseService.removeSection(fullCourseData._id, fullCourseData.sections[0]._id);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.removeSectionFromCourse.calledOnceWith(
          fullCourseData._id, fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsBySectionId.calledOnceWith(
          fullCourseData.sections[0]._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(
          fullCourseData.sections[0].lessons, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(
          fullCourseData.sections[0].lessons, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
        expect(oracleStorage.deleteObj.calledOnce).to.be.true;
        expect(oracleStorage.deleteObj.firstCall.calledWith(fullCourseData._id, files[0])).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteObj');
      }
    });
  });


  // Test suite for removeCourse function
  describe("removeCourse", () => {
    // variables for fullCourseData, lessonsIds, files
    let fullCourseData;
    let lessonsIds;
    let files;
    let deleteCourseStub;
    let removeCourseFromListStub;
    let removeAllReviewsByCourseIdStub;
    let getAllLessonsIdsByCourseIdStub;
    let deleteAllLessonsByCourseIdStub;
    let deleteLessonContentByLessonsIdsListStub;
    let deleteAllQuizzezByLessonIdListStub;
    let getAllObjStub;
    let deleteObjStub;

    // beforeEach test define fullCourseData, lessonsIds, files objects
    beforeEach(() => {
      fullCourseData = {
        ...returnCourseData,
        reviews: ['60f6e1b9b58fe3208a9b8b69', '60f6e1b9b58fe3208a9b8b70'],
      };
      lessonsIds = ['60f6e1b9b58fe3208a9b8b71', '60f6e1b9b58fe3208a9b8b72'];
      files = ['file1', 'file2'];
      // create stub for all methods
      deleteCourseStub = sinon.stub(courseModel, "deleteCourse").returns(fullCourseData);
      removeCourseFromListStub = sinon.stub(userModel, "removeCourseFromList").returns('removed');
      removeAllReviewsByCourseIdStub = sinon.stub(reviewModel, "removeAllReviewsByCourseId").returns('removed');
      getAllLessonsIdsByCourseIdStub = sinon.stub(lessonModel, "getAllLessonsIdsByCourseId").returns(lessonsIds);
      deleteAllLessonsByCourseIdStub = sinon.stub(lessonModel, "deleteAllLessonsByCourseId").returns('deleted');
      deleteLessonContentByLessonsIdsListStub = sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").returns('deleted');
      deleteAllQuizzezByLessonIdListStub = sinon.stub(quizModel, "deleteAllQuizzezByLessonIdList").returns('deleted');
      getAllObjStub = sinon.stub(oracleStorage, "getAllObj").returns(files);
      deleteObjStub = sinon.stub(oracleStorage, "deleteObj").returns('deleted');
    });

    // Test case for remove course with there is reviews, lessons, files and success call methods inside function
    it("remove course with there is reviews, lessons, files and success call methods inside function", async () => {
      // Call the removeCourse function
      const result = await courseService.removeCourse(fullCourseData._id);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(userModel.removeCourseFromList.calledOnceWith(
        fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
      expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonModel.deleteAllLessonsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(lessonsIds, 'session')).to.be.true;
      expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(lessonsIds, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
      expect(oracleStorage.deleteObj.calledTwice).to.be.true;
      expect(oracleStorage.deleteObj.firstCall.calledWith(fullCourseData._id, files[0])).to.be.true;
      expect(oracleStorage.deleteObj.secondCall.calledWith(fullCourseData._id, files[1])).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course removed successfully');
    });

    // Test case for remove course with there is reviews, lessons, no files and success call methods inside function
    it("remove course with there is reviews, lessons, no files and success call methods inside function", async () => {
      // remove files from files
      files = [];
      getAllObjStub.returns(files);
      // Call the removeCourse function
      const result = await courseService.removeCourse(fullCourseData._id);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(userModel.removeCourseFromList.calledOnceWith(
        fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
      expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonModel.deleteAllLessonsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(lessonsIds, 'session')).to.be.true;
      expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(lessonsIds, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course removed successfully');
    });

    // Test case for remove course with there is reviews, no lessons, no files and success call methods inside function
    it("remove course with there is reviews, no lessons, no files and success call methods inside function", async () => {
      // remove lessons from lessonsIds
      lessonsIds = [];
      getAllLessonsIdsByCourseIdStub.returns(lessonsIds);
      // remove files from files
      files = [];
      getAllObjStub.returns(files);
      // Call the removeCourse function
      const result = await courseService.removeCourse(fullCourseData._id);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(userModel.removeCourseFromList.calledOnceWith(
        fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
      expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonModel.deleteAllLessonsByCourseId.calledOnce).to.be.false;
      expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
      expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
      expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course removed successfully');
    });

    // Test case for remove course with there is no reviews, no lessons, no files and success call methods inside function
    it("remove course with there is no reviews, no lessons, no files and success call methods inside function", async () => {
      // remove reviews from fullCourseData
      fullCourseData.reviews = [];
      deleteCourseStub.returns(fullCourseData);
      // remove lessons from lessonsIds
      lessonsIds = [];
      getAllLessonsIdsByCourseIdStub.returns(lessonsIds);
      // remove files from files
      files = [];
      getAllObjStub.returns(files);
      // Call the removeCourse function
      const result = await courseService.removeCourse(fullCourseData._id);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(userModel.removeCourseFromList.calledOnceWith(
        fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
      expect(reviewModel.removeAllReviewsByCourseId.calledOnce).to.be.false;
      expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
      expect(lessonModel.deleteAllLessonsByCourseId.calledOnce).to.be.false;
      expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
      expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
      expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course removed successfully');
    });

    // Test case for remove course with there is error in deleteCourse calls and throw error
    it("remove course with there is error in deleteCourse calls and throw error", async () => {
      // change stub for deleteCourse to throw error
      deleteCourseStub.throws(new Error('Error in deleteCourse'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnce).to.be.false;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnce).to.be.false;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnce).to.be.false;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnce).to.be.false;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteCourse');
      }
    });

    // Test case for remove course with there is error in removeCourseFromList calls and throw error
    it("remove course with there is error in removeCourseFromList calls and throw error", async () => {
      // change stub for removeCourseFromList to throw error
      removeCourseFromListStub.throws(new Error('Error in removeCourseFromList'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnce).to.be.false;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnce).to.be.false;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnce).to.be.false;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in removeCourseFromList');
      }
    });

    // Test case for remove course with there is error in removeAllReviewsByCourseId calls and throw error
    it("remove course with there is error in removeAllReviewsByCourseId calls and throw error", async () => {
      // change stub for removeAllReviewsByCourseId to throw error
      removeAllReviewsByCourseIdStub.throws(new Error('Error in removeAllReviewsByCourseId'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnce).to.be.false;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnce).to.be.false;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in removeAllReviewsByCourseId');
      }
    });

    // Test case for remove course with there is error in getAllLessonsIdsByCourseId calls and throw error
    it("remove course with there is error in getAllLessonsIdsByCourseId calls and throw error", async () => {
      // change stub for getAllLessonsIdsByCourseId to throw error
      getAllLessonsIdsByCourseIdStub.throws(new Error('Error in getAllLessonsIdsByCourseId'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnce).to.be.false;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in getAllLessonsIdsByCourseId');
      }
    });

    // Test case for remove course with there is error in deleteAllLessonsByCourseId calls and throw error
    it("remove course with there is error in deleteAllLessonsByCourseId calls and throw error", async () => {
      // change stub for deleteAllLessonsByCourseId to throw error
      deleteAllLessonsByCourseIdStub.throws(new Error('Error in deleteAllLessonsByCourseId'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnce).to.be.false;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteAllLessonsByCourseId');
      }
    });

    // Test case for remove course with there is error in deleteLessonContentByLessonsIdsList calls and throw error
    it("remove course with there is error in deleteLessonContentByLessonsIdsList calls and throw error", async () => {
      // change stub for deleteLessonContentByLessonsIdsList to throw error
      deleteLessonContentByLessonsIdsListStub.throws(new Error('Error in deleteLessonContentByLessonsIdsList'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(lessonsIds, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteLessonContentByLessonsIdsList');
      }
    });

    // Test case for remove course with there is error in deleteAllQuizzezByLessonIdList calls and throw error
    it("remove course with there is error in deleteAllQuizzezByLessonIdList calls and throw error", async () => {
      // change stub for deleteAllQuizzezByLessonIdList to throw error
      deleteAllQuizzezByLessonIdListStub.throws(new Error('Error in deleteAllQuizzezByLessonIdList'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(lessonsIds, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(lessonsIds, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteAllQuizzezByLessonIdList');
      }
    });

    // Test case for remove course with there is error in getAllObj calls and throw error
    it("remove course with there is error in getAllObj calls and throw error", async () => {
      // change stub for getAllObj to throw error
      getAllObjStub.throws(new Error('Error in getAllObj'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(lessonsIds, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(lessonsIds, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in getAllObj');
      }
    });

    // Test case for remove course with there is error in deleteObj calls and throw error
    it("remove course with there is error in deleteObj calls and throw error", async () => {
      // change stub for deleteObj to throw error
      deleteObjStub.throws(new Error('Error in deleteObj'));
      try {
        // Call the removeCourse function
        await courseService.removeCourse(fullCourseData._id);
      } catch (error) {
        // Verify that the function was called with the argument correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.deleteCourse.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(userModel.removeCourseFromList.calledOnceWith(
          fullCourseData.authorId, 'createdList', fullCourseData._id, 'session')).to.be.true;
        expect(reviewModel.removeAllReviewsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.getAllLessonsIdsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonModel.deleteAllLessonsByCourseId.calledOnceWith(fullCourseData._id, 'session')).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonsIdsList.calledOnceWith(lessonsIds, 'session')).to.be.true;
        expect(quizModel.deleteAllQuizzezByLessonIdList.calledOnceWith(lessonsIds, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnceWith(fullCourseData._id)).to.be.true;
        expect(oracleStorage.deleteObj.calledOnceWith(fullCourseData._id, files[0])).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in deleteObj');
      }
    });
  });

});
