import Router from 'express';
import { getKeycards, getAccessLogs, getKeycardById, 
    getKeycardsStatuses, getKeycardsStatusesByID, addKeycardStatus, updateKeycardStatus, deleteKeycardStatus
} from '../controllers/keycardController.js';
const router = Router();

router.get('/', getKeycards);
router.get('/logs', getAccessLogs);
router.get('/status', getKeycardsStatuses);
router.get('/status/:id', getKeycardsStatusesByID);
router.get('/:id', getKeycardById);

router.post('/status', addKeycardStatus);

router.put('/status/:id', updateKeycardStatus);

router.delete('/status/:id', deleteKeycardStatus);

export default router;