import Router from 'express';
import {
    getTemperatureData, addTemperatureData, deleteTemperatureData,
    getTemperatureDevices, getTemperatureDeviceByID, addTemperatureDevice, updateTemperatureDevice, deleteTemperatureDevice,
    getFans, getFanByID, addFan, updateFan, deleteFan,
    getFanData, addFanActivity, 
} from '../controllers/temperatureController.js';
const router = Router();

router.get('/', getTemperatureData);
router.get('/device', getTemperatureDevices);
router.get('/device/:id', getTemperatureDeviceByID);

router.get('/fan', getFanData);
router.get('/fan/device', getFans);
router.get('/fan/device/:id', getFanByID);

router.post('/', addTemperatureData);
router.post('/device', addTemperatureDevice);
router.post('/fan', addFanActivity);
router.post('/fan/device', addFan);

router.put('/device/:id', updateTemperatureDevice);
router.put('/fan/device/:id', updateFan);

router.delete('/:id', deleteTemperatureData);
router.delete('/device/:id', deleteTemperatureDevice);
router.delete('/fan/device/:id', deleteFan);

export default router;