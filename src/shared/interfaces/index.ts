import { Request } from 'express';
import { Types } from 'mongoose';
import { UserRole } from '../constants';

// JWT Payload interface
export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Extended Express Request with user
export interface IAuthRequest extends Request {
  user?: IJwtPayload;
}

// Pagination interfaces
export interface IPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Query filters
export interface IQueryFilters {
  searchTerm?: string;
  [key: string]: unknown;
}

// API Response interfaces
export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Common MongoDB document fields
export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface IBaseDocument extends ITimestamps {
  _id: Types.ObjectId;
}

// File upload interface
export interface IUploadedFile {
  url: string;
  publicId?: string;
  filename: string;
  mimetype: string;
  size: number;
}
