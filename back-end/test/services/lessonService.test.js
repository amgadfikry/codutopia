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

    // Test case for create lesson with success call all methods and return success message
    it('create lesson with success call all methods and return success message', async () => {
      // Mock up createLesson and addLessonToSection functions
      sinon.stub(lessonModel, 'createLesson').returns(lessonData);
      sinon.stub(courseModel, 'addLessonToSection').returns('Lesson added to section');
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
      sinon.stub(lessonModel, 'createLesson').throws(new Error('Error creating lesson'));
      // spy on addLessonToSection function
      sinon.spy(courseModel, 'addLessonToSection');
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

    // Test case for create lesson with error in addLessonToSection function and success call createLesson and return error message
    it('create lesson with error in addLessonToSection function and success call createLesson and return error message', async () => {
      // Mock up createLesson and addLessonToSection functions
      sinon.stub(lessonModel, 'createLesson').returns(lessonData);
      sinon.stub(courseModel, 'addLessonToSection').throws(new Error('Error adding lesson to section'));
      // Call the createNewLesson function
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
      sinon.stub(lessonModel, 'createLesson').throws(new Error('Error creating lesson'));
      sinon.stub(courseModel, 'addLessonToSection').throws(new Error('Error adding lesson to section'));
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

    // Test case for remove lesson has content and quiz with success all methods and return success message
    it('remove lesson has content and quiz with success all methods and return success message', async () => {
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // list of names of files start with lesson id
      const files = [`${lessonData._id}_file1`, `${lessonData._id}_file2`];
      // Mock up All methods with apprpriate return values
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(quizModel, 'deleteQuiz').returns('Quiz deleted successfully');
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson content deleted successfully');
      sinon.stub(oracleStorage, 'getAllObj').returns(files);
      sinon.stub(oracleStorage, 'deleteObj').returns('File deleted successfully');
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
      // Add content data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      // list of names of files start with lesson id
      const files = [`${lessonData._id}_file1`, `${lessonData._id}_file2`];
      // Mock up All methods with apprpriate return values
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson content deleted successfully');
      sinon.stub(oracleStorage, 'getAllObj').returns(files);
      sinon.stub(oracleStorage, 'deleteObj').returns('File deleted successfully');
      // spy on deleteQuiz function
      sinon.spy(quizModel, 'deleteQuiz');
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
      // Add quiz data to lesson data
      lessonData.content = [];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // Mock up All methods with apprpriate return values
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(quizModel, 'deleteQuiz').returns('Quiz deleted successfully');
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      // spy on deleteLessonContentByLessonId, getAllObj, and deleteObj functions
      sinon.spy(lessonContentModel, 'deleteLessonContentByLessonId');
      sinon.spy(oracleStorage, 'getAllObj');
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Mock up All methods with apprpriate return values
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      // spy on deleteQuiz, deleteLessonContentByLessonId, getAllObj, and deleteObj functions
      sinon.spy(quizModel, 'deleteQuiz');
      sinon.spy(lessonContentModel, 'deleteLessonContentByLessonId');
      sinon.spy(oracleStorage, 'getAllObj');
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = null
      // list of names of files start with lesson id
      const files = [`${lessonData._id}_file1`, '60f6e1b9b58fe3208a9b8b60_file2'];
      // Mock up All methods with apprpriate return values
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson content deleted successfully');
      sinon.stub(oracleStorage, 'getAllObj').returns(files);
      sinon.stub(oracleStorage, 'deleteObj').returns('File deleted successfully');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = null
      // list of names of files start with lesson id
      const files = ['60f6e1b9b58fe3208a9b8b88_file1', '60f6e1b9b58fe3208a9b8b80_file2'];
      // Mock up All methods with apprpriate return values
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson content deleted successfully');
      sinon.stub(oracleStorage, 'getAllObj').returns(files);
      // spy on deleteObj function
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = null
      // list of names of files start with lesson id
      const files = [];
      // Mock up All methods with apprpriate return values
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson content deleted successfully');
      sinon.stub(oracleStorage, 'getAllObj').returns(files);
      // spy on deleteObj function
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // Mock up deleteLesson function to throw an error
      sinon.stub(lessonModel, 'deleteLesson').throws(new Error('Error deleting lesson'));
      // spy on deleteQuiz, removeLessonFromSection, deleteLessonContentByLessonId, getAllObj, and deleteObj functions
      sinon.spy(quizModel, 'deleteQuiz');
      sinon.spy(courseModel, 'removeLessonFromSection');
      sinon.spy(lessonContentModel, 'deleteLessonContentByLessonId');
      sinon.spy(oracleStorage, 'getAllObj');
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // Mock up deleteQuiz function to throw an error
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(quizModel, 'deleteQuiz').throws(new Error('Error deleting quiz'));
      // spy on removeLessonFromSection, deleteLessonContentByLessonId, getAllObj, and deleteObj functions
      sinon.spy(courseModel, 'removeLessonFromSection');
      sinon.spy(lessonContentModel, 'deleteLessonContentByLessonId');
      sinon.spy(oracleStorage, 'getAllObj');
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // Mock up removeLessonFromSection function to throw an error
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(quizModel, 'deleteQuiz').returns('Quiz deleted successfully');
      sinon.stub(courseModel, 'removeLessonFromSection').throws(new Error('Error removing lesson from section'));
      // spy on deleteLessonContentByLessonId, getAllObj, and deleteObj functions
      sinon.spy(lessonContentModel, 'deleteLessonContentByLessonId');
      sinon.spy(oracleStorage, 'getAllObj');
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // Mock up deleteLessonContentByLessonId function to throw an error
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(quizModel, 'deleteQuiz').returns('Quiz deleted successfully');
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').throws(new Error('Error deleting lesson content'));
      // spy on getAllObj and deleteObj functions
      sinon.spy(oracleStorage, 'getAllObj');
      sinon.spy(oracleStorage, 'deleteObj');
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
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // Mock up getAllObj function to throw an error
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(quizModel, 'deleteQuiz').returns('Quiz deleted successfully');
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson content deleted successfully');
      sinon.stub(oracleStorage, 'getAllObj').throws(new Error('Error getting files in bucket'));
      // spy on deleteObj function
      sinon.spy(oracleStorage, 'deleteObj');
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
        expect(oracleStorage.deleteObj.calledOnce).to.be.false;
        expect(mongoDB.commitTransaction.calledOnce).to.be.false;
        expect(mongoDB.abortTransaction.calledOnce).to.be.true;
        // Verify that the function returned the correct error message
        expect(error.message).to.equal('Error getting files in bucket');
      }
    });

    // Test case for remove lesson has content and quiz with error in deleteObj function and return error message
    it('remove lesson has content and quiz with error in deleteObj function and return error message', async () => {
      // Add content and quiz data to lesson data
      lessonData.content = ['60f6e1b9b58fe3208a9b8b58'];
      lessonData.quiz = '60f6e1b9b58fe3208a9b8b59';
      // list of names of files start with lesson id
      const files = [`${lessonData._id}_file1`, `${lessonData._id}_file2`];
      // Mock up deleteObj function to throw an error
      sinon.stub(lessonModel, 'deleteLesson').returns(lessonData);
      sinon.stub(quizModel, 'deleteQuiz').returns('Quiz deleted successfully');
      sinon.stub(courseModel, 'removeLessonFromSection').returns('Lesson removed from section');
      sinon.stub(lessonContentModel, 'deleteLessonContentByLessonId').returns('Lesson content deleted successfully');
      sinon.stub(oracleStorage, 'getAllObj').returns(files);
      sinon.stub(oracleStorage, 'deleteObj').throws(new Error('Error deleting file'));
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
