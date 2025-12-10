import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import {
  updateUserSchema,
  updateUserRoleSchema,
  changePasswordSchema,
  queryUsersSchema,
  userIdParamSchema,
  createUserSchema,
} from './user.validation';
import { USER_ROLES } from '../../shared/constants';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes (any authenticated user)
router.get('/profile', userController.getProfile);
router.patch('/profile', validateRequest(updateUserSchema), userController.updateProfile);

// Change password
router.post(
  '/change-password',
  validateRequest(changePasswordSchema),
  userController.changePassword
);

// Get team members (any authenticated user)
router.get('/team-members', userController.getTeamMembers);

// Admin/Manager routes
router.get(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest(queryUsersSchema),
  userController.getUsers
);

router.get('/stats', authorize(USER_ROLES.ADMIN), userController.getUserStats);

router.get(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest(userIdParamSchema),
  userController.getUserById
);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN),
  validateRequest(createUserSchema),
  userController.createUser
);

router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  validateRequest({ userIdParamSchema, updateUserSchema }),
  userController.updateUser
);

router.patch(
  '/:id/role',
  authorize(USER_ROLES.ADMIN),
  validateRequest({ userIdParamSchema, updateUserRoleSchema }),
  userController.updateUserRole
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  validateRequest(userIdParamSchema),
  userController.deleteUser
);

export default router;
