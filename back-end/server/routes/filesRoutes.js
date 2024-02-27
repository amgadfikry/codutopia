import { Router } from "express";
import FilesControl from '../controllers/filesControl.js';
import MiddlewareControl from "../controllers/middlewareControl.js";
import multer from 'multer';

const filesRouter = Router();
const upload = multer();

filesRouter.post('/upload',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor']), upload.single('video')],
  FilesControl.uploadVideo);

filesRouter.get('/get/:key',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor', 'learner'])],
  FilesControl.getVideo)

filesRouter.post('/delete/:key',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor'])],
  FilesControl.deleteVideo);


export default filesRouter;
