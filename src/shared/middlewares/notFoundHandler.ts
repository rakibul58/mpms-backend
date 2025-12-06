import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};
