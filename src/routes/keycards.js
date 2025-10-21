import Router from 'express';
import { getKeycards, getAccessLogs, getKeycardById, getKeycardsStatuses, getKeycardsStatusesByID} from '../controllers/keycardController.js';
const router = Router();

router.get('/', getKeycards);
router.get('/logs', getAccessLogs);
router.get('/status', getKeycardsStatuses);
router.get('/status/:id', getKeycardsStatusesByID);
router.get('/:id', getKeycardById);

export default router;