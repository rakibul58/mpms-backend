import mongoose, { Document, Schema, Types } from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY } from '../../shared/constants';

export interface ISubtask {
  _id: Types.ObjectId;
  title: string;
  isCompleted: boolean;
}

export interface ITask {
  title: string;
  description?: string;
  project: Types.ObjectId;
  sprint?: Types.ObjectId;
  assignees: Types.ObjectId[];
  createdBy: Types.ObjectId;
  estimate?: number;
  timeLogged: number;
  priority: string;
  status: string;
  dueDate?: Date;
  completedAt?: Date;
  subtasks: ISubtask[];
  order: number;
  requiresReview: boolean;
  reviewedBy?: Types.ObjectId;
}

export interface ITaskDocument extends ITask, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

const taskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, trim: true, maxlength: 5000 },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sprint: { type: Schema.Types.ObjectId, ref: 'Sprint' },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    estimate: { type: Number, min: 0 },
    timeLogged: { type: Number, default: 0, min: 0 },
    priority: { type: String, enum: Object.values(TASK_PRIORITY), default: TASK_PRIORITY.MEDIUM },
    status: { type: String, enum: Object.values(TASK_STATUS), default: TASK_STATUS.TODO },
    dueDate: { type: Date },
    completedAt: { type: Date },
    subtasks: [subtaskSchema],
    order: { type: Number, default: 0 },
    requiresReview: { type: Boolean, default: false },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, sprint: 1 });
taskSchema.index({ assignees: 1 });

taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === TASK_STATUS.DONE) {
    this.completedAt = new Date();
  }
  next();
});

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);
