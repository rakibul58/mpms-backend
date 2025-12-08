import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as reportService from './report.service';
import { catchAsync, sendResponse } from '../../shared/utils';
import { IAuthRequest } from '../../shared/interfaces';

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await reportService.getDashboardStats();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Dashboard stats retrieved',
    data: stats,
  });
});

export const getMyReport = catchAsync(async (req: IAuthRequest, res: Response) => {
  const report = await reportService.getMyReport(req.user!.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Report retrieved',
    data: report,
  });
});

export const getProjectReport = catchAsync(async (req: Request, res: Response) => {
  const report = await reportService.getProjectReport(req.params.projectId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Project report retrieved',
    data: report,
  });
});
