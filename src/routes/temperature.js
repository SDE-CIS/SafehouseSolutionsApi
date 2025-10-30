import Router from 'express';
import {
    getTemperatureData, addTemperatureData, deleteTemperatureData,
    getFans, getFanByID, addFan, updateFan, deleteFan,
    getFanData, addFanActivity, 
} from '../controllers/temperatureController.js';
const router = Router();

router.get('/', getTemperatureData);
router.get('/fan', getFanData);
router.get('/fan/device', getFans);
router.get('/fan/device/:id', getFanByID);

router.post('/', addTemperatureData);
router.post('/fan', addFanActivity);
router.post('/fan/device', addFan);

router.put('/fan/device/:id', updateFan);

router.delete('/:id', deleteTemperatureData);
router.delete('/fan/device/:id', deleteFan);

export default router;