import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment {
  content: string;
  task: Types.ObjectId;
  author: Types.ObjectId;
  parentComment?: Types.ObjectId;
  isEdited: boolean;
  editedAt?: Date;
}

export interface ICommentDocument extends IComment, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

commentSchema.index({ task: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

export const Comment = mongoose.model<ICommentDocument>('Comment', commentSchema);
