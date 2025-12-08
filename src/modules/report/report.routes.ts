import { Router } from 'express';
import * as reportController from './report.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { USER_ROLES } from '../../shared/constants';

const router = Router();
router.use(authenticate);

router.get(
  '/dashboard',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  reportController.getDashboardStats
);
router.get('/my-report', reportController.getMyReport);
router.get(
  '/project/:projectId',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  reportController.getProjectReport
);

export default router;
