import { z } from 'zod';
import { USER_ROLES } from '../../shared/constants';

// Registration validation
export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .trim(),
      email: z.string().email('Invalid email format').trim().toLowerCase(),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      confirmPassword: z.string().min(1, 'Confirm password is required'),
      department: z.string().trim().optional(),
      skills: z.array(z.string().trim()).optional().default([]),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

// Login validation
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Refresh token validation
export const refreshTokenSchema = z.object({
  cookies: z
    .object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    })
    .optional(),
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
  }),
});

// Reset password validation
export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Reset token is required'),
  }),
  body: z
    .object({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      confirmPassword: z.string().min(1, 'Confirm password is required'),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

// Admin create user validation (with role)
export const adminCreateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z
      .enum([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.MEMBER])
      .default(USER_ROLES.MEMBER),
    department: z.string().trim().optional(),
    skills: z.array(z.string().trim()).optional().default([]),
  }),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>['body'];
