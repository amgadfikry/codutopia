import express from 'express';
import cors from 'cors';
import testRouter from './routes/test';

// Create a new express application instance
const app = express();

// allow the server to accept JSON data
app.use(express.json());
// allow the server to accept requests from the front-end
app.use(cors());
// use the testRouter for any requests that start with /test
app.use(testRouter);

// start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
