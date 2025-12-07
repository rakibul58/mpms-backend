import { z } from 'zod';
import { PROJECT_STATUS } from '../../shared/constants';

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format');

// Create project validation
export const createProjectSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim(),
      client: z.string().min(1, 'Client name is required').trim(),
      description: z
        .string()
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim()
        .optional(),
      startDate: z.string().datetime({ message: 'Invalid start date' }).or(z.date()),
      endDate: z.string().datetime({ message: 'Invalid end date' }).or(z.date()).optional(),
      budget: z.number().min(0, 'Budget cannot be negative').optional(),
      status: z
        .enum([
          PROJECT_STATUS.PLANNED,
          PROJECT_STATUS.ACTIVE,
          PROJECT_STATUS.COMPLETED,
          PROJECT_STATUS.ARCHIVED,
        ])
        .optional()
        .default(PROJECT_STATUS.PLANNED),
      teamMembers: z.array(objectIdSchema).optional().default([]),
      managers: z.array(objectIdSchema).optional().default([]),
    })
    .refine(
      data => {
        if (data.endDate && data.startDate) {
          return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
      },
      {
        message: 'End date must be after start date',
        path: ['endDate'],
      }
    ),
});

// Update project validation
export const updateProjectSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .trim()
        .optional(),
      client: z.string().min(1, 'Client name is required').trim().optional(),
      description: z
        .string()
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim()
        .optional(),
      startDate: z.string().datetime({ message: 'Invalid start date' }).or(z.date()).optional(),
      endDate: z
        .string()
        .datetime({ message: 'Invalid end date' })
        .or(z.date())
        .nullable()
        .optional(),
      budget: z.number().min(0, 'Budget cannot be negative').nullable().optional(),
      status: z
        .enum([
          PROJECT_STATUS.PLANNED,
          PROJECT_STATUS.ACTIVE,
          PROJECT_STATUS.COMPLETED,
          PROJECT_STATUS.ARCHIVED,
        ])
        .optional(),
      thumbnail: z.string().url('Invalid thumbnail URL').optional(),
      teamMembers: z.array(objectIdSchema).optional(),
      managers: z.array(objectIdSchema).optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field is required for update',
    }),
});

// Get project by ID or slug
export const getProjectSchema = z.object({
  params: z.object({
    idOrSlug: z.string().min(1, 'Project ID or slug is required'),
  }),
});

// Query projects validation
export const queryProjectsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().optional(),
    status: z
      .enum([
        PROJECT_STATUS.PLANNED,
        PROJECT_STATUS.ACTIVE,
        PROJECT_STATUS.COMPLETED,
        PROJECT_STATUS.ARCHIVED,
      ])
      .optional(),
    client: z.string().optional(),
    startDateFrom: z.string().optional(),
    startDateTo: z.string().optional(),
  }),
});

// Add/remove team members
export const updateTeamMembersSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    userIds: z.array(objectIdSchema).min(1, 'At least one user ID is required'),
  }),
});

// Delete project
export const deleteProjectSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

// Reusable param schemas
export const projectIdParamSchema = z.object({
  id: objectIdSchema,
});

export const projectIdOrSlugParamSchema = z.object({
  idOrSlug: z.string().min(1, 'Project ID or slug is required'),
});

// Types
export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type QueryProjectsInput = z.infer<typeof queryProjectsSchema>['query'];
export type UpdateTeamMembersInput = z.infer<typeof updateTeamMembersSchema>['body'];
