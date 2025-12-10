/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import slugify from 'slugify';
import { PROJECT_STATUS, ProjectStatus } from '../../shared/constants';

export interface IProject {
  title: string;
  slug: string;
  client: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  status: ProjectStatus;
  thumbnail?: string;
  createdBy: Types.ObjectId;
  teamMembers: Types.ObjectId[];
  managers: Types.ObjectId[];
  progress?: number;
}

export interface IProjectDocument extends IProject, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectModel extends Model<IProjectDocument> {
  isSlugTaken(slug: string, excludeProjectId?: Types.ObjectId): Promise<boolean>;
}

const projectSchema = new Schema<IProjectDocument>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    client: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IProjectDocument, value: Date | null | undefined) {
          // Only validate if endDate has a value
          if (!value) return true;

          // Ensure startDate exists before comparing
          if (!this.startDate) return true;

          // Compare dates
          return new Date(value) >= new Date(this.startDate);
        },
        message: 'End date must be after start date',
      },
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNED,
    },
    thumbnail: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        const { __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Indexes
// projectSchema.index({ slug: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ teamMembers: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });

// Generate slug before saving
projectSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await Project.isSlugTaken(slug, this._id)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Virtual for sprints
projectSchema.virtual('sprints', {
  ref: 'Sprint',
  localField: '_id',
  foreignField: 'project',
});

// Virtual for tasks count
projectSchema.virtual('taskStats', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true,
});

// Static: Check if slug is taken
projectSchema.statics.isSlugTaken = async function (
  slug: string,
  excludeProjectId?: Types.ObjectId
): Promise<boolean> {
  const project = await this.findOne({
    slug,
    ...(excludeProjectId && { _id: { $ne: excludeProjectId } }),
  });
  return !!project;
};

export const Project = mongoose.model<IProjectDocument, IProjectModel>('Project', projectSchema);
