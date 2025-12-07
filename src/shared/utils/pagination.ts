import { PAGINATION } from '../constants';
import { IPaginationOptions, IPaginatedResult } from '../interfaces';

export interface RawPaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  [key: string]: unknown | any; // Allow additional properties
}

export const parsePagination = (query: RawPaginationQuery): IPaginationOptions => {
  const page = Math.max(1, parseInt(String(query.page || '')) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(String(query.limit || '')) || PAGINATION.DEFAULT_LIMIT)
  );
  const sortBy = String(query.sortBy || 'createdAt');
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
};

export const createPaginatedResult = <T>(
  data: T[],
  total: number,
  options: IPaginationOptions
): IPaginatedResult<T> => {
  const totalPages = Math.ceil(total / options.limit);

  return {
    data,
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
      hasNextPage: options.page < totalPages,
      hasPrevPage: options.page > 1,
    },
  };
};

export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};