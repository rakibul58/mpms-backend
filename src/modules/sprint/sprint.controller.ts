import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as sprintService from './sprint.service';
import { catchAsync, sendResponse } from '../../shared/utils';

// Create sprint
export const createSprint = catchAsync(async (req: Request, res: Response) => {
  const sprint = await sprintService.createSprint(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Sprint created successfully',
    data: sprint,
  });
});

// Get sprint by ID
export const getSprint = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sprint = await sprintService.getSprintById(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sprint retrieved successfully',
    data: sprint,
  });
});

// Get sprints by project
export const getSprintsByProject = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const sprints = await sprintService.getSprintsByProject(projectId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sprints retrieved successfully',
    data: sprints,
  });
});

// Get active sprint
export const getActiveSprint = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const sprint = await sprintService.getActiveSprint(projectId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Active sprint retrieved successfully',
    data: sprint,
  });
});

// Update sprint
export const updateSprint = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sprint = await sprintService.updateSprint(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sprint updated successfully',
    data: sprint,
  });
});

// Delete sprint
export const deleteSprint = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await sprintService.deleteSprint(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sprint deleted successfully',
  });
});

// Reorder sprints
export const reorderSprints = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { sprintOrders } = req.body;
  const sprints = await sprintService.reorderSprints(projectId, sprintOrders);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sprints reordered successfully',
    data: sprints,
  });
});

// Get sprint with stats
export const getSprintStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await sprintService.getSprintStats(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sprint stats retrieved successfully',
    data: result,
  });
});
