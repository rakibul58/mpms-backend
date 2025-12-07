import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as authService from './auth.service';
import { catchAsync, sendResponse } from '../../shared/utils';
import { IAuthRequest } from '../../shared/interfaces';
import { config } from '../../config';

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'strict' as const,
};

// Register new user
export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  // Set cookies
  res.cookie('accessToken', result.tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', result.tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Registration successful',
    data: {
      user: result.user,
      tokens: result.tokens,
    },
  });
});

// Login user
export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  // Set cookies
  res.cookie('accessToken', result.tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', result.tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: {
      user: result.user,
      tokens: result.tokens,
    },
  });
});

// Refresh tokens
export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken);

  // Set new cookies
  res.cookie('accessToken', result.tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', result.tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tokens refreshed successfully',
    data: result,
  });
});

// Logout user
export const logout = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  await authService.logout(userId);

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Logout successful',
  });
});

// Get current user
export const me = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await authService.getCurrentUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User retrieved successfully',
    data: user,
  });
});

// Admin create user
export const adminCreateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.adminCreateUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: user,
  });
});
