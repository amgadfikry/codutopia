import express from 'express';
import cors from 'cors';
import userRouter from './routes/usersRoutes.js';
import coursesRouter from './routes/coursesRoutes.js';
import filesRouter from './routes/filesRoutes.js';

// Create a new express application instance
const app = express();

// allow the server to accept JSON data
app.use(express.json());
// allow the server to accept requests from the front-end and set the credentials to true
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:80',
    'http://localhost', 'https://localhost', 'https://localhost:443'],
  credentials: true
}));
// set the headers to expose the token in the response header
app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});
// use the userRouter for any request that starts with /users
app.use('/users', userRouter);

// use the coursesRouter for any request that starts with /courses
app.use('/courses', coursesRouter);

app.use('/files', filesRouter);

// start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;
