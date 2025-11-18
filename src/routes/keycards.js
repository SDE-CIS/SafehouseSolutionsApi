import Router from 'express';
import {
    getKeycards, getKeycardById, addKeycard, updateKeycard, deleteKeycard,
    getKeycardsStatuses, getAKeycardsAccessLogs, getKeycardsStatusesByID, addKeycardStatus, updateKeycardStatus, deleteKeycardStatus,
    getKeycardOwners, getAccessLogs, updateSmartLockState,
    updateRfidDevice
} from '../controllers/keycardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getKeycards);
router.get('/logs', getAccessLogs);
router.get('/logs/:rfid', getAKeycardsAccessLogs);
router.get('/name/:id', getKeycardOwners);
router.get('/status', getKeycardsStatuses);
router.get('/status/:id', getKeycardsStatusesByID);

router.post('/', addKeycard);
router.post('/status', addKeycardStatus);
router.post('/rfid', updateSmartLockState);

router.put('/status/:id', updateKeycardStatus);
router.put('/rfid/assign', updateRfidDevice);

router.delete('/status/:id', deleteKeycardStatus);

router.get('/:id', getKeycardById);
router.put('/:id', updateKeycard);
router.delete('/:id', deleteKeycard);

export default router;