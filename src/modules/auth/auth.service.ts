/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model';
import { ApiError } from '../../shared/errors';
import { config } from '../../config';
import { RegisterInput, LoginInput } from './auth.validation';
import { IJwtPayload } from '../../shared/interfaces';
import { UserRole } from '../../shared/constants';

// Generate access token
export const generateAccessToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

// Generate refresh token
export const generateRefreshToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

// Generate both tokens
export const generateTokens = (
  userId: string,
  role: UserRole
): { accessToken: string; refreshToken: string } => {
  const payload: IJwtPayload = { userId, role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

// Register new user
export const register = async (data: RegisterInput) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  // Create user
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    department: data.department,
  });

  // Generate tokens
  const tokens = generateTokens(user._id.toString(), user.role);

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    user,
    tokens,
  };
};

// Login user
export const login = async (data: LoginInput) => {
  const { email, password } = data;

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokens(user._id.toString(), user.role);

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  // Remove password from response
  const userResponse = user.toObject() as unknown as Record<string, unknown>;
  const { password: _, ...userWithoutPassword } = userResponse;

  return {
    user: userWithoutPassword,
    tokens,
  };
};

// Refresh tokens
export const refreshTokens = async (refreshToken: string) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as IJwtPayload;

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken,
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString(), user.role);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { tokens };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    throw error;
  }
};

// Logout user
export const logout = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// Get current user
export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

// Admin create user with role
export const adminCreateUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
}) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  // Create user
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    role: data.role || 'member',
    department: data.department,
  });

  return user;
};
