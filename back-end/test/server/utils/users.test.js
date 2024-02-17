import { expect } from 'chai';
import Users from '../../../server/utils/users.js';

describe('Users', () => {
  describe('hashPassword', () => {
    it('should return a hashed password', async () => {
      const hashedPassword = await Users.hashPassword('password');
      expect(hashedPassword).to.be.a('string');
    });
  });
  describe('checkPassword', () => {
    it('should return true if password is correct', async () => {
      const hashedPassword = await Users.hashPassword('password');
      const result = await Users.checkPassword('password', hashedPassword);
      expect(result).to.be.true;
    });
    it('should return false if password is incorrect', async () => {
      const hashedPassword = await Users.hashPassword('password');
      const result = await Users.checkPassword('wrongpassword', hashedPassword);
      expect(result).to.be.false;
    });
  });
});
