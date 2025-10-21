import Router from 'express';
import { getUnits, getUnitById } from '../controllers/unitController.js';
const router = Router();

router.get('/', getUnits);
router.get('/:id', getUnitById);

export default router;