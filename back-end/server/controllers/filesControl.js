import oracleStorage from '../../databases/oracleStorage.js';
import { pipeline } from 'stream/promises';

// Define the FilesControl class to handle file upload, retrieval, and deletion operations.
class FilesControl {

  /* The upload method uploads a file to the Object Storage service.
    * It takes a request and a response object as parameters and returns a response object.
    * Extract the type and originalname properties from the request file object.
    * Call the upload method of the OracleStorage class to upload the file to the Object Storage service.
    * Return a response status of 200 with a success message and the response from the Object Storage service.
    * If an error occurs, return a response status of 500 with an error message.
  */
  static async upload(req, res) {
    try {
      const { type } = req.params;
      const { originalname, buffer } = req.file;
      const response = await oracleStorage.upload(type, originalname, buffer);
      res.status(200).json({ msg: 'File uploaded successfully', data: response });
    } catch (err) {
      res.status(500).json({ msg: 'Error uploading file' });
    }
  }

  /* The get method retrieves a file from the Object Storage service.
    * It takes a request and a response object as parameters and returns a response object.
    * Extract the key and type properties from the request parameters.
    * Call the get method of the OracleStorage class to retrieve the file from the Object Storage service.
    * Set the response headers based on the file type.
    * Stream the file data directly to the response.
    * If an error occurs no response is returned.
    */
  static async get(req, res) {
    try {
      const { key, type } = req.params;
      const response = await oracleStorage.get(key, type);
      res.setHeader('Accept-Ranges', 'bytes');
      if (type === 'image') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (type === 'video') {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (type === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      }
      res.setHeader('Content-Disposition', `inline; filename="${key}"`);
      await pipeline(response.value, res);
    } catch (err) {
      // end stream
    }
  }

  /* The delete method deletes a file from the Object Storage service.
    * It takes a request and a response object as parameters and returns a response object.
    * Extract the key and type properties from the request parameters.
    * Call the delete method of the OracleStorage class to delete the file from the Object Storage service.
    * Return a response status of 200 with a success message.
    * If an error occurs, return a response status of 500 with an error message.
    */
  static async delete(req, res) {
    try {
      const { key, type } = req.params
      await oracleStorage.delete(key, type);
      res.status(200).json({ msg: 'File deleted successfully' })
    } catch (error) {
      res.status(500).json({ msg: 'Error deleting file' });
    }
  }
}

// Export the FilesControl class and the objectStorageClient object.
export default FilesControl;
