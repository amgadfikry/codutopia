import { Router } from "express";
import UserControl from '../controllers/usersControl.js';
import MiddlewareControl from "../controllers/middlewareControl.js";

// User routes with the respective controller methods
const userRouter = Router();

// Register a new user route
userRouter.post('/register', UserControl.register);

// Login route
userRouter.post('/login', UserControl.login);

// Logout route
userRouter.get('/logout', MiddlewareControl.authMiddleware, UserControl.logout);

// Get user route
userRouter.get('/brief', MiddlewareControl.authMiddleware, UserControl.getUser);

// Get user details route
userRouter.get('/details', MiddlewareControl.authMiddleware, UserControl.getUserDetails);

// Update user route
userRouter.put('/update', MiddlewareControl.authMiddleware, UserControl.updateUser);

// update user password route
userRouter.put('/updatePassword', MiddlewareControl.authMiddleware, UserControl.updatePassword);

// Export the userRouter
export default userRouter;
