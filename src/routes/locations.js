import Router from 'express';
import { getLocations, getLocationsByID, addLocation } from '../controllers/locationsController.js';
const router = Router();

router.get('/', getLocations);
router.get('/:id', getLocationsByID);
router.post('/', addLocation);

export default router;