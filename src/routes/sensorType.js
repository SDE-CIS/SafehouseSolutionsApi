import Router from 'express';
import { getSensorTypes, getSensorTypesByID, addSensorType } from '../controllers/sensorTypeController.js';
const router = Router();

router.get('/type', getSensorTypes);
router.get('/type/:id', getSensorTypesByID);

router.post('/type', addSensorType)

export default router;