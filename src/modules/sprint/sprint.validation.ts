import { z } from 'zod';
import { SPRINT_STATUS } from '../../shared/constants';

export const createSprintSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  projectId: z.string().min(1, 'Project ID is required'),
  description: z.string().max(1000).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum([SPRINT_STATUS.PLANNED, SPRINT_STATUS.ACTIVE, SPRINT_STATUS.COMPLETED]).optional(),
  goals: z.array(z.string()).optional(),
});

export const updateSprintSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum([SPRINT_STATUS.PLANNED, SPRINT_STATUS.ACTIVE, SPRINT_STATUS.COMPLETED]).optional(),
  goals: z.array(z.string()).optional(),
});

export const sprintIdParamSchema = z.object({
  id: z.string().min(1, 'Sprint ID is required'),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export const reorderSprintsSchema = z.object({
  sprintOrders: z.array(
    z.object({
      sprintId: z.string(),
      order: z.number(),
    })
  ),
});

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
