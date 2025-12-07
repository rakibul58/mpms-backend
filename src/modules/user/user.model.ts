/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { USER_ROLES, UserRole } from '../../shared/constants';
import { config } from '../../config';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  skills: string[];
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  passwordChangedAt?: Date;
  refreshToken?: string;
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordChangedAfter(timestamp: number): boolean;
}

export interface IUserModel extends Model<IUserDocument> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.MEMBER,
    },
    department: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        const { password, refreshToken, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Index for better query performance
// userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ department: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, config.bcrypt.saltRounds);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// Instance method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: Check if password was changed after token was issued
userSchema.methods.isPasswordChangedAfter = function (timestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return timestamp < changedTimestamp;
  }
  return false;
};

// Static method: Check if email is taken
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const user = await this.findOne({
    email,
    ...(excludeUserId && { _id: { $ne: excludeUserId } }),
  });
  return !!user;
};

export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
