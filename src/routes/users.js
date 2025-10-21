import Router from 'express';
import { getUsers, getUsersByID } from '../controllers/usersController.js';
const router = Router();

router.get('/', getUsers);
router.get('/:id', getUsersByID);

export default router;