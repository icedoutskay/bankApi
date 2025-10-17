import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { transferValidation, validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.post('/transfer', authenticate, transferValidation, validateRequest, transferController.initiateTransfer);

router.get('/transactions/history', authenticate, transferController.getTransactionHistory);

export default router;