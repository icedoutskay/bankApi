// src/routes/v1/account.routes.ts
import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.get('/balance', authenticate, accountController.getBalance);

router.post(
  '/deposit',
  authenticate,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('description').optional().trim()
  ],
  validateRequest,
  accountController.deposit
);

export default router;