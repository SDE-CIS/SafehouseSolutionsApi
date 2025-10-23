import Router from 'express';
import { getSensorTypes, getSensorTypesByID, addSensorType, updateSensorType, deleteSensorType } from '../controllers/sensorTypeController.js';
const router = Router();

router.get('/type', getSensorTypes);
router.get('/type/:id', getSensorTypesByID);
router.post('/type', addSensorType)
router.put('/type/:id', updateSensorType)
router.delete('/type/:id', deleteSensorType)

export default router;