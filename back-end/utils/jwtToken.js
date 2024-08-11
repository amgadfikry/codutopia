import jwt from 'jsonwebtoken';


// JwtToken class to generate and verify jwt tokens 
class JwtToken {

  // Constructor to initialize the secret key
  constructor() {
    this.secret = process.env.SECRET_KEY;
  }

  /* signJwtAsync method to sign a jwt token asynchronously
      Parameters:
        - payload: object containing the payload data
        - secret: secret key
        - options: object containing the options
      Returns:
        - Promise object
      Errors:
        - return an error if the token is not generated
  */
  static signJwtAsync(payload, secret, options) {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  }

  /* verifyJwtAsync method to verify a jwt token asynchronously
      Parameters:
        - token: jwt token
        - secret: secret key
      Returns:
        - Promise object
      Errors:
        - return an error if the token is not verified
  */
  static verifyJwtAsync(token, secret) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  /* generateToken method to generate a jwt token
      Parameters:
        - userData: object containing user data
        - time: expiration time
      Returns:
        - token
      Errors:
        - return an error message if the token is not generated
  */
  async generateToken(userData, time) {
    try {
      // Generate the token with the userData and the secret key and expiration time 3 days
      const token = await JwtToken.signJwtAsync(userData, this.secret, { expiresIn: time });
      // Return the token
      return token;
    } catch (error) {
      // Throw an error with the message
      throw new Error("Error generating authentication token");
    }
  }

  /* verifyToken method to verify a jwt token
      Parameters:
        - token: jwt token
      Returns:
        - user data
      Errors:
        - return an error message if the token is not verified
  */
  async verifyToken(token) {
    try {
      // Verify the token with the secret key
      const decoded = await JwtToken.verifyJwtAsync(token, this.secret);
      // Return the user data
      return decoded
    } catch (error) {
      // Throw an error with the message
      throw new Error("Error verifying authentication token");
    }
  }
}

// initialize the jwtToken object and export it
const jwtToken = new JwtToken();
export default jwtToken;
