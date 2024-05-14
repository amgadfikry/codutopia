import common from 'oci-common';
import objectStorage from 'oci-objectstorage';

// OracleStorage class that provides methods to interact with the Object Storage service.
class OracleStorage {
  constructor() {
    // Set up the authentication provider and region for the Object Storage client.
    this.config = {
      authenticationDetailsProvider: new common.ConfigFileAuthenticationDetailsProvider(
        './config.oci', 'DEFAULT'),
      region: 'me-jeddah-1',
      logRequests: false,
    };
    // Create an instance of the Object Storage client using the configuration.
    this.objectStorageClient = new objectStorage.ObjectStorageClient(this.config);
    this.namespace = process.env.NAMESPACE;
    this.compartmentId = process.env.COMPARTMENT_ID;
  }

  /* CreateBucket method creates a new bucket in the Object Storage service.
    Parameters:
    - bucketName: The name of the bucket to create.
    Returns:
    - The result of the createBucket operation, which contains the metadata of the new bucket.
  */
  async createBucket(bucketName) {
    try {
      const createBucketRequest = {
        namespaceName: this.namespace,
        createBucketDetails: {
          name: bucketName,
          compartmentId: this.compartmentId,
        }
      };
      const result = await this.objectStorageClient.createBucket(createBucketRequest);
      return result;
    } catch (err) {
      return err;
    }
  }

  /* GetAllBucket method retrieves all buckets from the Object Storage service.
    Returns:
    - The result of the listBuckets operation, which contains the metadata of the retrieved buckets.
  */
  async getAllBucket() {
    try {
      const getAllBucketDetails = {
        namespaceName: this.namespace,
        compartmentId: this.compartmentId,
      };
      const result = await this.objectStorageClient.listBuckets(getAllBucketDetails);
      return result;
    }
    catch (err) {
      return err;
    }
  }

  /* DeleteBucket method deletes a bucket from the Object Storage service.
    Parameters:
    - bucketName: The name of the bucket to delete.
    Returns:
    - The result of the deleteBucket operation, which contains the metadata of the deleted bucket.
  */
  async deleteBucket(bucketName) {
    try {
      const deleteBucketDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        compartmentId: this.compartmentId,
      };
      const result = await this.objectStorageClient.deleteBucket(deleteBucketDetails);
      return result;
    } catch (err) {
      return err;
    }
  }

  /* createObj method uploads an object to the Object Storage service.
    Parameters:
    - bucketName: The name of the bucket to upload the object to.
    - objName: The name of the object to upload.
    - data: The data to upload as the object content.
    Returns:
    - The result of the putObject operation, which contains the metadata of the uploaded object.
  */
  async createObj(bucketName, objName, data) {
    try {
      const createdObjectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
        putObjectBody: data,
        contentLength: data.length,
      };
      const result = await this.objectStorageClient.putObject(createdObjectDetails);
      return result;
    } catch (err) {
      return err;
    }
  }

  /*Existing methods check if an object exists or not
  Parameters:
  - objName: The name of the object to check.
  - bucketName: The name of the bucket to search for the object.
  Returns:
  - The result of the headObject operation, which contains the metadata of the object if it exists.
*/
  async exists(bucketName, objName) {
    try {
      const objectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
      };
      const result = await this.objectStorageClient.headObject(objectDetails);
      return result;
    } catch (err) {
      return err;
    }
  }

  /* getObj method retrieves an object from the Object Storage service.
    Parameters:
    - bucketName: The name of the bucket to retrieve the object from.
    - objName: The name of the object to retrieve.
    Returns:
    - The result of the getObject operation, which contains the metadata and data of the retrieved object.
  */
  async getObj(bucketName, objName) {
    try {
      const getObjectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
      };
      const result = await this.objectStorageClient.getObject(getObjectDetails);
      return result;
    } catch (err) {
      return err;
    }
  }

  /* GetAllObj method retrieves all objects from bucket in the Object Storage service.
    Parameters:
    - bucketName: The name of the bucket to retrieve the object from.
    Returns:
    - The result of the listObjects operation, which contains the metadata and data of the retrieved object.
  */
  async getAllObj(bucketName) {
    try {
      const listObjectsDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
      };
      const result = await this.objectStorageClient.listObjects(listObjectsDetails);
      return result;
    } catch (err) {
      return err;
    }
  }

  /* delete method deletes an object from the Object Storage service.
    Parameters:
    - objName: The name of the object to delete.
    - bucketName: The name of the bucket to delete the object from.
    Returns:
    - The result of the deleteObject operation, which contains the metadata of the deleted object.
  */
  async deleteObj(bucketName, objName) {
    try {
      const deleteObjectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
      };
      const result = await this.objectStorageClient.deleteObject(deleteObjectDetails);
      return result;
    } catch (err) {
      return err;
    }
  }
}

// Create an instance of the OracleStorage class and export it.
const oracleStorage = new OracleStorage();
export default oracleStorage;
