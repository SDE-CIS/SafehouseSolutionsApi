import Router from 'express';
import { getUsers, getUsersByID, addUser, getUserAccounts, addUserAccount } from '../controllers/usersController.js';
const router = Router();

router.get('/', getUsers);
router.get('/:id', getUsersByID);
router.post('/', addUser);
router.get('/accounts', getUserAccounts);
router.post('/accounts', addUserAccount);

export default router;