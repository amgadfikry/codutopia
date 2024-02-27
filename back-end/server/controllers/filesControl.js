import mongoDB from "../../databases/mongoDB.js";
import { ObjectId } from "mongodb";
import redisDB from "../../databases/redisDB.js";
import common from 'oci-common';
import objectStorage from 'oci-objectstorage';

const config = {
  authenticationDetailsProvider: new common.ConfigFileAuthenticationDetailsProvider(
    './config.oci', 'DEFAULT'),
  region: 'me-jeddah-1',
};

const objectStorageClient = new objectStorage.ObjectStorageClient(config);

class FilesControl {
  static async uploadVideo(req, res) {
    try{
      const { originalname, buffer } = req.file;
      const putObjectRequest = {
        namespaceName: 'axtryshpute3',
        bucketName: 'e-learning',
        objectName: originalname,
        putObjectBody: buffer,
        contentLength: buffer.length,
      };
    const response = await objectStorageClient.putObject(putObjectRequest);
    res.status(200).json({msg: 'File uploaded successfully', data: response});
    } catch (err) {
    res.status(500).json({msg: 'Error uploading file'});
    }
  }

  static async getVideo(req, res) {
    try {
      const {key} = req.params
      const getObjectRequest = {
        namespaceName: 'axtryshpute3',
        bucketName: 'e-learning',
        objectName: key,
      };
      const response = objectStorageClient.getObject(getObjectRequest);
      const videoBuffer = response.value.buffer;
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', videoBuffer.length);
      res.setHeader('Content-Disposition', `inline; filename="${key}"`);
      res.status(200).send(videoBuffer);
    } catch (err) {
      res.status(500).json({msg: 'Error getting file'});
    }
  }

  static async deleteVideo(req, res) {
    try {
      const {key} = req.params
      const deleteObjectRequest = {
        namespaceName: 'axtryshpute3',
        bucketName: 'e-learning',
        objectName: key,
      };
      const response = await objectStorageClient.deleteObject(deleteObjectRequest);
      res.status(200).json({msg: 'File deleted successfully'})
    } catch (error) {
      res.status(500).json({msg: 'Error deleting file'});
    }
  }
}

export default FilesControl;
