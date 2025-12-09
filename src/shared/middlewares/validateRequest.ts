/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../errors';

export const validateRequest = (schema: any) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      if (schema.cookies) {
        req.cookies = await schema.cookies.parseAsync(req.cookies);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        next(ApiError.unprocessableEntity('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};
