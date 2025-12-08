import { Types } from 'mongoose';
import { Comment, ICommentDocument } from './comment.model';
import { Task } from '../task/task.model';
import { ApiError } from '../../shared/errors';
import { CreateCommentInput, UpdateCommentInput } from './comment.validation';

export const createComment = async (
  taskId: string,
  data: CreateCommentInput,
  userId: string
): Promise<ICommentDocument> => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');

  const comment = await Comment.create({
    content: data.content,
    task: new Types.ObjectId(taskId),
    author: new Types.ObjectId(userId),
    parentComment: data.parentCommentId ? new Types.ObjectId(data.parentCommentId) : undefined,
  });

  return comment.populate('author', 'name email avatar');
};

export const getCommentsByTask = async (taskId: string): Promise<ICommentDocument[]> => {
  return Comment.find({ task: taskId, parentComment: { $exists: false } })
    .populate('author', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const updateComment = async (
  id: string,
  data: UpdateCommentInput,
  userId: string
): Promise<ICommentDocument> => {
  const comment = await Comment.findById(id);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.author.toString() !== userId)
    throw ApiError.forbidden('You can only edit your own comments');

  comment.content = data.content;
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  return comment.populate('author', 'name email avatar');
};

export const deleteComment = async (
  id: string,
  userId: string,
  userRole: string
): Promise<void> => {
  const comment = await Comment.findById(id);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.author.toString() !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You can only delete your own comments');
  }
  await Comment.deleteMany({ parentComment: comment._id });
  await comment.deleteOne();
};
