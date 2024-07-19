import oracleStorage from '../../oracleStorage/oracleStorage.js';
import { expect } from 'chai';
import { promises as fs } from 'fs';

// Test suite for the OracleStorage module and its methods by connecting to the object storage service
describe('Unittest of OracleStorage', () => {
  // variables to save the name of the bucket, names of the files
  let bucketName;
  let fileName;
  let fileName2;

  // before hook create define the bucket name and create the files dummy files before running the test cases
  before(async () => {
    // Define the bucket name
    bucketName = 'test-bucket';
    // define files names
    fileName = 'test.txt';
    fileName2 = 'test2.txt';
    // Create the dummy files with content
    await fs.writeFile(fileName, 'Hello World');
    await fs.writeFile(fileName2, 'Hello World 2');
  });

  // after hook delete the files after running the test cases
  after(async () => {
    // Delete the dummy files
    await fs.unlink(fileName);
    await fs.unlink(fileName2);
  });


  // Test suite for createBucket method in the OracleStorage class
  describe('Create Bucket method', () => {

    // Test case to create a new bucket in the object storage service successfully and return correct message
    it('create a new bucket in the object storage service successfully and return correct message', async () => {
      // Create a new bucket in the object storage service
      const result = await oracleStorage.createBucket(bucketName);
      // Check if result is correct message
      expect(result).to.equal('Bucket created successfully');
    });

    // Test case to create a new bucket in the object storage service with the same name and throw error
    it('create a new bucket in the object storage service with the same name and throw error', async () => {
      try {
        // Create a new bucket in the object storage service with the same name
        await oracleStorage.createBucket(bucketName);
      } catch (error) {
        // Check if the error message is 'Bucket already exists'
        expect(error.message).to.equal('Bucket already exists');
      }
    });
  });


  // Test suite for createObject method in the OracleStorage class
  describe('Create Object method', () => {
    // Test case to create a new object in the object storage service for first time successfully and return correct message
    it('create a new object in the object storage service for first time successfully and return correct message', async () => {
      // Read the file content to create the object in the object storage service
      const file = await fs.readFile(fileName);
      // Call the createObj method to create the object in the object storage service
      const result = await oracleStorage.createObj(bucketName, fileName, file);
      // check if the result is correct message
      expect(result).to.equal('Object created successfully');
    });

    // Test case to create a new object with the same name in the object storage service to replace it
    it('create a new object with the same name in the object storage service to replace it', async () => {
      // Read the file content to create the object in the object storage service
      const file = await fs.readFile(fileName);
      // Call the createObj method to create the object in the object storage service
      const result = await oracleStorage.createObj(bucketName, fileName, file);
      // check if the result is correct message
      expect(result).to.equal('Object created successfully');
    });
  });


  // Test suite for getAllObj method in the OracleStorage class
  describe('Get All Objects method', () => {
    // Test case to get list of names of all objects from the bucket in the object storage service
    it('get list of names of all objects from the bucket in the object storage service', async () => {
      // Read the another file content to create the object in the object storage service
      const file2 = await fs.readFile(fileName2);
      // create another object in the same bucket
      await oracleStorage.createObj(bucketName, fileName2, file2);
      // Call the getAllObj method to get all objects from the bucket in the object storage service
      const result = await oracleStorage.getAllObj(bucketName);
      // check if the result is array
      expect(result).to.be.an('array');
      // check if the result has the correct length
      expect(result.length).to.equal(2);
      // check if the result has the correct names of the objects
      expect(result[0]).to.equal(fileName);
      expect(result[1]).to.equal(fileName2);
    });

    // Testcase to get all list of objects from the bucket failed in the object storage service
    it('get list of names of all objects from the bucket failed', async () => {
      try {
        // Call the getAllObj method to get all objects from the bucket in the object storage service
        await oracleStorage.getAllObj('invalid');
      } catch (error) {
        // Check if the error message is 'Failed to get objects'
        expect(error.message).to.equal('Failed to get objects');
      }
    });
  });


  // Test suite for deleteObj method in the OracleStorage class
  describe('Delete Object method', () => {
    // Test case to delete an object exists successfully in the object storage service and return correct message
    it('delete an object exists successfully in the object storage service and return correct message', async () => {
      // Call the deleteObj method to delete the object from the object storage service
      const result = await oracleStorage.deleteObj(bucketName, fileName);
      // Check if the result is correct message
      expect(result).to.equal('Object deleted successfully');
    });

    // Test case to failed to delete an object in the object storage service and throw error
    it('failed to delete an object in the object storage service and throw error', async () => {
      try {
        // Call the deleteObj method to delete the object from the object storage service
        await oracleStorage.deleteObj(bucketName, fileName);
      } catch (error) {
        // Check if the error message is 'Failed to delete object'
        expect(error.message).to.equal('Failed to delete object');
      }
    });
  });


  // Test suite for  delete bucket method in the OracleStorage
  describe('Delete Bucket method', () => {
    // Test case delete a bucket contains objects from the object storage service and throw error
    it('delete a bucket contains objects from the object storage service and throw error', async () => {
      try {
        // delete the bucket contains objects
        await oracleStorage.deleteBucket(bucketName);
      } catch (err) {
        // Check if the error message is 'Bucket not empty'
        expect(err.message).to.equal('Bucket not empty');
      }
    });

    // Test case delete a bucket after deleting all objects from the object storage service and return correct message
    it('delete a bucket after deleting all objects from the object storage service and return correct message', async () => {
      // delete remaining object in the bucket
      await oracleStorage.deleteObj(bucketName, fileName2);
      // delete the bucket
      const result = await oracleStorage.deleteBucket(bucketName);
      // Check if the result is correct message
      expect(result).to.equal('Bucket deleted successfully');

    }).timeout(15000);

    // Test case delete a bucket not found in the object storage service and throw error
    it('delete a bucket not found in the object storage service and throw error', async () => {
      try {
        // delete a bucket not found in the object storage service
        await oracleStorage.deleteBucket(bucketName);
      } catch (err) {
        // Check if the error message is 'Bucket not found or failed to delete bucket'
        expect(err.message).to.equal('Bucket not found or failed to delete bucket');
      }
    });
  });

  /**************************************************************/

  // Test suite for getAllBucket method in the OracleStorage class
  describe.skip('Get All Buckets method', () => {
    // Test case get all buckets from the object storage service if there are buckets
    it('GetAllBucket method retrieves all buckets if there are buckets', async () => {
      // Get all buckets from the object storage service
      const result = await oracleStorage.getAllBucket();
      // check that result is list of names of available buckets in object storage services
      expect(result).to.be.an('array');
      expect(result.length).to.equal(1);
      expect(result).to.include(bucketName);
    });
  });


  // Test suite for exists method in the OracleStorage class
  describe.skip('Exists method', () => {
    // Test case to check if an object exists in the object storage service
    it('Exists method checks if an object exists', async () => {
      // Call the exists method to check if the object exists in the object storage service
      const result = await oracleStorage.exists(bucketName, fileName);
      // Check if the result is correct message
      expect(result).to.equal('Object exists');
    });

    // Test case check if an object is not exists in the object storage service
    it('Exists method checks if an object not exists', async () => {
      try {
        // Call the exists method to check if the object exists in the object storage service
        await oracleStorage.exists(bucketName, 'invalid.txt');
      } catch (error) {
        // Check if the error message is 'Object not found'
        expect(error.message).to.equal('Object not found');
      }
    });
  });


  // Test suite for getObject method in the OracleStorage class
  describe.skip('Get Object method', () => {
    // Test case to get the object successfully from the object storage service
    it('GetObject method retrieves an object', async () => {
      // Call the getObj method to get the object from the object storage service
      const result = await oracleStorage.getObj(bucketName, fileName);
      // Check if the result has the correct properties
      expect(result).has.property('value');
      expect(result).has.property('lastModified');
    }).timeout(5000);

    // Test case to get the object not found in the object storage service
    it('GetObject method retrieves an object not found', async () => {
      try {
        // Call the getObj method to get the object from the object storage service
        await oracleStorage.getObj(bucketName, 'invalid.txt');
      } catch (error) {
        // Check if the error message is 'Failed to get object'
        expect(error.message).to.equal('Failed to get object');
      }
    });
  });

}).timeout(20000);
