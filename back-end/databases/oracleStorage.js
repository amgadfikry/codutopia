import common from 'oci-common';
import objectStorage from 'oci-objectstorage';

// Set up the authentication provider and the Object Storage client to use the Object Storage service.
class OracleStorage {
  constructor() {
    // Set up the authentication provider and the Object Storage client to use the Object Storage service.
    this.config = {
      authenticationDetailsProvider: new common.ConfigFileAuthenticationDetailsProvider(
        './config.oci', 'DEFAULT'),
      region: 'me-jeddah-1',
    };
    // Create an Object Storage client to use the Object Storage service.
    this.objectStorageClient = new objectStorage.ObjectStorageClient(this.config);
  }

  /* Uploads a file to the Object Storage service
    * @param {string} type - The type of file to upload
    * @param {string} originalname - The original name of the file
    * @param {Buffer} buffer - The file content as a buffer
    * @returns {Promise} - A promise that resolves to the result from the Object Storage service
    */
  async upload(type, originalname, buffer) {
    try {
      const uploadObject = {
        namespaceName: 'axtryshpute3',
        bucketName: type,
        objectName: originalname,
        putObjectBody: buffer,
        contentLength: buffer.length,
      };
      const result = await this.objectStorageClient.putObject(uploadObject);
      return result;
    } catch (err) {
      return err;
    }
  }

  /* Retrieves a file from the Object Storage service
    * @param {string} key - The name of the file to retrieve
    * @param {string} type - The type of file to retrieve
    * @returns {Promise} - A promise that resolves to the result from the Object Storage service
    */
  async get(key, type) {
    try {
      const getObject = {
        namespaceName: 'axtryshpute3',
        bucketName: type,
        objectName: key,
      };
      const result = await this.objectStorageClient.getObject(getObject);
      return result;
    } catch (err) {
      return err;
    }
  }

  /* Deletes a file from the Object Storage service
    * @param {string} key - The name of the file to delete
    * @param {string} type - The type of file to delete
    * @returns {Promise} - A promise that resolves to the result from the Object Storage service
    */
  async delete(key, type) {
    try {
      const deleteObject = {
        namespaceName: 'axtryshpute3',
        bucketName: type,
        objectName: key,
      };
      const result = await this.objectStorageClient.deleteObject(deleteObject);
      return result;
    } catch (err) {
      return err;
    }
  }
}

// Create an instance of the OracleStorage class and export it.
const oracleStorage = new OracleStorage();
export default oracleStorage;
