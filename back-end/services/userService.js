import mongoDB, { courseModel, userModel, reviewModel, lessonModel, lessonContentModel, quizModel, paymentModel }
  from "../databases/mongoDB.js";
import oracleStorage from "../oracleStorage/oracleStorage.js";
import emailUtils from "../utils/emailUtils.js";
import jwtToken from '../utils/jwtToken.js';


/* register function to create a new user and send a confirmation email if new user
    and if user already exists and userData has roles field add the role to the user if not have it
    Parameters:
      - userData: object containing user data
    Returns:
      - Message indicating that the user has been created
    Errors:
      - Error according to the error that occurred
*/
export async function register(userData) {
  // Create a session
  const session = mongoDB.startSession();
  try {
    // Create a new user
    const newUser = await userModel.createUser(userData, session);
    // Create confirmation token and expiration date
    const confirmationToken = await userModel.generateConfirmationToken(newUser._id, session);
    // Send a confirmation email
    await emailUtils.sendConfirmationEmail(newUser.userName, confirmationToken, newUser.email);
    // Commit the transaction
    await mongoDB.commitTransaction(session);
    // Return a message
    return 'User created. Please check your email to confirm your account.';
  } catch (error) {
    try {// if throw error user already exists and userData has roles field
      if (error.message.includes('User already exists') && userData.roles) {
        // get the user by email
        const user = await userModel.getUserByField({ email: userData.email }, session);
        // if roles not in roles array of the user
        if (!user.roles.includes(userData.roles[0])) {
          // add the role to the user
          await userModel.addNewRole(user._id, userData.roles[0], session);
          // Commit the transaction
          await mongoDB.commitTransaction(session);
          // Return a message
          return 'User Account updated with the new role.';
        }
      }
    }
    catch (error) {
      // Abort the transaction
      await mongoDB.abortTransaction(session);
      // Throw an error with the message
      throw new Error(error.message);
    }
    // Abort the transaction
    await mongoDB.abortTransaction(session);
    // Throw an error with the message
    throw new Error(error.message);
  }
}


/* confirmUser function to confirm the user account
    Parameters:
      - userId: user id
      - token: confirmation token
    Returns:
      - Message indicating that the user account has been confirmed
    Errors:
      - Error according to the error that occurred
*/
export async function confirmUser(userId, token) {
  try {
    // Confirm the user account
    await userModel.confirmUser(userId, token);
    // Return a message
    return 'User account confirmed.';
  } catch (error) {
    // Throw an error with the message
    throw new Error(error.message);
  }
}


/* login function to log in user, generate jwt token
    Parameters:
      - email: user email
      - password: user password
      - role: user role that will be stored in the token
      - rememberMe: remember me flag to set the expiration time of the token
    Returns:
      - JWT token
    Errors:
      - Error according to the error that occurred
*/
export async function login(email, password, role, rememberMe) {
  // start a session
  const session = mongoDB.startSession();
  try {
    // check if the user exists and the password is correct
    const user = await userModel.checkUserPassword(email, password, session);
    // setup the expiration time of the token according to the rememberMe flag
    const time = rememberMe ? '7d' : '1d';
    // Data to be stored in the token
    const userData = { userId: String(user._id), role: role };
    // generate the token
    const token = await jwtToken.generateToken(userData, time);
    // commit the transaction
    await mongoDB.commitTransaction(session);
    // Return the token
    return token;
  } catch (error) {
    // abort the transaction
    await mongoDB.abortTransaction(session);
    // Throw an error with the message
    throw new Error(error.message);
  }
}
