import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as commentService from './comment.service';
import { catchAsync, sendResponse } from '../../shared/utils';
import { IAuthRequest } from '../../shared/interfaces';

export const createComment = catchAsync(async (req: IAuthRequest, res: Response) => {
  const { taskId } = req.params;
  const comment = await commentService.createComment(taskId, req.body, req.user!.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Comment created',
    data: comment,
  });
});

export const getCommentsByTask = catchAsync(async (req: Request, res: Response) => {
  const comments = await commentService.getCommentsByTask(req.params.taskId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Comments retrieved',
    data: comments,
  });
});

export const updateComment = catchAsync(async (req: IAuthRequest, res: Response) => {
  const comment = await commentService.updateComment(req.params.id, req.body, req.user!.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Comment updated',
    data: comment,
  });
});

export const deleteComment = catchAsync(async (req: IAuthRequest, res: Response) => {
  await commentService.deleteComment(req.params.id, req.user!.userId, req.user!.role);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: 'Comment deleted' });
});
