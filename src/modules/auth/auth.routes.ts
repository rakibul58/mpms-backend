import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  adminCreateUserSchema,
} from './auth.validation';
import { USER_ROLES } from '../../shared/constants';

const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest({ body: registerSchema }),
  authController.register
);

router.post(
  '/login',
  validateRequest({ body: loginSchema }),
  authController.login
);

router.post(
  '/refresh-token',
  validateRequest({ body: refreshTokenSchema }),
  authController.refreshTokens
);

// Protected routes
router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

// Admin only routes
router.post(
  '/admin/create-user',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validateRequest({ body: adminCreateUserSchema }),
  authController.adminCreateUser
);

export default router;
