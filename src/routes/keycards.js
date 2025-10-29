import Router from 'express';
import {
    getKeycards, getAccessLogs, getKeycardById, addKeycard, updateKeycard, deleteKeycard,
    getKeycardsStatuses, getKeycardsStatusesByID, addKeycardStatus, updateKeycardStatus, deleteKeycardStatus
} from '../controllers/keycardController.js';
const router = Router();

router.get('/', getKeycards);
router.get('/logs', getAccessLogs);
router.get('/status', getKeycardsStatuses);
router.get('/status/:id', getKeycardsStatusesByID);
router.get('/:id', getKeycardById);

router.post('/', addKeycard);
router.post('/status', addKeycardStatus);

router.put('/:id', updateKeycard);
router.put('/status/:id', updateKeycardStatus);

router.delete('/:id', deleteKeycard);
router.delete('/status/:id', deleteKeycardStatus);

export default router;