import Router from 'express';
import { getSensorTypes, getSensorTypesByID } from '../controllers/sensorTypeController.js';
const router = Router();

router.get('', getSensorTypes);
router.get('/:id', getSensorTypesByID);

export default router;