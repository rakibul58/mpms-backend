import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { config } from '../../config';
import { ApiError } from '../errors';

interface IErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, unknown>[];
  stack?: string;
}

const handleZodError = (error: ZodError): ApiError => {
  const errors = error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return ApiError.unprocessableEntity('Validation failed', errors);
};

const handleCastError = (error: mongoose.Error.CastError): ApiError => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return ApiError.badRequest(message);
};

const handleDuplicateKeyError = (error: { keyValue: Record<string, unknown> }): ApiError => {
  const field = Object.keys(error.keyValue)[0];
  const message = `${field} already exists`;
  return ApiError.conflict(message);
};

const handleValidationError = (error: mongoose.Error.ValidationError): ApiError => {
  const errors = Object.values(error.errors).map(el => ({
    path: el.path,
    message: el.message,
  }));

  return ApiError.unprocessableEntity('Validation failed', errors);
};

const handleJWTError = (): ApiError => {
  return ApiError.unauthorized('Invalid token. Please log in again');
};

const handleJWTExpiredError = (): ApiError => {
  return ApiError.unauthorized('Token expired. Please log in again');
};

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let error = err;

  // Zod validation error
  if (error instanceof ZodError) {
    error = handleZodError(error);
  }

  // Mongoose CastError
  if (error instanceof mongoose.Error.CastError) {
    error = handleCastError(error);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    error = handleDuplicateKeyError(error);
  }

  // Mongoose validation error
  if (error instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(error);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Default to ApiError if not already
  if (!(error instanceof ApiError)) {
    error = new ApiError(error.statusCode || 500, error.message || 'Something went wrong', false);
  }

  const response: IErrorResponse = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(config.env === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
