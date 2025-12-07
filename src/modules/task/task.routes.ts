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
  validateRequest({ body: createTaskSchema }),
  taskController.createTask
);
router.get(
  '/project/:projectId',
  validateRequest({ params: projectIdParamSchema }),
  taskController.getTasksByProject
);
router.get(
  '/project/:projectId/kanban',
  validateRequest({ params: projectIdParamSchema }),
  taskController.getKanbanTasks
);
router.get(
  '/sprint/:sprintId',
  validateRequest({ params: sprintIdParamSchema }),
  taskController.getTasksBySprint
);
router.get('/:id', validateRequest({ params: taskIdParamSchema }), taskController.getTask);
router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.updateTask
);
router.patch(
  '/:id/status',
  validateRequest({ params: taskIdParamSchema, body: updateTaskStatusSchema }),
  taskController.updateTaskStatus
);
router.post(
  '/:id/log-time',
  validateRequest({ params: taskIdParamSchema, body: logTimeSchema }),
  taskController.logTime
);
router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validateRequest({ params: taskIdParamSchema }),
  taskController.deleteTask
);
router.post(
  '/:id/subtasks',
  validateRequest({ params: taskIdParamSchema, body: subtaskSchema }),
  taskController.addSubtask
);
router.patch(
  '/:id/subtasks/:subtaskId',
  validateRequest({ body: updateSubtaskSchema }),
  taskController.updateSubtask
);
router.delete('/:id/subtasks/:subtaskId', taskController.deleteSubtask);

export default router;
