import common from 'oci-common';
import objectStorage from 'oci-objectstorage';
import { getStreamAsBuffer } from 'get-stream';
import { pipeline } from 'stream/promises';

// Set up the authentication provider and the Object Storage client to use the Object Storage service.
const config = {
  // Provide authentication details to access the Object Storage service.
  authenticationDetailsProvider: new common.ConfigFileAuthenticationDetailsProvider(
    './config.oci', 'DEFAULT'),
  region: 'me-jeddah-1',
};

// Create an Object Storage client to use the Object Storage service.
const objectStorageClient = new objectStorage.ObjectStorageClient(config);

// Define the FilesControl class to handle file upload, retrieval, and deletion operations.
class FilesControl {
  /*
    * The uploadVideo method uploads a video file to the Object Storage service.
    * It takes a request and a response object as parameters and returns a response object.
    * create a putObjectRequest object to specify the namespace, bucket, object name, and the video file to upload.
    * Call the putObject method of the Object Storage client to upload the video file.
    * Return a response object with a success message and the response from the Object Storage service.
    * If an error occurs, return a response object with an error message.
  */
  static async uploadVideo(req, res) {
    try {
      const { originalname, buffer } = req.file;
      const putObjectRequest = {
        namespaceName: 'axtryshpute3',
        bucketName: 'e-learning',
        objectName: originalname,
        putObjectBody: buffer,
        contentLength: buffer.length,
      };
      const response = await objectStorageClient.putObject(putObjectRequest);
      res.status(200).json({ msg: 'File uploaded successfully', data: response });
    } catch (err) {
      res.status(500).json({ msg: 'Error uploading file' });
    }
  }

  /*
    * The getVideo method retrieves a video file from the Object Storage service.
    * It takes a request and a response object as parameters and returns a response object.
    * Create a getObjectRequest object to specify the namespace, bucket, and object name of the video file to retrieve.
    * Call the getObject method of the Object Storage client to retrieve the video file.
    * Set the content type, length, and disposition headers of the response object.
    * Return a response object with the video file as the response body.
    * If an error occurs, return a response object with an error message.
  */
  static async getVideo(req, res) {
    try {
      const { key } = req.params;
      const getObjectRequest = {
        namespaceName: 'axtryshpute3',
        bucketName: 'e-learning',
        objectName: key,
      };
      const response = await objectStorageClient.getObject(getObjectRequest);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `inline; filename="${key}"`);
      // Stream the data directly to the response
      await pipeline(response.value, res);
    } catch (err) {
      console.log(err);
    }
  }

  /*
    * The deleteVideo method deletes a video file from the Object Storage service.
    * It takes a request and a response object as parameters and returns a response object.
    * Create a deleteObjectRequest object to specify the namespace, bucket, and object name of the video file to delete.
    * Call the deleteObject method of the Object Storage client to delete the video file.
    * Return a response object with a success message.
    * If an error occurs, return a response object with an error message.
  */
  static async deleteVideo(req, res) {
    try {
      const { key } = req.params
      const deleteObjectRequest = {
        namespaceName: 'axtryshpute3',
        bucketName: 'e-learning',
        objectName: key,
      };
      await objectStorageClient.deleteObject(deleteObjectRequest);
      res.status(200).json({ msg: 'File deleted successfully' })
    } catch (error) {
      res.status(500).json({ msg: 'Error deleting file' });
    }
  }
}

// Export the FilesControl class and the objectStorageClient object.
export default FilesControl;
export { objectStorageClient };
