import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as projectService from './project.service';
import { catchAsync, sendResponse } from '../../shared/utils';
import { IAuthRequest } from '../../shared/interfaces';
import {
  CreateProjectInput,
  UpdateProjectInput,
  QueryProjectsInput,
  UpdateTeamMembersInput,
} from './project.validation';

// Create a new project
export const createProject = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const data: CreateProjectInput = req.body;
  const project = await projectService.createProject(data, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Project created successfully',
    data: project,
  });
});

// Get all projects (Admin/Manager)
export const getProjects = catchAsync(async (req: Request, res: Response) => {
  const query: QueryProjectsInput = req.query as QueryProjectsInput;
  const result = await projectService.queryProjects(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Projects retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get user's projects
export const getMyProjects = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const query: QueryProjectsInput = req.query as QueryProjectsInput;
  const result = await projectService.getUserProjects(userId, query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Projects retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get project by ID or slug
export const getProject = catchAsync(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const project = await projectService.getProjectByIdOrSlug(idOrSlug);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Project retrieved successfully',
    data: project,
  });
});

// Get project with stats
export const getProjectWithStats = catchAsync(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const project = await projectService.getProjectByIdOrSlug(idOrSlug);
  const result = await projectService.getProjectStats(project._id.toString());

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Project retrieved successfully',
    data: result,
  });
});

// Update project
export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: UpdateProjectInput = req.body;
  const project = await projectService.updateProject(id, data);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Project updated successfully',
    data: project,
  });
});

// Delete project
export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await projectService.deleteProject(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Project deleted successfully',
  });
});

// Add team members
export const addTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userIds }: UpdateTeamMembersInput = req.body;
  const project = await projectService.addTeamMembers(id, userIds);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Team members added successfully',
    data: project,
  });
});

// Remove team members
export const removeTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userIds }: UpdateTeamMembersInput = req.body;
  const project = await projectService.removeTeamMembers(id, userIds);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Team members removed successfully',
    data: project,
  });
});
