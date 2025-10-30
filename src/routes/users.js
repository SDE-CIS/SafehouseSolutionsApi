import Router from 'express';
import { getUsers, getUsersByID, addUser, updateUser, deleteUser, updateUserProfilePicture } from '../controllers/usersController.js';
import { upload } from '../middleware/uploadMiddleware.js';
const router = Router();

router.get('/', getUsers);
router.get('/:id', getUsersByID);

router.post('/', addUser);

router.put('/:id', updateUser);
router.put("/avatar/:id", upload.single("file"), updateUserProfilePicture);

router.delete('/:id', deleteUser)

export default router;
