import { expect } from 'chai';
import emailUtils from '../../utils/emailUtils.js';


// Test suite for the emailUtils module and its methods
describe.skip('Unittest of EmailUtils', () => {

  // Test suite for the sendConfirmationEmail method
  describe('sendConfirmationEmail method', () => {
    // Test case for sending a confirmation email with valid data and return a queued message
    it('Send a confirmation email with valid data and return a queued message', async () => {
      // call the sendConfirmationEmail method
      const result = await emailUtils.sendConfirmationEmail('Amgad Fikry', 657896 ,'dr.amgad_sh92@yahoo.com');
      // assert the result
      expect(result).have.property('id');
      expect(result).have.property('message');
      expect(result.message).equal('Queued. Thank you.');
    });
  });

}).timeout(5000);
