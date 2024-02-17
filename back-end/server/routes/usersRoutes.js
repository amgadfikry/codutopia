import { Router } from "express";
import UsersController from "../controller/usersControl.js";

const usersRouter = Router();

// Routte to register a user
usersRouter.post('/register', UsersController.register);
// Route to login a user
usersRouter.post('/login', UsersController.login);
// Route to logout a user
usersRouter.get('/logout', UsersController.logout);
// Route to update a user details
usersRouter.post('/update', UsersController.update);

// Export the usersRouter
export default usersRouter;
