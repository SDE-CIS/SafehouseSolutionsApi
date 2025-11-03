import Router from 'express';
import {
    getCameraData, getCameraDataByID, addCameraData, deleteCameraData,
    getCameras, getCameraByID, addCamera, updateCamera, deleteCamera
} from '../controllers/cameraController.js';
const router = Router();

router.get('/', getCameraData);
router.get('/:id', getCameraDataByID);
router.get('/device', getCameras);
router.get('/device/:id', getCameraByID);

router.post('/', addCameraData);
router.post('/device', addCamera);

router.put('/device/:id', updateCamera);

router.delete('/:id', deleteCameraData);
router.delete('/device/:id', deleteCamera);

export default router;