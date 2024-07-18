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
    // Set the namespace and compartment ID for the Object Storage client using environment variables.
    this.namespace = process.env.NAMESPACE;
    this.compartmentId = process.env.COMPARTMENT_ID;
  }

  /* createBucket method creates a new bucket in the Object Storage service.
    Parameters:
      - bucketName: The name of the bucket to create.
    Returns:
      - return: message that the bucket is created
      - error: If the bucket already exists or the creation fails
  */
  async createBucket(bucketName) {
    try {
      // Create Object containing the bucket namespace, name, and compartment ID.
      const createBucketRequest = {
        namespaceName: this.namespace,
        createBucketDetails: {
          name: bucketName,
          compartmentId: this.compartmentId,
        }
      };
      // Call the createBucket operation with the createBucketRequest object.
      const result = await this.objectStorageClient.createBucket(createBucketRequest);
      // Return a message that the bucket is created.
      return 'Bucket created successfully';
    } catch (error) {
      // if the error status code is 409, throw an error message that the bucket already exists.
      if (error.statusCode === 409) {
        throw new Error('Bucket already exists');
      } else {
        // if the error status code is not 409, throw an error message that the creation failed.
        throw new Error('Failed to create bucket');
      }
    }
  }

  /* DeleteBucket method deletes a bucket from the Object Storage service.
    Parameters:
      - bucketName: The name of the bucket to delete.
    Returns:
      - return: message that the bucket is deleted
      - error: If the bucket is not empty, the deletion fails, or the bucket is not found
  */
  async deleteBucket(bucketName) {
    try {
      // Create Object containing the bucket namespace, name, and compartment ID.
      const deleteBucketDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        compartmentId: this.compartmentId,
      };
      // Call the deleteBucket operation with the deleteBucketDetails object.
      const result = await this.objectStorageClient.deleteBucket(deleteBucketDetails);
      // return message that the bucket is deleted successfully
      return 'Bucket deleted successfully';
    } catch (error) {
      // if the error status code is 409, throw an error message that the bucket is not empty.
      if (error.statusCode === 409) {
        throw new Error('Bucket not empty');
      } else {
        // if the error status code is not 409, throw an error message that the deletion failed.
        throw new Error('Bucket not found or failed to delete bucket');
      }
    }
  }

  /* createObj method uploads an object to the Object Storage service.
    Parameters:
      - bucketName: The name of the bucket to upload the object to.
      - objName: The name of the object to upload.
      - data: The data to upload as the object content.
    Returns:
      - return: message that the object is created
      - error: If the creation fails
  */
  async createObj(bucketName, objName, data) {
    try {
      // Create an object containing the namespace, bucket name, object name, data, and content length.
      const createdObjectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
        putObjectBody: data,
        contentLength: data.length,
      };
      // Call the putObject operation with the createdObjectDetails object.
      const result = await this.objectStorageClient.putObject(createdObjectDetails);
      // return correct message that the object is created successfully
      return 'Object created successfully';
    } catch (error) {
      // if an error occurs, throw an error message that the creation failed.
      throw new Error('Failed to create object');
    }
  }

  /* createPreAuthRequest method creates a pre-authenticated request for an object in the Object Storage service.
    Parameters:
      - bucketName: The name of the bucket containing the object.
      - objectName: The name of the object to create the pre-authenticated request for.
    Returns:
      - return: The full path of the object and expiration time of the pre-authenticated request
    Error:
      - Failed to create pre-authenticated request
  */
  async createPreAuthRequest(bucketName, objectName) {
    try {
      // create time expire 365 days from now
      const timeExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      // create pre-authenticated request details object
      const parDetails = {
        name: `par_${objectName}_${Date.now()}`,
        accessType: 'ObjectRead',
        timeExpires: timeExpires,
        objectName: objectName,
      };
      // create pre-authenticated request with the details object
      const response = await this.objectStorageClient.createPreauthenticatedRequest({
        namespaceName: this.namespace,
        bucketName: bucketName,
        createPreauthenticatedRequestDetails: parDetails
      });
      // return the full path of the object and expiration time of the pre-authenticated request
      return {
        url: response.preauthenticatedRequest.accessUri,
        expires: response.preauthenticatedRequest.timeExpires
      }
    } catch (error) {
      // if an error occurs, throw an error message that the creation failed.
      throw new Error('Failed to create pre-authenticated request');
    }
  }

  /* delete method deletes an object from the Object Storage service.
    Parameters:
      - objName: The name of the object to delete.
      - bucketName: The name of the bucket to delete the object from.
    Returns:
      - return: message that the object is deleted
      - error: If the deletion fails
  */
  async deleteObj(bucketName, objName) {
    try {
      // Create an object containing the namespace, bucket name, and object name.
      const deleteObjectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
      };
      // Call the deleteObject operation with the deleteObjectDetails object to delete the object.
      const result = await this.objectStorageClient.deleteObject(deleteObjectDetails);
      // return message that the object is deleted successfully
      return 'Object deleted successfully';
    } catch (error) {
      // if an error occurs, throw an error message that the deletion failed.
      throw new Error('Failed to delete object');
    }
  }

  /***********************************************************/

  // @deprecated method
  /* GetAllBucket method retrieves all buckets from the Object Storage service.
    Returns:
      - list of names of the buckets in the object storage service
      - error: If the operation fails
  */
  async getAllBucket() {
    try {
      // Create Object containing the namespace and compartment ID.
      const getAllBucketDetails = {
        namespaceName: this.namespace,
        compartmentId: this.compartmentId,
      };
      // Call the listBuckets operation with the getAllBucketDetails object.
      const result = await this.objectStorageClient.listBuckets(getAllBucketDetails);
      // return list of names of the buckets in the object storage service
      const bucketsList = result.items.map((bucket) => bucket.name);
      return bucketsList;
    }
    catch (error) {
      // if an error occurs, return the error message.
      throw new Error('Failed to get buckets from the object storage service');
    }
  }

  // @deprecated method
  /* GetAllObj method retrieves all objects from bucket in the Object Storage service.
  Parameters:
    - bucketName: The name of the bucket to retrieve the object from.
  Returns:
    - return: list of objects in the bucket
    - error: If the operation fails to get the objects
*/
  async getAllObj(bucketName) {
    try {
      // Create an object containing the namespace and bucket name.
      const listObjectsDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
      };
      // Call the listObjects operation with the listObjectsDetails object to get the list of objects.
      const result = await this.objectStorageClient.listObjects(listObjectsDetails);
      // return list of objects in the bucket
      return result.listObjects.objects;
    } catch (err) {
      // if an error occurs, throw an error message that the operation failed.
      throw new Error('Failed to get objects');
    }
  }

  // @deprecated method
  /* getObj method retrieves an object from the Object Storage service.
  Parameters:
    - bucketName: The name of the bucket to retrieve the object from.
    - objName: The name of the object to retrieve.
  Returns:
    - return: The result of the getObject operation, which contains the metadata and data of the retrieved object.
    - error: If the operation fails to get the object
*/
  async getObj(bucketName, objName) {
    try {
      // Create an object containing the namespace, bucket name, and object name.
      const getObjectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
      };
      // Call the getObject operation with the getObjectDetails object to get the object data.
      const result = await this.objectStorageClient.getObject(getObjectDetails);
      // return the result of the getObject operation.
      return result;
    } catch (error) {
      // if an error occurs, throw the error message.
      throw new Error('Failed to get object');
    }
  }

  // @deprecated method
  /*Existing methods check if an object exists or not
Parameters:
  - objName: The name of the object to check.
  - bucketName: The name of the bucket to search for the object.
Returns:
  - return: message that the object exists
  - error: If the object is not found
*/
  async exists(bucketName, objName) {
    try {
      // Create an object containing the namespace, bucket name, and object name.
      const objectDetails = {
        namespaceName: 'axtryshpute3',
        bucketName: bucketName,
        objectName: objName,
      };
      // Call the headObject operation with the objectDetails object to get the metadata of the object.
      const result = await this.objectStorageClient.headObject(objectDetails);
      // return correct message that the object exists
      return 'Object exists';
    } catch (error) {
      // if an error occurs, throw an error message that the object is not found.
      throw new Error('Object not found');
    }
  }
}

// Create an instance of the OracleStorage class and export it.
const oracleStorage = new OracleStorage();
export default oracleStorage;
