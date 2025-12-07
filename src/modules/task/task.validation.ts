import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  projectId: z.string().min(1),
  sprintId: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  estimate: z.number().min(0).optional(),
  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT])
    .optional(),
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW, TASK_STATUS.DONE])
    .optional(),
  dueDate: z.string().optional(),
  requiresReview: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  sprintId: z.string().nullable().optional(),
  assignees: z.array(z.string()).optional(),
  estimate: z.number().min(0).nullable().optional(),
  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT])
    .optional(),
  dueDate: z.string().nullable().optional(),
  requiresReview: z.boolean().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW, TASK_STATUS.DONE]),
});

export const taskIdParamSchema = z.object({ id: z.string().min(1) });
export const projectIdParamSchema = z.object({ projectId: z.string().min(1) });
export const sprintIdParamSchema = z.object({ sprintId: z.string().min(1) });

export const logTimeSchema = z.object({
  hours: z.number().min(0.1),
  description: z.string().optional(),
});

export const subtaskSchema = z.object({ title: z.string().min(1) });
export const updateSubtaskSchema = z.object({
  title: z.string().min(1).optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
