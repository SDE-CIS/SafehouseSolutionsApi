import Router from 'express';
import { getLocations, getLocationsByID, addLocation, updateLocation, deleteLocation } from '../controllers/locationsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getLocations);
router.get('/:id', getLocationsByID);
router.post('/', addLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);
export default router;