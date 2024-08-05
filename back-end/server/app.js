import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

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

// start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;
