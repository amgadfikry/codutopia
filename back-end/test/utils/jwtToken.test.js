import { expect } from 'chai';
import jwtToken from '../../utils/jwtToken.js';


// Test suite for the jwtToken module and its methods
describe('jwtToken', () => {

  // Test suite for the generateToken method
  describe('generateToken method', () => {
    // Test case for generating a token with a valid user id and return the token
    it('Generate a token with a valid user id and return the token', async () => {
      // call the generateToken method
      const result = await jwtToken.generateToken({ userId: '56cbf9b6b01e90c71b9457f3' }, '1d');
      // assert the result
      expect(result).to.be.a('string');
    });
  });


  // Test suite for the verifyToken method
  describe('verifyToken method', () => {
    let token;
    let userData

    // beforeEach hook to generate a token
    beforeEach(async () => {
      userData = { userId: '56cbf9b6b01e90c71b9457f3', roles: ['learner'] };
      // Generate a token for 1 second
      token = await jwtToken.generateToken(userData, '1s');
    });

    // Test case for verifying a token with a valid token and return the user id
    it('Verify a token with a valid token and return the user id', async () => {
      // call the verifyToken method
      const result = await jwtToken.verifyToken(token);
      // assert the result
      expect(result).be.a('object');
      expect(result.userId).equal(userData.userId);
      expect(result.roles).deep.equal(userData.roles);
    });

    // Test case for verifying a token with an expired token and throw an error
    it('Verify a token with an expired token and throw an error', async () => {
      // call the verifyToken method
      try {
        // Wait for 11 seconds
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await jwtToken.verifyToken(token);
      } catch (error) {
        // assert the error message
        expect(error.message).equal('Error verifying authentication token');
      }
    }).timeout(3000);

    // Test case for verifying a token with an invalid token and throw an error
    it('Verify a token with an invalid token and throw an error', async () => {
      // call the verifyToken method
      try {
        await jwtToken.verifyToken('invalidToken');
      } catch (error) {
        // assert the error message
        expect(error.message).equal('Error verifying authentication token');
      }
    });
  });

}).timeout(5000);
