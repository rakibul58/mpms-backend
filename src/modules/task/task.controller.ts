import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as taskService from './task.service';
import { catchAsync, sendResponse } from '../../shared/utils';
import { IAuthRequest } from '../../shared/interfaces';

export const createTask = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const task = await taskService.createTask(req.body, userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Task created successfully',
    data: task,
  });
});

export const getTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Task retrieved successfully',
    data: task,
  });
});

export const getTasksByProject = catchAsync(async (req: Request, res: Response) => {
  const tasks = await taskService.getTasksByProject(req.params.projectId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tasks retrieved successfully',
    data: tasks,
  });
});

export const getTasksBySprint = catchAsync(async (req: Request, res: Response) => {
  const tasks = await taskService.getTasksBySprint(req.params.sprintId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tasks retrieved successfully',
    data: tasks,
  });
});

export const getMyTasks = catchAsync(async (req: IAuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { searchTerm, priority, status } = req.query;

  const tasks = await taskService.getMyTasks(userId, {
    searchTerm: searchTerm as string,
    priority: priority as string,
    status: status as string,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Tasks retrieved successfully',
    data: tasks,
  });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Task updated successfully',
    data: task,
  });
});

export const updateTaskStatus = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = await taskService.updateTaskStatus(id, status, req.user!.userId, req.user!.role);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Task status updated successfully',
    data: task,
  });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Task deleted successfully',
  });
});

export const logTime = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { hours } = req.body;
  const task = await taskService.logTime(id, hours);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Time logged successfully',
    data: task,
  });
});

export const getKanbanTasks = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { sprintId } = req.query;
  const tasks = await taskService.getKanbanTasks(projectId, sprintId as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Kanban tasks retrieved',
    data: tasks,
  });
});

export const addSubtask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const task = await taskService.addSubtask(id, title);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Subtask added',
    data: task,
  });
});

export const updateSubtask = catchAsync(async (req: Request, res: Response) => {
  const { id, subtaskId } = req.params;
  const task = await taskService.updateSubtask(id, subtaskId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Subtask updated',
    data: task,
  });
});

export const deleteSubtask = catchAsync(async (req: Request, res: Response) => {
  const { id, subtaskId } = req.params;
  const task = await taskService.deleteSubtask(id, subtaskId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Subtask deleted',
    data: task,
  });
});
