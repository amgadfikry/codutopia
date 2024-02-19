import { Router } from "express";
import UserControl from '../controllers/usersControl.js';

// User routes with the respective controller methods
const userRouter = Router();

// Register a new user route
userRouter.post('/register', UserControl.register);

// Login route
userRouter.post('/login', UserControl.login);

// Logout route
userRouter.get('/logout', UserControl.middleware, UserControl.logout);

// Get user route
userRouter.get('/brief', UserControl.middleware, UserControl.getUser);

// Get user details route
userRouter.get('/details', UserControl.middleware, UserControl.getUserDetails);

// Update user route
userRouter.put('/update', UserControl.middleware, UserControl.updateUser);

// update user password route
userRouter.put('/updatePassword', UserControl.middleware, UserControl.updatePassword);

// Export the userRouter
export default userRouter;
