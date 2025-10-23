import Router from 'express';
import { getUsers, getUsersByID, addUser, deleteUser } from '../controllers/usersController.js';
const router = Router();

router.get('/', getUsers);
router.get('/:id', getUsersByID);
router.post('/', addUser);
router.delete('/:id', deleteUser)

export default router;