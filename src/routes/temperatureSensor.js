import Router from 'express';
import { getTemperatures, getFanActivity } from '../controllers/temperatureSensorController.js';
const router = Router();

router.get('/', getTemperatures);
router.get('/fan', getFanActivity);

export default router;