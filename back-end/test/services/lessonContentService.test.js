import mongoDB, { lessonModel, lessonContentModel } from "../../databases/mongoDB.js";
import oracleStorage from '../../oracleStorage/oracleStorage.js';
import * as lessonContentService from "../../services/lessonContentService.js";
import sinon from "sinon";
import { expect } from "chai";


// Test suite for lessonContentService functions
describe("lessonContentService", () => {

  // beforeEach hook to create stubs for the startSession, commitTransaction, and abortTransaction functions
  beforeEach(() => {
    // Mock the startSession, commitTransaction, and abortTransaction functions
    sinon.stub(mongoDB, "startSession").returns('session');
    sinon.stub(mongoDB, "commitTransaction").returns('commit');
    sinon.stub(mongoDB, "abortTransaction").returns('abort');
  });

  // After each test suite, restore the default sandbox
  afterEach(() => {
    sinon.restore();
  });


  // Test suite for createNewContent function
  describe("createNewContent", () => {
    let lessonContentData;
    let courseId;
    let fileName;
    let file;

    // beforeEach hook to create a lesson content data object
    beforeEach(() => {
      lessonContentData = {
        _id: 'lessonContentId',
        lessonId: 'lessonId',
        title: 'content title',
        type: 'video',
        value: 'content value'
      };
      courseId = 'courseId';
      fileName = `${lessonContentData.lessonId}_${lessonContentData.value}`;
      file = 'file';
    });

    // afterEach hook to restore the default sandbox
    afterEach(() => {
      sinon.restore();
    });

    // Test case to create new content with type other than text with success of all steps and return success message
    it('create new content with type other than text with success of all steps and return success message', async () => {
      // Mock createObj, createLessonContent, and addContentToLesson functions
      sinon.stub(oracleStorage, "createObj").returns('file');
      sinon.stub(oracleStorage, "createUrl").returns('url');
      sinon.stub(lessonContentModel, "createLessonContent").returns(lessonContentData);
      sinon.stub(lessonModel, "addContentToLesson").returns('content added');
      // spies on createUrl and deleteOb functions
      sinon.spy(oracleStorage, "deleteObj");
      // call createNewContent function
      const result = await lessonContentService.createNewContent(courseId, lessonContentData, file);
      // verify are called with the correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(oracleStorage.createObj.calledOnceWith(courseId, fileName, file)).to.be.true;
      expect(oracleStorage.createUrl.calledOnceWith(courseId, fileName)).to.be.true;
      expect(lessonContentModel.createLessonContent.calledOnceWith(lessonContentData, 'session')).to.be.true;
      expect(lessonModel.addContentToLesson.calledOnceWith(lessonContentData.lessonId, lessonContentData._id, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(oracleStorage.deleteObj.notCalled).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // check if the result is the expected message
      expect(result).to.equal('Content created and added to the lesson successfully');
      expect(lessonContentData.url).to.equal('url');
    });

    // Test case to create new content with type other than text without file and throw an error
    it('create new content with type other than text without file and throw an error', async () => {
      // spy on all functions to check if they are called
      sinon.spy(oracleStorage, "createObj");
      sinon.spy(oracleStorage, "createUrl");
      sinon.spy(lessonContentModel, "createLessonContent");
      sinon.spy(lessonModel, "addContentToLesson");
      sinon.spy(oracleStorage, "deleteObj");
      try {
        await lessonContentService.createNewContent(courseId, lessonContentData);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.notCalled).to.be.true;
        expect(oracleStorage.createUrl.notCalled).to.be.true;
        expect(lessonContentModel.createLessonContent.notCalled).to.be.true;
        expect(lessonModel.addContentToLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(oracleStorage.deleteObj.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('File is required for this content type');
      }
    });

    // Test case to create new content with type other than text with error in createObj and throw an error
    it('create new content with type other than text with error in createObj and throw an error', async () => {
      // Mock createObj function to throw an error
      sinon.stub(oracleStorage, "createObj").throws(new Error('Failed to create file'));
      // spy on all functions to check if they are called
      sinon.spy(oracleStorage, "createUrl");
      sinon.spy(lessonContentModel, "createLessonContent");
      sinon.spy(lessonModel, "addContentToLesson");
      sinon.spy(oracleStorage, "deleteObj");
      try {
        await lessonContentService.createNewContent(courseId, lessonContentData, file);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnceWith(courseId, fileName, file)).to.be.true;
        expect(oracleStorage.createUrl.notCalled).to.be.true;
        expect(lessonContentModel.createLessonContent.notCalled).to.be.true;
        expect(lessonModel.addContentToLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(oracleStorage.deleteObj.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to create file');
      }
    });

    // Test case to create new content with type other than text with error in createLessonContent and throw an error
    it('create new content with type other than text with error in createLessonContent and throw an error', async () => {
      // Mock createObj and createUrl and deleteObj functions
      sinon.stub(oracleStorage, "createObj").returns('file');
      sinon.stub(oracleStorage, "createUrl").returns('url');
      sinon.stub(oracleStorage, "deleteObj").returns('deleted');
      // Mock createLessonContent function to throw an error
      sinon.stub(lessonContentModel, "createLessonContent").throws(new Error('Failed to create lesson content'));
      // spy on all functions to check if they are called
      sinon.spy(lessonModel, "addContentToLesson");
      try {
        await lessonContentService.createNewContent(courseId, lessonContentData, file);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnceWith(courseId, fileName, file)).to.be.true;
        expect(oracleStorage.createUrl.calledOnceWith(courseId, fileName)).to.be.true;
        expect(lessonContentModel.createLessonContent.calledOnceWith(lessonContentData, 'session')).to.be.true;
        expect(lessonModel.addContentToLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(oracleStorage.deleteObj.calledOnceWith(courseId, fileName)).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to create lesson content');
      }
    });

    // Test case to create new content with type other than text with error in addContentToLesson and throw an error
    it('create new content with type other than text with error in addContentToLesson and throw an error', async () => {
      // Mock createObj, createUrl, and createLessonContent functions
      sinon.stub(oracleStorage, "createObj").returns('file');
      sinon.stub(oracleStorage, "createUrl").returns('url');
      sinon.stub(lessonContentModel, "createLessonContent").returns(lessonContentData);
      sinon.stub(oracleStorage, "deleteObj").returns('deleted');
      // Mock addContentToLesson function to throw an error
      sinon.stub(lessonModel, "addContentToLesson").throws(new Error('Failed to add content to lesson'));
      try {
        await lessonContentService.createNewContent(courseId, lessonContentData, file);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.calledOnceWith(courseId, fileName, file)).to.be.true;
        expect(oracleStorage.createUrl.calledOnceWith(courseId, fileName)).to.be.true;
        expect(lessonContentModel.createLessonContent.calledOnceWith(lessonContentData, 'session')).to.be.true;
        expect(lessonModel.addContentToLesson.calledOnceWith(lessonContentData.lessonId, lessonContentData._id, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(oracleStorage.deleteObj.calledOnceWith(courseId, fileName)).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to add content to lesson');
      }
    });

    // Test case to create new content with type text with success of all steps and return success message
    it('create new content with type text with success of all steps and return success message', async () => {
      // change type to text
      lessonContentData.type = 'text';
      // Mock createLessonContent and addContentToLesson functions
      sinon.stub(lessonContentModel, "createLessonContent").returns(lessonContentData);
      sinon.stub(lessonModel, "addContentToLesson").returns('content added');
      // spies on createObj, createUrl, and deleteObj functions
      sinon.spy(oracleStorage, "createObj");
      sinon.spy(oracleStorage, "createUrl");
      sinon.spy(oracleStorage, "deleteObj");
      // call createNewContent function
      const result = await lessonContentService.createNewContent(courseId, lessonContentData);
      // verify are called with the correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(oracleStorage.createObj.notCalled).to.be.true;
      expect(oracleStorage.createUrl.notCalled).to.be.true;
      expect(lessonContentModel.createLessonContent.calledOnceWith(lessonContentData, 'session')).to.be.true;
      expect(lessonModel.addContentToLesson.calledOnceWith(lessonContentData.lessonId, lessonContentData._id, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(oracleStorage.deleteObj.notCalled).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // check if the result is the expected message
      expect(result).to.equal('Content created and added to the lesson successfully');
      expect(lessonContentData.url).to.be.undefined;
    });

    // Test case to create new content with type text with error in createLessonContent and throw an error
    it('create new content with type text with error in createLessonContent and throw an error', async () => {
      // change type to text
      lessonContentData.type = 'text';
      // Mock createLessonContent function to throw an error
      sinon.stub(lessonContentModel, "createLessonContent").throws(new Error('Failed to create lesson content'));
      // spy on all functions to check if they are called
      sinon.spy(lessonModel, "addContentToLesson");
      sinon.spy(oracleStorage, "deleteObj");
      sinon.spy(oracleStorage, "createObj");
      sinon.spy(oracleStorage, "createUrl");
      try {
        await lessonContentService.createNewContent(courseId, lessonContentData);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.notCalled).to.be.true;
        expect(oracleStorage.createUrl.notCalled).to.be.true;
        expect(lessonContentModel.createLessonContent.calledOnceWith(lessonContentData, 'session')).to.be.true;
        expect(lessonModel.addContentToLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(oracleStorage.deleteObj.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to create lesson content');
      }
    });

    // Test case to create new content with type text with error in addContentToLesson and throw an error
    it('create new content with type text with error in addContentToLesson and throw an error', async () => {
      // change type to text
      lessonContentData.type = 'text';
      // Mock createLessonContent function
      sinon.stub(lessonContentModel, "createLessonContent").returns(lessonContentData);
      // Mock addContentToLesson function to throw an error
      sinon.stub(lessonModel, "addContentToLesson").throws(new Error('Failed to add content to lesson'));
      // spies on createObj, createUrl, and deleteObj functions
      sinon.spy(oracleStorage, "createObj");
      sinon.spy(oracleStorage, "createUrl");
      sinon.spy(oracleStorage, "deleteObj");
      try {
        await lessonContentService.createNewContent(courseId, lessonContentData);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(oracleStorage.createObj.notCalled).to.be.true;
        expect(oracleStorage.createUrl.notCalled).to.be.true;
        expect(lessonContentModel.createLessonContent.calledOnceWith(lessonContentData, 'session')).to.be.true;
        expect(lessonModel.addContentToLesson.calledOnceWith(lessonContentData.lessonId, lessonContentData._id, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(oracleStorage.deleteObj.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to add content to lesson');
      }
    });
  });


  // Test suite for getOneContent function
  describe("getOneContent", () => {
    let contentId;
    let lessonContentData;

    // beforeEach hook to create a lesson content data object
    beforeEach(() => {
      contentId = 'contentId';
      lessonContentData = {
        _id: contentId,
        lessonId: 'lessonId',
        title: 'content title',
        type: 'text',
        value: 'content value'
      };
    });

    // afterEach hook to restore the default sandbox
    afterEach(() => {
      sinon.restore();
    });

    // Test case to get one content with success and return the content object
    it('get one content with success and return the content object', async () => {
      // Mock getLessonContent function
      sinon.stub(lessonContentModel, "getLessonContent").returns(lessonContentData);
      // call getOneContent function
      const result = await lessonContentService.getOneContent(contentId);
      // verify are called with the correct arguments
      expect(lessonContentModel.getLessonContent.calledOnceWith(contentId)).to.be.true;
      // check if the result is the expected content object
      expect(result).to.equal(lessonContentData);
    });

    // Test case to get one content with error in getLessonContent and throw an error
    it('get one content with error in getLessonContent and throw an error', async () => {
      // Mock getLessonContent function to throw an error
      sinon.stub(lessonContentModel, "getLessonContent").throws(new Error('Failed to get lesson content'));
      try {
        await lessonContentService.getOneContent(contentId);
      } catch (error) {
        // verify are called with the correct arguments
        expect(lessonContentModel.getLessonContent.calledOnceWith(contentId)).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to get lesson content');
      }
    });
  });


  // Test suite for getAllContentsForLesson function
  describe("getAllContentsForLesson", () => {
    let lessonId;
    let lessonContentData;

    // beforeEach hook to create a lesson content data object
    beforeEach(() => {
      lessonId = 'lessonId';
      lessonContentData = [
        {
          _id: 'contentId1',
          lessonId: lessonId,
          title: 'content title 1',
          type: 'text',
          value: 'content value 1'
        },
        {
          _id: 'contentId2',
          lessonId: lessonId,
          title: 'content title 2',
          type: 'video',
          value: 'content value 2'
        }
      ];
    });

    // afterEach hook to restore the default sandbox
    afterEach(() => {
      sinon.restore();
    });

    // Test case to get all contents for a lesson with success and return the contents array
    it('get all contents for a lesson with success and return the contents array', async () => {
      // Mock getLessonContentByLessonId function
      sinon.stub(lessonContentModel, "getLessonContentByLessonId").returns(lessonContentData);
      // call getAllContentsForLesson function
      const result = await lessonContentService.getAllContentsForLesson(lessonId);
      // verify are called with the correct arguments
      expect(lessonContentModel.getLessonContentByLessonId.calledOnceWith(lessonId)).to.be.true;
      // check if the result is the expected contents array
      expect(result).to.equal(lessonContentData);
    });

    // Test case to get all contents for a lesson with error in getLessonContentByLessonId and throw an error
    it('get all contents for a lesson with error in getLessonContentByLessonId and throw an error', async () => {
      // Mock getLessonContentByLessonId function to throw an error
      sinon.stub(lessonContentModel, "getLessonContentByLessonId").throws(new Error('Failed to get lesson content'));
      try {
        await lessonContentService.getAllContentsForLesson(lessonId);
      } catch (error) {
        // verify are called with the correct arguments
        expect(lessonContentModel.getLessonContentByLessonId.calledOnceWith(lessonId)).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to get lesson content');
      }
    });
  });


  // Test suite for updateMetaDataOrTextContent function
  describe("updateMetaDataOrTextContent", () => {
    let contentId;
    let content;

    // beforeEach hook to create a content object
    beforeEach(() => {
      contentId = 'contentId';
      content = {
        title: 'content title',
        type: 'text',
        value: 'content value'
      };
    });

    // afterEach hook to restore the default sandbox
    afterEach(() => {
      sinon.restore();
    });

    // Test case to update metadata of non-text content with success and return success message
    it('update metadata of non-text content with success and return success message', async () => {
      // make type is video
      content.type = 'video';
      // Mock updateLessonContent function
      sinon.stub(lessonContentModel, "updateLessonContent").returns('content updated');
      // call updateMetaDataOrTextContent function
      const result = await lessonContentService.updateMetaDataOrTextContent(contentId, content);
      // verify are called with the correct arguments
      // remove value from content object and type
      delete content.value;
      delete content.type;
      expect(lessonContentModel.updateLessonContent.calledOnceWith(contentId, content)).to.be.true;
      // check if the result is the expected message
      expect(result).to.equal('Content updated successfully');
    });

    // Test case to update metadata of text content with success and return success message
    it('update metadata of text content with success and return success message', async () => {
      // Mock updateLessonContent function
      sinon.stub(lessonContentModel, "updateLessonContent").returns('content updated');
      // call updateMetaDataOrTextContent function
      const result = await lessonContentService.updateMetaDataOrTextContent(contentId, content);
      // verify are called with the correct arguments
      // delete type from content object
      delete content.type;
      expect(lessonContentModel.updateLessonContent.calledOnceWith(contentId, content)).to.be.true;
      // check if the result is the expected message
      expect(result).to.equal('Content updated successfully');
    });

    // Test case to update metadata of content with error in updateLessonContent and throw an error
    it('update metadata of content with error in updateLessonContent and throw an error', async () => {
      // Mock updateLessonContent function to throw an error
      sinon.stub(lessonContentModel, "updateLessonContent").throws(new Error('Failed to update lesson content'));
      try {
        await lessonContentService.updateMetaDataOrTextContent(contentId, content);
      } catch (error) {
        // verify are called with the correct arguments
        delete content.type;
        expect(lessonContentModel.updateLessonContent.calledOnceWith(contentId, content)).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to update lesson content');
      }
    });
  });


  // Test suite for removeOneContent function
  describe("removeOneContent", () => {
    let contentId;
    let courseId;

    // beforeEach hook to create a contentId
    beforeEach(() => {
      contentId = 'contentId';
      courseId = 'courseId';
    });

    // afterEach hook to restore the default sandbox
    afterEach(() => {
      sinon.restore();
    });

    // Test case to remove content that has type not text with success and return success message
    it('remove content that has type not text with success and return success message', async () => {
      // obejct of content
      const content = {
        _id: contentId,
        lessonId: 'lessonId',
        title: 'content title',
        type: 'video',
        value: 'content value'
      };
      // Mock deleteLessonContent, deleteObj, and removeContentFromLesson functions
      sinon.stub(lessonContentModel, "deleteLessonContent").returns(content);
      sinon.stub(lessonModel, "removeContentFromLesson").returns('content removed');
      sinon.stub(oracleStorage, "deleteObj").returns('deleted');
      // call removeOneContent function
      const result = await lessonContentService.removeOneContent(courseId, contentId);
      // verify are called with the correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonContentModel.deleteLessonContent.calledOnceWith(contentId, 'session')).to.be.true;
      expect(oracleStorage.deleteObj.calledOnceWith(courseId, `${content.lessonId}_${content.value}`)).to.be.true;
      expect(lessonModel.removeContentFromLesson.calledOnceWith(content.lessonId, contentId, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // check if the result is the expected message
      expect(result).to.equal('Content removed successfully');
    });

    // Test case to remove content that has type text with success and return success message
    it('remove content that has type text with success and return success message', async () => {
      // obejct of content
      const content = {
        _id: contentId,
        lessonId: 'lessonId',
        title: 'content title',
        type: 'text',
        value: 'content value'
      };
      // Mock deleteLessonContent and removeContentFromLesson functions
      sinon.stub(lessonContentModel, "deleteLessonContent").returns(content);
      sinon.stub(lessonModel, "removeContentFromLesson").returns('content removed');
      // spies on deleteObj function
      sinon.spy(oracleStorage, "deleteObj");
      // call removeOneContent function
      const result = await lessonContentService.removeOneContent(courseId, contentId);
      // verify are called with the correct arguments
      expect(mongoDB.startSession.calledOnce).to.be.true;
      expect(lessonContentModel.deleteLessonContent.calledOnceWith(contentId, 'session')).to.be.true;
      expect(oracleStorage.deleteObj.notCalled).to.be.true;
      expect(lessonModel.removeContentFromLesson.calledOnceWith(content.lessonId, contentId, 'session')).to.be.true;
      expect(mongoDB.commitTransaction.calledOnceWith('session')).to.be.true;
      expect(mongoDB.abortTransaction.notCalled).to.be.true;
      // check if the result is the expected message
      expect(result).to.equal('Content removed successfully');
    });

    // Test case to remove content with error in deleteLessonContent and throw an error
    it('remove content with error in deleteLessonContent and throw an error', async () => {
      // Mock deleteLessonContent function to throw an error
      sinon.stub(lessonContentModel, "deleteLessonContent").throws(new Error('Failed to delete lesson content'));
      // spy on all functions to check if they are called
      sinon.spy(oracleStorage, "deleteObj");
      sinon.spy(lessonModel, "removeContentFromLesson");
      try {
        await lessonContentService.removeOneContent(courseId, contentId);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonContentModel.deleteLessonContent.calledOnceWith(contentId, 'session')).to.be.true;
        expect(oracleStorage.deleteObj.notCalled).to.be.true;
        expect(lessonModel.removeContentFromLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to delete lesson content');
      }
    });

    // Test case to remove content with non-text type with error in deleteObj and throw an error
    it('remove content with non-text type with error in deleteObj and throw an error', async () => {
      // obejct of content
      const content = {
        _id: contentId,
        lessonId: 'lessonId',
        title: 'content title',
        type: 'video',
        value: 'content value'
      };
      // Mock deleteLessonContent function
      sinon.stub(lessonContentModel, "deleteLessonContent").returns(content);
      // Mock deleteObj function to throw an error
      sinon.stub(oracleStorage, "deleteObj").throws(new Error('Failed to delete file'));
      // spy on all functions to check if they are called
      sinon.spy(lessonModel, "removeContentFromLesson");
      try {
        await lessonContentService.removeOneContent(courseId, contentId);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonContentModel.deleteLessonContent.calledOnceWith(contentId, 'session')).to.be.true;
        expect(oracleStorage.deleteObj.calledOnceWith(courseId, `${content.lessonId}_${content.value}`)).to.be.true;
        expect(lessonModel.removeContentFromLesson.notCalled).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to delete file');
      }
    });

    // Test case to remove content with error in removeContentFromLesson and throw an error
    it('remove content with error in removeContentFromLesson and throw an error', async () => {
      // obejct of content
      const content = {
        _id: contentId,
        lessonId: 'lessonId',
        title: 'content title',
        type: 'text',
        value: 'content value'
      };
      // Mock deleteLessonContent function
      sinon.stub(lessonContentModel, "deleteLessonContent").returns(content);
      // Mock removeContentFromLesson function to throw an error
      sinon.stub(lessonModel, "removeContentFromLesson").throws(new Error('Failed to remove content from lesson'));
      // spies on deleteObj function
      sinon.spy(oracleStorage, "deleteObj");
      try {
        await lessonContentService.removeOneContent(courseId, contentId);
      } catch (error) {
        // verify are called with the correct arguments
        expect(mongoDB.startSession.calledOnce).to.be.true;
        expect(lessonContentModel.deleteLessonContent.calledOnceWith(contentId, 'session')).to.be.true;
        expect(oracleStorage.deleteObj.notCalled).to.be.true;
        expect(lessonModel.removeContentFromLesson.calledOnceWith(content.lessonId, contentId, 'session')).to.be.true;
        expect(mongoDB.commitTransaction.notCalled).to.be.true;
        expect(mongoDB.abortTransaction.calledOnceWith('session')).to.be.true;
        // check if the result is the expected message
        expect(error.message).to.equal('Failed to remove content from lesson');
      }
    });
  });

}).timeout(5000);
