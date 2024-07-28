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

    // Test case for create new course with success call all methods and return success message
    it("create new course with success call all methods and return success message", async () => {
      // Mock the createCourse, addCourseToWishlistorCreatedList functions, and createBucket function
      sinon.stub(courseModel, "createCourse").returns(returnCourseData);
      sinon.stub(userModel, "addCourseToWishlistorCreatedList").returns('added');
      sinon.stub(oracleStorage, "createBucket").returns('bucket');
      // Call the createNewCourse function
      const result = await courseService.createNewCourse(courseData);
      // Verify that the functions were called with the arguments correctly
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(courseModel.createCourse.calledOnceWith(courseData, 'session')).to.be.true;
      expect(userModel.addCourseToWishlistorCreatedList.calledOnceWith(courseData.authorId, courseData._id, 'session')).to.be.true;
      expect(oracleStorage.createBucket.calledOnceWith(courseData._id)).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Check if the result is as expected
      expect(result).to.equal('Course created successfully');
    });

    // Test case for create new course with error in createCourse calls and throw error
    it("create new course with error in createCourse calls and throw error", async () => {
      // Mock the createCourse function to throw an error
      sinon.stub(courseModel, "createCourse").throws(new Error('Error in createCourse'));
      // Spy on the addCourseToWishlistorCreatedList and createBucket functions
      sinon.spy(userModel, "addCourseToWishlistorCreatedList");
      sinon.spy(oracleStorage, "createBucket");
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
      sinon.stub(courseModel, "createCourse").returns(returnCourseData);
      sinon.stub(userModel, "addCourseToWishlistorCreatedList").throws(new Error('Error in addCourseToWishlistorCreatedList'));
      // Spy on the createBucket function
      sinon.spy(oracleStorage, "createBucket");
      try {
        // Call the createNewCourse function
        await courseService.createNewCourse(courseData);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.createCourse.calledOnceWith(courseData, 'session')).to.be.true;
        expect(userModel.addCourseToWishlistorCreatedList.calledOnceWith(courseData.authorId, courseData._id, 'session')).to.be.true;
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
      sinon.stub(courseModel, "createCourse").returns(returnCourseData);
      sinon.stub(userModel, "addCourseToWishlistorCreatedList").returns('added');
      sinon.stub(oracleStorage, "createBucket").throws(new Error('Error in createBucket'));
      try {
        // Call the createNewCourse function
        await courseService.createNewCourse(courseData);
      } catch (error) {
        // Verify that the functions were called with the arguments correctly
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(courseModel.createCourse.calledOnceWith(courseData, 'session')).to.be.true;
        expect(userModel.addCourseToWishlistorCreatedList.calledOnceWith(courseData.authorId, courseData._id, 'session')).to.be.true;
        expect(oracleStorage.createBucket.calledOnceWith(courseData._id)).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // Check if the error message is as expected
        expect(error.message).to.equal('Error in createBucket');
      }
    });

    // Test case for create new course with error in calls of all methods and throw error
    it("create new course with error in calls of all methods and throw error", async () => {
      // Mock the createCourse function to throw an error
      sinon.stub(courseModel, "createCourse").throws(new Error('Error in createCourse'));
      sinon.stub(userModel, "addCourseToWishlistorCreatedList").throws(new Error('Error in addCourseToWishlistorCreatedList'));
      sinon.stub(oracleStorage, "createBucket").throws(new Error('Error in createBucket'));
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

    // beforeEach test define updatedCourseData object
    beforeEach(() => {
      updatedCourseData = {
        title: "Test Course Updated",
        description: "Test Description Updated",
        price: 200,
        discount: 20,
      };
    });

    // Test case for update course metadata without image data with success call all methods and return success message
    it("update course metadata without image data with success call all methods and return success message", async () => {
      // Mock the updateCourseMetadata, uploadImageToBucket, and updateCourseImage functions
      sinon.stub(courseModel, "updateCourse").returns('updated');
      // spy on the other methods
      sinon.spy(oracleStorage, "createObj");
      sinon.spy(oracleStorage, "createUrl");
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
      // Mock the updateCourseMetadata, uploadImageToBucket, and updateCourseImage functions
      sinon.stub(courseModel, "updateCourse").returns('updated');
      // spy on the other methods
      sinon.spy(oracleStorage, "createObj");
      sinon.spy(oracleStorage, "createUrl");
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
      sinon.stub(courseModel, "updateCourse").throws(new Error('Error in updateCourse'));
      // spy on the other methods
      sinon.spy(oracleStorage, "createObj");
      sinon.spy(oracleStorage, "createUrl");
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
      // Mock the updateCourseMetadata, uploadImageToBucket, and updateCourseImage functions
      sinon.stub(courseModel, "updateCourse").returns('updated');
      sinon.stub(oracleStorage, "createObj").returns('uploaded');
      sinon.stub(oracleStorage, "createUrl").returns('url');
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
      // Mock the updateCourseMetadata, uploadImageToBucket, and updateCourseImage functions
      sinon.stub(courseModel, "updateCourse").returns('updated');
      sinon.stub(oracleStorage, "createObj").returns('uploaded');
      sinon.stub(oracleStorage, "createUrl").returns('url');
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
      // Mock the updateCourseMetadata, uploadImageToBucket, and updateCourseImage functions
      sinon.stub(courseModel, "updateCourse").returns('updated');
      sinon.stub(oracleStorage, "createObj").throws(new Error('Error in createObj'));
      sinon.spy(oracleStorage, "createUrl");
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
      // Mock the updateCourseMetadata, uploadImageToBucket, and updateCourseImage functions
      sinon.stub(courseModel, "updateCourse").returns('updated');
      sinon.stub(oracleStorage, "createObj").returns('uploaded');
      sinon.stub(oracleStorage, "createUrl").throws(new Error('Error in createUrl'));
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
      sinon.stub(courseModel, "updateCourse").throws(new Error('Error in updateCourse'));
      sinon.stub(oracleStorage, "createObj").returns('uploaded');
      sinon.stub(oracleStorage, "createUrl").returns('url');
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
    });

    // Test case for remove section with success call methods inside function and return success message
    it("remove section with success call methods inside function and return success message", async () => {
      // Mock all methods with suitable returns value
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      sinon.stub(lessonModel, "deleteAllLessonsBySectionId").returns('deleted');
      sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").returns('deleted');
      sinon.stub(quizModel, "deleteAllQuizzezByLessonIdList").returns('deleted');
      sinon.stub(oracleStorage, "getAllObj").returns(files);
      sinon.stub(oracleStorage, "deleteObj").returns('deleted');
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
      // Mock all methods with suitable returns value
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      sinon.stub(lessonModel, "deleteAllLessonsBySectionId").returns('deleted');
      sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").returns('deleted');
      sinon.stub(quizModel, "deleteAllQuizzezByLessonIdList").returns('deleted');
      sinon.stub(oracleStorage, "getAllObj").returns(files);
      sinon.stub(oracleStorage, "deleteObj").returns('deleted');
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
      // Mock all methods with suitable returns value
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      // spy on the other methods
      sinon.spy(lessonModel, "deleteAllLessonsBySectionId");
      sinon.spy(lessonContentModel, "deleteLessonContentByLessonsIdsList");
      sinon.spy(quizModel, "deleteAllQuizzezByLessonIdList");
      sinon.spy(oracleStorage, "getAllObj");
      sinon.spy(oracleStorage, "deleteObj");
      // Call the removeSection function
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
      sinon.stub(courseModel, "removeSectionFromCourse").throws(new Error('Error in removeSectionFromCourse'));
      // spy on the other methods
      sinon.spy(lessonModel, "deleteAllLessonsBySectionId");
      sinon.spy(lessonContentModel, "deleteLessonContentByLessonsIdsList");
      sinon.spy(quizModel, "deleteAllQuizzezByLessonIdList");
      sinon.spy(oracleStorage, "getAllObj");
      sinon.spy(oracleStorage, "deleteObj");
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
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      sinon.stub(lessonModel, "deleteAllLessonsBySectionId").throws(new Error('Error in deleteAllLessonsBySectionId'));
      // spy on the other methods
      sinon.spy(lessonContentModel, "deleteLessonContentByLessonsIdsList");
      sinon.spy(quizModel, "deleteAllQuizzezByLessonIdList");
      sinon.spy(oracleStorage, "getAllObj");
      sinon.spy(oracleStorage, "deleteObj");
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
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      sinon.stub(lessonModel, "deleteAllLessonsBySectionId").returns('deleted');
      sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").throws(new Error('Error in deleteLessonContentByLessonsIdsList'));
      // spy on the other methods
      sinon.spy(quizModel, "deleteAllQuizzezByLessonIdList");
      sinon.spy(oracleStorage, "getAllObj");
      sinon.spy(oracleStorage, "deleteObj");
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
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      sinon.stub(lessonModel, "deleteAllLessonsBySectionId").returns('deleted');
      sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").returns('deleted');
      sinon.stub(quizModel, "deleteAllQuizzezByLessonIdList").throws(new Error('Error in deleteAllQuizzezByLessonIdList'));
      // spy on the other methods
      sinon.spy(oracleStorage, "getAllObj");
      sinon.spy(oracleStorage, "deleteObj");
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
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      sinon.stub(lessonModel, "deleteAllLessonsBySectionId").returns('deleted');
      sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").returns('deleted');
      sinon.stub(quizModel, "deleteAllQuizzezByLessonIdList").returns('deleted');
      sinon.stub(oracleStorage, "getAllObj").throws(new Error('Error in getAllObj'));
      // spy on the other methods
      sinon.spy(oracleStorage, "deleteObj");
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
      sinon.stub(courseModel, "removeSectionFromCourse").returns(fullCourseData.sections[0]);
      sinon.stub(lessonModel, "deleteAllLessonsBySectionId").returns('deleted');
      sinon.stub(lessonContentModel, "deleteLessonContentByLessonsIdsList").returns('deleted');
      sinon.stub(quizModel, "deleteAllQuizzezByLessonIdList").returns('deleted');
      sinon.stub(oracleStorage, "getAllObj").returns(files);
      sinon.stub(oracleStorage, "deleteObj").throws(new Error('Error in deleteObj'));
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

});
