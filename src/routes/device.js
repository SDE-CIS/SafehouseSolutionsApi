import Router from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllDevices } from '../controllers/deviceController.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getAllDevices);

export default router;
