import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as userService from './user.service';
import { catchAsync, sendResponse } from '../../shared/utils';
import { IAuthRequest } from '../../shared/interfaces';

// Get current user profile
export const getProfile = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await userService.getUserById(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: user,
  });
});

// Update current user profile
export const updateProfile = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await userService.updateUser(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile updated successfully',
    data: user,
  });
});

// Get all users (Admin/Manager)
export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.queryUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get user by ID
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User retrieved successfully',
    data: user,
  });
});

// Create user (Admin)
export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: user,
  });
});

// Update user (Admin)
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.updateUser(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: user,
  });
});

// Update user role (Admin only)
export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await userService.updateUserRole(id, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User role updated successfully',
    data: user,
  });
});

// Delete user (Admin)
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUser(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
  });
});

// Change password
export const changePassword = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(userId, currentPassword, newPassword);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
  });
});

// Get team members
export const getTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const members = await userService.getTeamMembers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Team members retrieved successfully',
    data: members,
  });
});

// Get user stats (Admin)
export const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await userService.getUserStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User stats retrieved successfully',
    data: stats,
  });
});
