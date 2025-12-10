import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { SPRINT_STATUS } from '../../shared/constants';

export interface ISprint {
  title: string;
  sprintNumber: number;
  project: Types.ObjectId;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: string;
  goals?: string[];
  order: number;
}

export interface ISprintDocument extends ISprint, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISprintModel extends Model<ISprintDocument> {
  getNextSprintNumber(projectId: Types.ObjectId): Promise<number>;
}

const sprintSchema = new Schema<ISprintDocument>(
  {
    title: {
      type: String,
      required: [true, 'Sprint title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    sprintNumber: {
      type: Number,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: Object.values(SPRINT_STATUS),
      default: SPRINT_STATUS.PLANNED,
    },
    goals: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
sprintSchema.index({ project: 1, sprintNumber: 1 }, { unique: true });
sprintSchema.index({ project: 1, status: 1 });
sprintSchema.index({ project: 1, order: 1 });

// Static method to get next sprint number
sprintSchema.statics.getNextSprintNumber = async function (
  projectId: Types.ObjectId
): Promise<number> {
  const lastSprint = await this.findOne({ project: projectId })
    .sort({ sprintNumber: -1 })
    .select('sprintNumber');
  return lastSprint ? lastSprint.sprintNumber + 1 : 1;
};

// Pre-save hook to set sprint number
sprintSchema.pre('save', async function (next) {
  if (this.isNew) {
    if (!this.sprintNumber) {
      this.sprintNumber = await (this.constructor as ISprintModel).getNextSprintNumber(
        this.project
      );
    }
    if (!this.order) {
      this.order = this.sprintNumber;
    }
  }
  next();
});

// Validate end date > start date
sprintSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

export const Sprint = mongoose.model<ISprintDocument, ISprintModel>('Sprint', sprintSchema);
