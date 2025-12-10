import { Router } from 'express';
import * as projectController from './project.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import {
  createProjectSchema,
  updateProjectSchema,
  queryProjectsSchema,
  projectIdParamSchema,
  projectIdOrSlugParamSchema,
  updateTeamMembersSchema,
} from './project.validation';
import { USER_ROLES } from '../../shared/constants';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's projects (any authenticated user)
router.get('/my-projects', validateRequest(queryProjectsSchema), projectController.getMyProjects);

// Get all projects (Admin/Manager only)
router.get(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest(queryProjectsSchema),
  projectController.getProjects
);

// Create project (Admin/Manager only)
router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest(createProjectSchema),
  projectController.createProject
);

// Get project by ID or slug
router.get('/:idOrSlug', validateRequest(projectIdOrSlugParamSchema), projectController.getProject);

// Get project with stats
router.get(
  '/:idOrSlug/stats',
  validateRequest(projectIdOrSlugParamSchema),
  projectController.getProjectWithStats
);

// Update project (Admin/Manager only)
router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ projectIdParamSchema, updateProjectSchema }),
  projectController.updateProject
);

// Delete project (Admin only)
router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  validateRequest(projectIdParamSchema),
  projectController.deleteProject
);

// Add team members (Admin/Manager only)
router.post(
  '/:id/team-members',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ projectIdParamSchema, updateTeamMembersSchema }),
  projectController.addTeamMembers
);

// Remove team members (Admin/Manager only)
router.delete(
  '/:id/team-members',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ projectIdParamSchema, updateTeamMembersSchema }),
  projectController.removeTeamMembers
);

export default router;
