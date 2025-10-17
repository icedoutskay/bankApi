import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/users', authenticate, authorize('admin'), adminController.getAllUsers);

router.get('/transactions', authenticate, authorize('admin'), adminController.getAllTransactions);

export default router;