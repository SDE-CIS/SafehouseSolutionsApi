import Router from 'express';
import { getTemperatures, addTemperature, getFanActivity, addFanActivity } from '../controllers/temperatureSensorController.js';
const router = Router();

router.get('/', getTemperatures);
router.get('/fan', getFanActivity);

router.post('/', addTemperature);
router.post('/fan', addFanActivity);

export default router;