import oracleStorage from '../../databases/oracleStorage.js';
import { expect } from 'chai';
import { promises as fs } from 'fs';

// Test suite for the OracleStorage module and its methods by connecting to the object storage service
describe('Unittest of OracleStorage', () => {

  // variables to save the name of the bucket, names of the files, and the response data
  const bucketName = 'testbucket';
  const fileName = 'test.txt';
  const fileName2 = 'test2.txt';
  const responseData = {};

  // before hook create two files before running the test cases
  before(async () => {
    await fs.writeFile(fileName, 'Hello World');
    await fs.writeFile(fileName2, 'Hello World 2');
  });

  // after hook delete the files after running the test cases
  after(async () => {
    await fs.unlink(fileName);
    await fs.unlink(fileName2);
  });

  // Test case to create a new bucket in the object storage service
  it('CreateBucket method creates a new bucket', async () => {
    const result = await oracleStorage.createBucket(bucketName);
    expect(result.bucket.name).to.equal(bucketName);
  });

  // Test case to create a new bucket in the object storage service with the same name
  it('CreateBucket method creates a new bucket with the same name', async () => {
    try {
      await oracleStorage.createBucket(bucketName);
    } catch (err) {
      console.log(err);
      expect(err.statusCode).to.equal(409);
      expect(err.serviceCode).to.equal('BucketAlreadyExists');
    }
  });

  // Test case get all buckets from the object storage service if there are buckets
  it('GetAllBucket method retrieves all buckets if there are buckets', async () => {
    const result = await oracleStorage.getAllBucket();
    expect(result.items.length).to.equal(1);
    expect(result.items[0].name).to.equal(bucketName);
  });

  // Test case to create a new object in the object storage service for first time
  it('CreateObject method creates a new object', async () => {
    // Read the file content
    const file = await fs.readFile(fileName);
    const result = await oracleStorage.createObj(bucketName, fileName, file);
    expect(result.eTag).to.not.be.null;
    expect(result.versionId).to.not.be.null;
    // Save the response data to use it in other test cases
    responseData['eTag'] = result.eTag;
    responseData['versionId'] = result.versionId;
    responseData['lastModified'] = result.lastModified;
  });

  // Test case to check if an object exists in the object storage service
  it('Exists method checks if an object exists', async () => {
    const result = await oracleStorage.exists(bucketName, fileName);
    expect(result.eTag).to.equal(responseData.eTag);
    expect(result.versionId).to.equal(responseData.versionId);
    expect(result.lastModified).to.equal(responseData.lastModified);
  });

  // Test case to get the object from the object storage service
  it('GetObject method retrieves an object', async () => {
    const result = await oracleStorage.getObj(bucketName, fileName);
    expect(result).has.property('value');
    expect(result.eTag).to.equal(responseData.eTag);
    expect(result.versionId).to.equal(responseData.versionId);
    expect(result.lastModified).to.equal(responseData.lastModified);
  });

  // Test case to create a new object with same name to update the object in the object storage service
  it('CreateObject method creates a new object with same name', async () => {
    // Update the file content
    await fs.writeFile(fileName, 'Hello World Updated');
    // Read the updated file content
    const file = await fs.readFile(fileName);
    const result = await oracleStorage.createObj(bucketName, fileName, file);
    expect(result.eTag).not.equal(responseData.eTag);
    expect(result.versionId).not.equal(responseData.versionId);
    expect(result.lastModified).not.equal(responseData.lastModified);
  });

  // Test case to get all objects from bucket in the object storage service
  it('GetAllObj method retrieves all objects from bucket', async () => {
    // Read the file content
    const file2 = await fs.readFile(fileName2);
    // create another object in the same bucket
    await oracleStorage.createObj(bucketName, fileName2, file2);
    const result = await oracleStorage.getAllObj(bucketName);
    expect(result.listObjects.objects.length).to.equal(2);
    expect(result.listObjects.objects[0].name).to.equal(fileName);
    expect(result.listObjects.objects[1].name).to.equal(fileName2);
  });

  // Test case to delete an object exists in the object storage service
  it('DeleteObj method deletes an object', async () => {
    const result = await oracleStorage.deleteObj(bucketName, fileName);
    expect(result.lastModified).to.not.be.null;
    expect(Object.keys(result).length).to.equal(2);
  });

  // Test case check if an object exists in the object storage service after deletion
  it('Exists method checks if an object exists after deletion', async () => {
    try {
      await oracleStorage.exists(bucketName, fileName);
    } catch (err) {
      expect(err.statusCode).to.equal(404);
      expect(err.serviceCode).to.equal('None');
      expect(err.operationName).to.equal('headObject');
    }
  });

  // Test case to delete an object not found in the object storage service
  it('DeleteObj method deletes an object not found', async () => {
    try {
      await oracleStorage.deleteObj(bucketName, fileName);
    } catch (err) {
      expect(err.statusCode).to.equal(404);
      expect(err.serviceCode).to.equal('ObjectNotFound');
    }
  });

  // Test case delete a bucket contains objects from the object storage service
  it('DeleteBucket method deletes a bucket contains objects', async () => {
    try {
      await oracleStorage.deleteBucket(bucketName);
    } catch (err) {
      expect(err.statusCode).to.equal(409);
      expect(err.serviceCode).to.equal('BucketNotEmpty');
    }
  });

  // Test case delete a bucket after deleting all objects from the object storage service
  it('DeleteBucket method deletes a bucket', async () => {
    // delete remaining object in the bucket
    await oracleStorage.deleteObj(bucketName, fileName2);
    const result = await oracleStorage.deleteBucket(bucketName);
    expect(Object.keys(result).length).to.equal(1);
    expect(result.opcRequestId).to.not.be.null;
  }).timeout(5000);

  // Test case delete a bucket from the object storage service not found
  it('DeleteBucket method deletes a bucket not found', async () => {
    try {
      await oracleStorage.deleteBucket(bucketName);
    } catch (err) {
      expect(err.statusCode).to.equal(404);
      expect(err.serviceCode).to.equal('BucketNotFound');
    }
  });

  // Test case get all buckets from the object storage service if there are no buckets
  it('GetAllBucket method retrieves all buckets if there are no buckets', async () => {
    const result = await oracleStorage.getAllBucket();
    expect(result.items.length).to.equal(0);
  });
});