import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/usersRoutes.js';
import coursesRouter from './routes/coursesRoutes.js';
import filesRouter from './routes/filesRoutes.js';

// Create a new express application instance
const app = express();

// allow the server to accept JSON data
app.use(express.json());
// allow the server to accept requests from the front-end and set the credentials to true
app.use(cors());
// set the headers to expose the token in the response header
app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});
// use morgan for logging the requests to the console
app.use(morgan('dev'));
// use the userRouter for any request that starts with /users
app.use('/users', userRouter);
// use the coursesRouter for any request that starts with /courses
app.use('/courses', coursesRouter);
// use the filesRouter for any request that starts with /files
app.use('/files', filesRouter);

// start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;
