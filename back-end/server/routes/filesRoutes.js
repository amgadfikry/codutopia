import { Router } from "express";
import FilesControl from '../controllers/filesControl.js';
import MiddlewareControl from "../controllers/middlewareControl.js";
import multer from 'multer';

const filesRouter = Router();
const upload = multer();

filesRouter.post('/upload/:type',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor']), upload.single('file')],
  FilesControl.upload);

filesRouter.get('/get/:type/:key',
  FilesControl.get)

filesRouter.delete('/delete/:type/:key',
  [MiddlewareControl.authMiddleware, MiddlewareControl.roleMiddleware(['instructor'])],
  FilesControl.delete);


export default filesRouter;
