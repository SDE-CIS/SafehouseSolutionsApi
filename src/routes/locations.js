import Router from 'express';
import { getLocations, getLocationsByID } from '../controllers/locationsController.js';
const router = Router();

router.get('/', getLocations);
router.get('/:id', getLocationsByID);

export default router;