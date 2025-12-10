import { Router } from 'express';
import * as taskController from './task.controller';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
  projectIdParamSchema,
  sprintIdParamSchema,
  logTimeSchema,
  subtaskSchema,
  updateSubtaskSchema,
} from './task.validation';
import { USER_ROLES } from '../../shared/constants';

const router = Router();
router.use(authenticate);

router.get('/my-tasks', taskController.getMyTasks);
router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest(createTaskSchema),
  taskController.createTask
);
router.get(
  '/project/:projectId',
  validateRequest(projectIdParamSchema),
  taskController.getTasksByProject
);
router.get(
  '/project/:projectId/kanban',
  validateRequest(projectIdParamSchema),
  taskController.getKanbanTasks
);
router.get(
  '/sprint/:sprintId',
  validateRequest(sprintIdParamSchema),
  taskController.getTasksBySprint
);
router.get('/:id', validateRequest(taskIdParamSchema), taskController.getTask);
router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ taskIdParamSchema, updateTaskSchema }),
  taskController.updateTask
);
router.patch(
  '/:id/status',
  validateRequest({ taskIdParamSchema, updateTaskStatusSchema }),
  taskController.updateTaskStatus
);
router.post(
  '/:id/log-time',
  validateRequest({ taskIdParamSchema, logTimeSchema }),
  taskController.logTime
);
router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest(taskIdParamSchema),
  taskController.deleteTask
);
router.post(
  '/:id/subtasks',
  validateRequest({ taskIdParamSchema, subtaskSchema }),
  taskController.addSubtask
);
router.patch(
  '/:id/subtasks/:subtaskId',
  validateRequest(updateSubtaskSchema),
  taskController.updateSubtask
);
router.delete('/:id/subtasks/:subtaskId', taskController.deleteSubtask);

export default router;
