import mongoDB, { lessonModel, courseModel, quizModel, lessonContentModel } from '../../databases/mongoDB.js';
import oracleStorage from '../../oracleStorage/oracleStorage.js';
import * as lessonService from '../../services/lessonService.js';
import sinon from "sinon";
import { expect } from "chai";

// Test suite for lessonService functions
describe("lessonService", () => {
  // variables for lesson data
  let lessonData;

  // beforeEach hook to create lesson data and create stub for transaction methods
  beforeEach(() => {
    lessonData = {
      _id: "60f6e1b9b58fe3208a9b8b57",
      title: "Lesson 1",
      courseId: "60f6e1b9b58fe3208a9b8b55",
      sectionId: "60f6e1b9b58fe3208a9b8b56",
      description: "Lesson 1 description",
      timeToFinish: 30,
    };
    sinon.stub(mongoDB, "startSession").returns('session');
    sinon.stub(mongoDB, "commitTransaction").returns('commit');
    sinon.stub(mongoDB, "abortTransaction").returns('abort');
  });

  // afterEach hook to restore the sandbox after each test
  afterEach(() => {
    sinon.restore();
  });


  // Test suite for createNewLesson function
  describe('createNewLesson function', () => {
    // variables for create lesson stub and add lesson to section stub
    let createLessonStub;
    let addLessonToSectionStub;

    // beforeEach hook to stub methods inside function
    beforeEach(() => {
      createLessonStub = sinon.stub(lessonModel, 'createLesson').returns(lessonData);
      addLessonToSectionStub = sinon.stub(courseModel, 'addLessonToSection').returns('Lesson added to section');
    });

    // Test case for create lesson with success call all methods and return success message
    it('create lesson with success call all methods and return success message', async () => {
      // Call the createNewLesson function
      const message = await lessonService.createNewLesson(lessonData);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.createLesson.calledWith(lessonData, 'session')).to.be.true;
      expect(courseModel.addLessonToSection.calledWith(lessonData.courseId, lessonData.sectionId, lessonData._id, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson created and added to course section successfully');
    });

    // Test case for create lesson with error in createLesson function and success call addLessonToSection and return error message
    it('create lesson with error in createLesson function and success call addLessonToSection and return error message', async () => {
      // Mock up createLesson function to throw an error
      createLessonStub.throws(new Error('Error creating lesson'));
      try {
        await lessonService.createNewLesson(lessonData);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.createLesson.calledWith(lessonData, 'session')).to.be.true;
        expect(courseModel.addLessonToSection.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error creating lesson');
      }
    });

    // Test case for create lesson with error in addLessonToSection function and success call createLesson and return error message
    it('create lesson with error in addLessonToSection function and success call createLesson and return error message', async () => {
      // Mock up addLessonToSection function to throw an error
      addLessonToSectionStub.throws(new Error('Error adding lesson to section'));
      try {
        await lessonService.createNewLesson(lessonData);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.createLesson.calledWith(lessonData, 'session')).to.be.true;
        expect(courseModel.addLessonToSection.calledWith(lessonData.courseId, lessonData.sectionId, lessonData._id, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error adding lesson to section');
      }
    });

    // Test case for create lesson with error both createLesson and addLessonToSection functions and return error message
    it('create lesson with error both createLesson and addLessonToSection functions and return error message', async () => {
      // Mock up createLesson function to throw an error
      createLessonStub.throws(new Error('Error creating lesson'));
      addLessonToSectionStub.throws(new Error('Error adding lesson to section'));
      // Call the createNewLesson function
      try {
        await lessonService.createNewLesson(lessonData);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.createLesson.calledWith(lessonData, 'session')).to.be.true;
        expect(courseModel.addLessonToSection.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error creating lesson');
      }
    });
  });


  // Test suite for getLessonDetails function
  describe('getLessonDetails function', () => {

    // Test case for get lesson details with success call getLessonWithContent function and return lesson data
    it('get lesson details with success call getLessonWithContent function and return lesson data', async () => {
      // add lesson content data to lesson data
      lessonData.lessonContent = {
        _id: "60f6e1b9b58fe3208a9b8b58",
        title: "Lesson 1 content",
        type: "text",
        value: "Lesson 1 content value",
        url: null
      };
      // Mock up getLessonWithContent function
      sinon.stub(lessonModel, 'getLessonWithContent').returns(lessonData);
      // Call the getLessonDetails function
      const lesson = await lessonService.getLessonDetails(lessonData._id);
      // Verify that functions called with correct arguments
      expect(lessonModel.getLessonWithContent.calledWith(lessonData._id)).to.be.true;
      // Verify that the function returned the correct lesson data
      expect(lesson).to.equal(lessonData);
    });

    // Test case for get lesson details with error in getLessonWithContent function and return error message
    it('get lesson details with error in getLessonWithContent function and return error message', async () => {
      // Mock up getLessonWithContent function to throw an error
      sinon.stub(lessonModel, 'getLessonWithContent').throws(new Error('Error getting lesson details'));
      // Call the getLessonDetails function
      try {
        await lessonService.getLessonDetails(lessonData._id);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(lessonModel.getLessonWithContent.calledWith(lessonData._id)).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error getting lesson details');
      }
    });
  });


  // Test suite for updateLessonMetadata function
  describe('updateLessonMetadata function', () => {

    // Test case for update lesson metadata with success call updateLesson function and return success message
    it('update lesson metadata with success and return success message', async () => {
      // update object
      const metadata = {
        title: "Lesson 1 updated",
        description: "Lesson 1 description updated",
        timeToFinish: 45
      };
      // Mock up updateLesson function
      sinon.stub(lessonModel, 'updateLesson').returns('Lesson metadata updated successfully');
      // Call the updateLesson function
      const message = await lessonService.updateLessonMetadata(lessonData._id, metadata);
      // Verify that functions called with correct arguments
      expect(lessonModel.updateLesson.calledWith(lessonData._id, metadata)).to.be.true;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson metadata updated successfully');
    });

    // Test case for update lesson metadata with more data in metadata object and return success message
    it('update lesson metadata with more data in metadata object and return success message', async () => {
      // Mock up updateLesson function
      sinon.stub(lessonModel, 'updateLesson').returns('Lesson metadata updated successfully');
      // Call the updateLesson function
      const message = await lessonService.updateLessonMetadata(lessonData._id, lessonData);
      // Verify that functions called with correct arguments
      // Only title, description, and timeToFinish should be updated
      expect(lessonModel.updateLesson.calledWith(lessonData._id, {
        title: lessonData.title,
        description: lessonData.description,
        timeToFinish: lessonData.timeToFinish
      })).to.be.true;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson metadata updated successfully');
    });

    // Test case for update lesson metadata with only one field in metadata object and return success message
    it('update lesson metadata with only one field in metadata object and return success message', async () => {
      // update object
      const metadata = {
        title: "Lesson 1 updated"
      };
      // Mock up updateLesson function
      sinon.stub(lessonModel, 'updateLesson').returns('Lesson metadata updated successfully');
      // Call the updateLesson function
      const message = await lessonService.updateLessonMetadata(lessonData._id, metadata);
      // Verify that functions called with correct arguments
      expect(lessonModel.updateLesson.calledWith(lessonData._id, metadata)).to.be.true;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson metadata updated successfully');
    });

    // Test case for update lesson metadata with error in updateLesson function and return error message
    it('update lesson metadata with error in updateLesson function and return error message', async () => {
      // update object
      const metadata = {
        title: "Lesson 1 updated",
      };
      // Mock up updateLesson function to throw an error
      sinon.stub(lessonModel, 'updateLesson').throws(new Error('Error updating lesson metadata'));
      // Call the updateLesson function
      try {
        await lessonService.updateLessonMetadata(lessonData._id, metadata);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(lessonModel.updateLesson.calledWith(lessonData._id, metadata)).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error updating lesson metadata');
      }
    });
  });


  // Test suite for removeLesson function
  describe('removeLesson function', () => {
    // variables for stubs, lesson content, and files
    let deletelessonStub;
    let deleteQuizStub;
    let removeLessonFromSectionStub;
    let deleteLessonContentByLessonIdStub;
    let getAllObjStub;
    let deleteObjStub;
    let files;

    // before hook to stub methods inside function and create list of files
    beforeEach(() => {
      // list of names of files start with lesson id
      files = [`${lessonData._id}_file1`, `${lessonData._id}_file2`];
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // Mock up All methods with apprpriate return values
      deletelessonStub = sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      deleteQuizStub = sinon.stub(quizModel, 'deleteQuiz').returns('Quiz deleted successfully');
      removeLessonFromSectionStub = sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      deleteLessonContentByLessonIdStub = sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson');
      getAllObjStub = sinon.stub(oracleStorage, 'getAllObj').returns(files);
      deleteObjStub = sinon.stub(oracleStorage, 'deleteObj').returns('File deleted successfully');
    });
    // Test case for remove lesson has content and quiz with success all methods and return success message
    it('remove lesson has content and quiz with success all methods and return success message', async () => {
      // Call the removeLesson function
      const message = await lessonService.removeLesson(lessonData._id);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(quizModel.deleteQuiz.calledOnceWith(lessonData.quiz, 'session')).to.be.true;
      expect(courseModel.removeLessonFromSection.calledOnceWith(
        lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
      )).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(lessonData.courseId)).to.be.true;
      expect(oracleStorage.deleteObj.calledTwice).to.be.true;
      expect(oracleStorage.deleteObj.firstCall.calledWith(lessonData.courseId, files[0])).to.be.true;
      expect(oracleStorage.deleteObj.secondCall.calledWith(lessonData.courseId, files[1])).to.be.true;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson removed with all its content and files successfully');
    });

    // Test case for remove lesson has content only with success all methods and return success message
    it('remove lesson has content only with success all methods and return success message', async () => {
      // remove quiz data from lesson data
      lessonData.quiz = null;
      deletelessonStub.returns(lessonData);
      // Call the removeLesson function
      const message = await lessonService.removeLesson(lessonData._id);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(quizModel.deleteQuiz.calledOnce).to.be.false;
      expect(courseModel.removeLessonFromSection.calledOnceWith(
        lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
      )).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(lessonData.courseId)).to.be.true;
      expect(oracleStorage.deleteObj.calledTwice).to.be.true;
      expect(oracleStorage.deleteObj.firstCall.calledWith(lessonData.courseId, files[0])).to.be.true;
      expect(oracleStorage.deleteObj.secondCall.calledWith(lessonData.courseId, files[1])).to.be.true;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson removed with all its content and files successfully');
    });

    // Test case for remove lesson has quiz only with success all methods and return success message
    it('remove lesson has quiz only with success all methods and return success message', async () => {
      // remove content data from lesson data
      lessonData.content = [];
      deletelessonStub.returns(lessonData);
      // Call the removeLesson function
      const message = await lessonService.removeLesson(lessonData._id);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(quizModel.deleteQuiz.calledOnceWith(lessonData.quiz, 'session')).to.be.true;
      expect(courseModel.removeLessonFromSection.calledOnceWith(
        lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
      )).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonId.calledOnce).to.be.false;
      expect(oracleStorage.getAllObj.calledOnce).to.be.false;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson removed with all its content and files successfully');
    });

    // Test case for remove lesson has no content and quiz with success all methods and return success message
    it('remove lesson has no content and quiz with success all methods and return success message', async () => {
      // Add quiz data to lesson data
      lessonData.content = [];
      lessonData.quiz = null;
      deletelessonStub.returns(lessonData);
      // Call the removeLesson function
      const message = await lessonService.removeLesson(lessonData._id);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(quizModel.deleteQuiz.calledOnce).to.be.false;
      expect(courseModel.removeLessonFromSection.calledOnceWith(
        lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
      )).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonId.calledOnce).to.be.false;
      expect(oracleStorage.getAllObj.calledOnce).to.be.false;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson removed with all its content and files successfully');
    });

    // Test case for remove lesson has content and file list contain different lesson id and return success message
    it('remove lesson has content and file list contain different lesson id and return success message', async () => {
      // remove quiz and add diffrent lesson id to files
      lessonData.quiz = null;
      files[1] = '60f6e1b9b58fe3208a9b8b60_file1';
      deletelessonStub.returns(lessonData);
      getAllObjStub.returns(files);
      // Call the removeLesson function
      const message = await lessonService.removeLesson(lessonData._id);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(courseModel.removeLessonFromSection.calledOnceWith(
        lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
      )).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(lessonData.courseId)).to.be.true;
      expect(oracleStorage.deleteObj.calledOnceWith(lessonData.courseId, files[0])).to.be.true;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson removed with all its content and files successfully');
    });

    // Test case for remove lesson has content and file list not contain lesson id and return success message
    it('remove lesson has content and file list not contain lesson id and return success message', async () => {
      // remove quiz and add diffrent lesson id to files
      lessonData.quiz = null;
      files = ['60f6e1b9b58fe3208a9b8b88_file1', '60f6e1b9b58fe3208a9b8b80_file2'];
      deletelessonStub.returns(lessonData);
      getAllObjStub.returns(files);
      // Call the removeLesson function
      const message = await lessonService.removeLesson(lessonData._id);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(courseModel.removeLessonFromSection.calledOnceWith(
        lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
      )).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(lessonData.courseId)).to.be.true;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson removed with all its content and files successfully');
    });

    // Test case for remove lesson has content and file list is empty and return success message
    it('remove lesson has content and file list is empty and return success message', async () => {
      // remove quiz and add diffrent lesson id to files
      lessonData.quiz = null
      files = [];
      deletelessonStub.returns(lessonData);
      getAllObjStub.returns(files);
      // Call the removeLesson function
      const message = await lessonService.removeLesson(lessonData._id);
      // Verify that functions called with correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(courseModel.removeLessonFromSection.calledOnceWith(
        lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
      )).to.be.true;
      expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
      expect(oracleStorage.getAllObj.calledOnceWith(lessonData.courseId)).to.be.true;
      expect(oracleStorage.deleteObj.calledOnce).to.be.false;
      expect(mongoDB.commitTransaction.calledOnce).to.be.true;
      expect(mongoDB.abortTransaction.calledOnce).to.be.false;
      // Verify that the function returned the correct message
      expect(message).to.equal('Lesson removed with all its content and files successfully');
    });

    // Test case for remove lesson has content and quiz with error in deleteLesson function and return error message
    it('remove lesson has content and quiz with error in deleteLesson function and return error message', async () => {
      // Mock up deleteLesson function to throw an error
      deletelessonStub.throws(new Error('Error deleting lesson'));
      // Call the removeLesson function
      try {
        await lessonService.removeLesson(lessonData._id);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(quizModel.deleteQuiz.calledOnce).to.be.false;
        expect(courseModel.removeLessonFromSection.calledOnce).to.be.false;
        expect(lessonContentModel.deleteLessonContentByLessonId.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error deleting lesson');
      }
    });

    // Test case for remove lesson has content and quiz with error in deleteQuiz function and return error message
    it('remove lesson has content and quiz with error in deleteQuiz function and return error message', async () => {
      // Mock up deleteQuiz function to throw an error
      deleteQuizStub.throws(new Error('Error deleting quiz'));
      // Call the removeLesson function
      try {
        await lessonService.removeLesson(lessonData._id);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(quizModel.deleteQuiz.calledOnceWith(lessonData.quiz, 'session')).to.be.true;
        expect(courseModel.removeLessonFromSection.calledOnce).to.be.false;
        expect(lessonContentModel.deleteLessonContentByLessonId.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error deleting quiz');
      }
    });

    // Test case for remove lesson has content and quiz with error in removeLessonFromSection function and return error message
    it('remove lesson has content and quiz with error in removeLessonFromSection function and return error message', async () => {
      // Mock up removeLessonFromSection function to throw an error
      removeLessonFromSectionStub.throws(new Error('Error removing lesson from section'));
      // Call the removeLesson function
      try {
        await lessonService.removeLesson(lessonData._id);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(quizModel.deleteQuiz.calledOnceWith(lessonData.quiz, 'session')).to.be.true;
        expect(courseModel.removeLessonFromSection.calledOnceWith(
          lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
        )).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonId.calledOnce).to.be.false;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error removing lesson from section');
      }
    });

    // Test case for remove lesson has content and quiz with error in deleteLessonContentByLessonId function and return error message
    it('remove lesson has content and quiz with error in deleteLessonContentByLessonId function and return error message', async () => {
      // Mock up deleteLessonContentByLessonId function to throw an error
      deleteLessonContentByLessonIdStub.throws(new Error('Error deleting lesson content'));
      // Call the removeLesson function
      try {
        await lessonService.removeLesson(lessonData._id);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(quizModel.deleteQuiz.calledOnceWith(lessonData.quiz, 'session')).to.be.true;
        expect(courseModel.removeLessonFromSection.calledOnceWith(
          lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
        )).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnce).to.be.false;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error deleting lesson content');
      }
    });

    // Test case for remove lesson has content and quiz with error in getAllObj function and return error message
    it('remove lesson has content and quiz with error in getAllObj function and return error message', async () => {
      // Mock up getAllObj function to throw an error
      getAllObjStub.throws(new Error('Error getting files in bucket'));
      try {
        await lessonService.removeLesson(lessonData._id);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(quizModel.deleteQuiz.calledOnceWith(lessonData.quiz, 'session')).to.be.true;
        expect(courseModel.removeLessonFromSection.calledOnceWith(
          lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
        )).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnceWith(lessonData.courseId)).to.be.true;
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error getting files in bucket');
      }
    });

    // Test case for remove lesson has content and quiz with error in deleteObj function and return error message
    it('remove lesson has content and quiz with error in deleteObj function and return error message', async () => {
      // Mock up deleteObj function to throw an error
      deleteObjStub.throws(new Error('Error deleting file'));
      // Call the removeLesson function
      try {
        await lessonService.removeLesson(lessonData._id);
      } catch (error) {
        // Verify that functions called with correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonModel.deleteLesson.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(quizModel.deleteQuiz.calledOnceWith(lessonData.quiz, 'session')).to.be.true;
        expect(courseModel.removeLessonFromSection.calledOnceWith(
          lessonData.courseId, lessonData.sectionId, lessonData._id, 'session'
        )).to.be.true;
        expect(lessonContentModel.deleteLessonContentByLessonId.calledOnceWith(lessonData._id, 'session')).to.be.true;
        expect(oracleStorage.getAllObj.calledOnceWith(lessonData.courseId)).to.be.true;
        expect(oracleStorage.deleteObj.calledOnceWith(lessonData.courseId, files[0])).to.be.true;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error deleting file');
      }
    });
  });

}).timeout(5000);
