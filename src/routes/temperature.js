import Router from 'express';
import {
    getTemperatureData, addTemperatureData, deleteTemperatureData,
    getTemperatureDevices, getTemperatureDeviceByID, addTemperatureDevice, updateTemperatureDevice, deleteTemperatureDevice,
    getTemperatureSettings, getTemperatureSettingByID, addTemperatureSetting, updateTemperatureSetting, deleteTemperatureSetting,
    getFans, getFanByID, addFanDevice, updateFan, deleteFan,
    getFanData, //addFanActivity
} from '../controllers/temperatureController.js';
const router = Router();

router.get('/', getTemperatureData);
router.get('/device', getTemperatureDevices);
router.get('/device/setting', getTemperatureSettings);
router.get('/device/setting/:id', getTemperatureSettingByID);
router.get('/device/:id', getTemperatureDeviceByID);

router.get('/fan', getFanData);
router.get('/fan/device', getFans);
router.get('/fan/device/:id', getFanByID);

router.post('/', addTemperatureData);
router.post('/device', addTemperatureDevice);
router.post('/device/setting', addTemperatureSetting);
//router.post('/fan', addFanActivity);
router.post('/fan/device', addFanDevice);

router.put('/device/:id', updateTemperatureDevice);
router.put('/device/setting/:id', updateTemperatureSetting);
router.put('/fan/device/:id', updateFan);

router.delete('/:id', deleteTemperatureData);
router.delete('/device/:id', deleteTemperatureDevice);
router.delete('/fan/device/:id', deleteFan);
router.delete('/device/setting/:id', deleteTemperatureSetting);

export default router;