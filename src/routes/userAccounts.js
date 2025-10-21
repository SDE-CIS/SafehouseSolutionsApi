import Router from 'express';
import { getUserAccounts } from '../controllers/userAccountsController.js';
const router = Router();

router.get('/', getUserAccounts);

export default router;