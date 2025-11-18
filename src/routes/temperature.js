import Router from 'express';
import {
    getTemperatureData, addTemperatureData, getLatestTemperature, deleteTemperatureData,
    getTemperatureDevices, getTemperatureDeviceByID, addTemperatureDevice, updateTemperatureDevice, deleteTemperatureDevice,
    getTemperatureSettings, getTemperatureSettingByID, addTemperatureSetting, updateTemperatureSetting, deleteTemperatureSetting,
    getUsersFans, addFanDevice, updateFan, deleteFan,
    getFanData, postFanControl
} from '../controllers/temperatureController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getTemperatureData);
router.get('/latest', getLatestTemperature);
router.get('/device/setting', getTemperatureSettings);
router.get('/device/setting/:id', getTemperatureSettingByID);
router.get('/device/:userId', getTemperatureDevices);
router.get('/device/:id', getTemperatureDeviceByID);
router.get('/fan', getFanData);
router.get('/fan/device/:userId', getUsersFans);

router.post('/', addTemperatureData);
router.post('/device', addTemperatureDevice);
router.post('/device/setting', addTemperatureSetting);
router.post('/fan', postFanControl);
router.post('/fan/device', addFanDevice);

router.put('/device/:id', updateTemperatureDevice);
router.put('/device/setting/:id', updateTemperatureSetting);
router.put('/fan/device/:id', updateFan);

router.delete('/:id', deleteTemperatureData);
router.delete('/device/:id', deleteTemperatureDevice);
router.delete('/fan/device/:id', deleteFan);
router.delete('/device/setting/:id', deleteTemperatureSetting);

export default router;