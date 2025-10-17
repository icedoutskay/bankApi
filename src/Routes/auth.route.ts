import { Router } from 'express';
import * as authController from '../controllers/auth.Controller';
import { authenticate } from '../middleware/auth.middleware';
import { signupValidation, signinValidation, validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.post('/signup', signupValidation, validateRequest, authController.signup);

router.post('/signin', signinValidation, validateRequest, authController.signin);

router.post('/refresh', authController.refresh);

router.post('/signout', authenticate, authController.signout);

export default router;