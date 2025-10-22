import Router from 'express';
import { getSensorTypes, getSensorTypesByID } from '../controllers/sensorTypeController.js';
const router = Router();

router.get('/type', getSensorTypes);
router.get('/type/:id', getSensorTypesByID);

export default router;