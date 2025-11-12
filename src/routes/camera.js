import Router from 'express';
import { getCameras, getCameraByID, addCamera, deleteCamera } from '../controllers/cameraController.js';
const router = Router();

router.get('/device', getCameras);
router.get('/device/:id', getCameraByID);
router.post('/device', addCamera);
router.delete('/device/:id', deleteCamera);

export default router;