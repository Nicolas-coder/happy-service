import { Router } from 'express';
import multer from 'multer';

import uploadConfig from './config/upload';
import OrphanageController from "./controllers/OrphanageController";

const routes = Router();
const upload = multer(uploadConfig);

routes.post('/orphanages/create', upload.array('images'), OrphanageController.create);
routes.get('/orphanages/list', OrphanageController.list);
routes.get('/orphanages/show/:id', OrphanageController.show);

export default routes;