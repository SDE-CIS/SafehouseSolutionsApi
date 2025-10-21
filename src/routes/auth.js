import Router from 'express';
import { authUser, refreshToken } from '../controllers/authController.js';
const router = Router();
router.post('/', authUser);
router.post('/refresh', refreshToken);
export default router;