import { expect } from "chai";
import sinon from "sinon";
import FilesControl, { objectStorageClient } from '../../server/controllers/filesControl.js';

// Test suite for FilesControl controller methods
describe('FilesControl', () => {
  let res;
  let req;
  // Create a response object before each test suite
  beforeEach(() => {
    res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
      setHeader: function (key, value) {
        return this;
      },
      send: function (data) {
        this.data = data;
        return this;
      }
    }
    req = {
      file: {
        originalname: 'video.mp4',
        buffer: Buffer.from('video')
      }
    };
  });

  // Restore sinon after each test
  afterEach(() => {
    sinon.restore();
  });

  // Test suite for uploadImage method
  describe('uploadVideo', () => {
    // Test case for successful upload of video
    it('The video should be uploaded successfully', async () => {
      sinon.stub(objectStorageClient, 'putObject').returns('response');
      await FilesControl.uploadVideo(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'File uploaded successfully', data: 'response' });
    });
    // Test case for failed upload of video
    it('The video should not be uploaded', async () => {
      sinon.stub(objectStorageClient, 'putObject').throws('error');
      await FilesControl.uploadVideo(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Error uploading file' });
    });
  });

  // Test suite for getVideo method
  describe('getVideo', () => {
    // Test case for successful retrieval of video
    it('The video should be retrieved successfully', async () => {
      req.params = { key: 'video.mp4' };
      sinon.stub(objectStorageClient, 'getObject').returns({ value: { buffer: 'response' } });
      await FilesControl.getVideo(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.equal('response');
    });
    // Test case for failed retrieval of video
    it('The video should not be retrieved', async () => {
      sinon.stub(objectStorageClient, 'getObject').throws('error');
      await FilesControl.getVideo(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Error getting file' });
    });
  });

  // Test suite for deleteVideo method
  describe('deleteVideo', () => {
    // Test case for successful deletion of video
    it('The video should be deleted successfully', async () => {
      req.params = { key: 'video.mp4' };
      sinon.stub(objectStorageClient, 'deleteObject').returns('response');
      await FilesControl.deleteVideo(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res.data).to.deep.equal({ msg: 'File deleted successfully' });
    });
    // Test case for failed deletion of video
    it('The video should not be deleted', async () => {
      sinon.stub(objectStorageClient, 'deleteObject').throws('error');
      await FilesControl.deleteVideo(req, res);
      expect(res.statusCode).to.equal(500);
      expect(res.data).to.deep.equal({ msg: 'Error deleting file' });
    });
  });
});
