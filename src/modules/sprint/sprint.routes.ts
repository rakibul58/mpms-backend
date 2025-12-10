import { Router } from 'express';
import * as sprintController from './sprint.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import {
  createSprintSchema,
  updateSprintSchema,
  sprintIdParamSchema,
  projectIdParamSchema,
  reorderSprintsSchema,
} from './sprint.validation';
import { USER_ROLES } from '../../shared/constants';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create sprint (Admin/Manager)
router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest(createSprintSchema),
  sprintController.createSprint
);

// Get sprints by project
router.get(
  '/project/:projectId',
  validateRequest({ params: projectIdParamSchema }),
  sprintController.getSprintsByProject
);

// Get active sprint
router.get(
  '/project/:projectId/active',
  validateRequest({ params: projectIdParamSchema }),
  sprintController.getActiveSprint
);

// Reorder sprints
router.patch(
  '/project/:projectId/reorder',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ params: projectIdParamSchema, body: reorderSprintsSchema }),
  sprintController.reorderSprints
);

// Get sprint by ID
router.get('/:id', validateRequest({ params: sprintIdParamSchema }), sprintController.getSprint);

// Get sprint stats
router.get(
  '/:id/stats',
  validateRequest({ params: sprintIdParamSchema }),
  sprintController.getSprintStats
);

// Update sprint (Admin/Manager)
router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ params: sprintIdParamSchema, body: updateSprintSchema }),
  sprintController.updateSprint
);

// Delete sprint (Admin/Manager)
router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ params: sprintIdParamSchema }),
  sprintController.deleteSprint
);

export default router;
