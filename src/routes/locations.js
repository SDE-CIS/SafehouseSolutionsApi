import Router from 'express';
import { getLocations, getLocationsByID, addLocation, updateLocation, deleteLocation } from '../controllers/locationsController.js';
const router = Router();

router.get('/', getLocations);
router.get('/:id', getLocationsByID);
router.post('/', addLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;