import { z } from 'zod';
import { USER_ROLES } from '../../shared/constants';

// Common validation patterns
const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .trim();

const emailSchema = z.string().email('Invalid email format').trim().toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const roleSchema = z.enum([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.MEMBER]);

// Create user validation
export const createUserSchema = z.object({
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema.optional().default(USER_ROLES.MEMBER),
    department: z.string().trim().optional(),
    skills: z.array(z.string().trim()).optional().default([]),
  }),
});

// Update user validation
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      department: z.string().trim().optional(),
      skills: z.array(z.string().trim()).optional(),
      avatar: z.string().url('Invalid avatar URL').optional(),
      isActive: z.boolean().optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field is required for update',
    }),
});

// Update user role validation (Admin only)
export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    role: roleSchema,
  }),
});

// Get user by ID validation
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

// Reusable param schema for routes that only need user ID
export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// Query users validation
export const queryUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().optional(),
    role: roleSchema.optional(),
    department: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

// Change password validation
export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

// Types
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>['body'];
export type QueryUsersInput = z.infer<typeof queryUsersSchema>['query'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
