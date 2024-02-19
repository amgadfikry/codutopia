import fs from 'fs';
import crypto from 'crypto';

/* 
  This script is used to generate a secret key and save it to a .env file.
  It is only meant to be used once, when setting up the project for the first time.
  The secret key is used to sign and verify JWT tokens.
  The script generates a 32-byte random string and saves it to a .env file.
  If a SECRET_KEY already exists in the .env file, it will be replaced.
  If not, it will be added to the end of the file.
*/
const generateSecretKey = () => {
  try {
    // generate a 32-byte random string
    const key = crypto.randomBytes(32).toString('hex');
    // read the existing .env file
    const existingEnvContent = fs.readFileSync('.env', 'utf-8');
    // if a SECRET_KEY already exists, replace it with the new key or add it to the end of the file
    const updatedEnvContent = existingEnvContent.includes('SECRET_KEY')
      ? existingEnvContent.replace(/SECRET_KEY=.*/, `SECRET_KEY=${key}`)
      : `${existingEnvContent}\nSECRET_KEY=${key}\n`;
    fs.writeFileSync('.env', updatedEnvContent);
    console.log('Secret key generated and saved to .env file');
  } catch (error) {
    console.error('Error generating or updating secret key', error);
  }
}

// run the script
generateSecretKey();
