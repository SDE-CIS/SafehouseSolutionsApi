import Router from 'express';
import { getUsers, getUsersByID, addUser, updateUser, updateUserPfp, deleteUser } from '../controllers/usersController.js';
const router = Router();

router.get('/', getUsers);
router.get('/:id', getUsersByID);

router.post('/', addUser);

router.put('/:id', updateUser);
router.put('/pfp/:id', updateUserPfp);

router.delete('/:id', deleteUser)

export default router;