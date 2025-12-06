import { Response } from 'express';
import { IApiResponse } from '../interfaces';

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const response: IApiResponse<T> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    ...(data.meta && { meta: data.meta }),
    ...(data.data !== undefined && { data: data.data }),
  };

  res.status(data.statusCode).json(response);
};
