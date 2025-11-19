import Router from 'express';
import { getCameraDataByID, getCameras, getCameraByID, addCamera, deleteCamera } from '../controllers/cameraController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/device', getCameras);
router.post('/device', addCamera);

router.get('/:id', getCameraDataByID);
router.get('/device/:id', getCameraByID);
router.delete('/device/:id', deleteCamera);

export default router;