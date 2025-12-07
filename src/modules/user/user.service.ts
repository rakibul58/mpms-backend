import mongoose, { Types } from 'mongoose';
import { User, IUserDocument } from './user.model';
import { ApiError } from '../../shared/errors';
import { UpdateUserInput, QueryUsersInput } from './user.validation';
import { IPaginationOptions, IPaginatedResult } from '../../shared/interfaces';
import { parsePagination, createPaginatedResult, calculateSkip } from '../../shared/utils';
import { Project } from '../project';

// Create user
export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
  skills?: string[];
}): Promise<IUserDocument> => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await User.create({
    ...data,
    email: data.email.toLowerCase(),
  });

  return user;
};

// Get user by ID
export const getUserById = async (id: string): Promise<IUserDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<IUserDocument | null> => {
  return User.findOne({ email: email.toLowerCase() });
};

// Query users with pagination
export const queryUsers = async (
  queryParams: QueryUsersInput
): Promise<IPaginatedResult<IUserDocument>> => {
  const paginationOptions: IPaginationOptions = parsePagination(queryParams);
  const { searchTerm, role, department, isActive } = queryParams;

  const filter: Record<string, unknown> = {};

  if (searchTerm) {
    filter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (department) {
    filter.department = { $regex: department, $options: 'i' };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const sort: Record<string, 1 | -1> = {
    [paginationOptions.sortBy || 'createdAt']: paginationOptions.sortOrder === 'asc' ? 1 : -1,
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(calculateSkip(paginationOptions.page, paginationOptions.limit))
      .limit(paginationOptions.limit),
    User.countDocuments(filter),
  ]);

  return createPaginatedResult(users, total, paginationOptions);
};

// Update user
export const updateUser = async (id: string, data: UpdateUserInput): Promise<IUserDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

// Update user role (admin only)
export const updateUserRole = async (id: string, role: string): Promise<IUserDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await user.deleteOne();
};

// Change password
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
};

// Get team members
export const getTeamMembers = async (): Promise<IUserDocument[]> => {
  return User.find({ isActive: true }).sort({ name: 1 });
};

// Get user stats
export const getUserStats = async (): Promise<{
  total: number;
  byRole: Record<string, number>;
  active: number;
  inactive: number;
}> => {
  const [total, byRole, active, inactive] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
  ]);

  const roleStats: Record<string, number> = {};
  byRole.forEach((item: { _id: string; count: number }) => {
    roleStats[item._id] = item.count;
  });

  return { total, byRole: roleStats, active, inactive };
};

// Get user's projects
export const getUserProjects = async (userId: string) => {
  const userObjectId = new Types.ObjectId(userId);

  return Project.find({
    $or: [{ createdBy: userObjectId }, { teamMembers: userObjectId }, { managers: userObjectId }],
  }).populate('createdBy', 'name email');
};
