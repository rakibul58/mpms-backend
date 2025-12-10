/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { Task, ITaskDocument } from './task.model';
import { Project } from '../project/project.model';
import { ApiError } from '../../shared/errors';
import { CreateTaskInput, UpdateTaskInput } from './task.validation';
import { TASK_STATUS } from '../../shared/constants';
import { MyTasksFilters } from '../../shared/interfaces';

export const createTask = async (data: CreateTaskInput, userId: string): Promise<ITaskDocument> => {
  const project = await Project.findById(data.projectId);
  if (!project) throw ApiError.notFound('Project not found');

  const task = await Task.create({
    title: data.title,
    description: data.description,
    project: new Types.ObjectId(data.projectId),
    sprint: data.sprintId ? new Types.ObjectId(data.sprintId) : undefined,
    assignees: data.assignees?.map(id => new Types.ObjectId(id)) || [],
    createdBy: new Types.ObjectId(userId),
    estimate: data.estimate,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    requiresReview: data.requiresReview,
  });

  return task.populate([
    { path: 'project', select: 'title slug' },
    { path: 'sprint', select: 'title sprintNumber' },
    { path: 'assignees', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email' },
  ]);
};

export const getTaskById = async (id: string): Promise<ITaskDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid task ID');
  const task = await Task.findById(id)
    .populate('project', 'title slug')
    .populate('sprint', 'title sprintNumber')
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email');
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

export const getTasksByProject = async (projectId: string): Promise<ITaskDocument[]> => {
  return Task.find({ project: projectId })
    .populate('assignees', 'name email avatar')
    .sort({ order: 1 });
};

export const getTasksBySprint = async (sprintId: string): Promise<ITaskDocument[]> => {
  return Task.find({ sprint: sprintId })
    .populate('assignees', 'name email avatar')
    .sort({ order: 1 });
};

export const getMyTasks = async (
  userId: string, 
  filters: MyTasksFilters = {}
): Promise<ITaskDocument[]> => {
  const query: any = { 
    assignees: new Types.ObjectId(userId) 
  };
  
  // Apply status filter
  if (filters.status) {
    query.status = filters.status;
  }
  
  // Apply priority filter
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  // Build the base query
  let taskQuery = Task.find(query)
    .populate('project', 'title slug')
    .populate('sprint', 'title sprintNumber');
  
  // Apply search filter (searches in title and description)
  if (filters.searchTerm && filters.searchTerm.trim()) {
    taskQuery = taskQuery.find({
      $or: [
        { title: { $regex: filters.searchTerm, $options: 'i' } },
        { description: { $regex: filters.searchTerm, $options: 'i' } }
      ]
    });
  }
  
  // Sort by due date and priority
  return taskQuery.sort({ dueDate: 1, priority: -1 });
};

export const updateTask = async (id: string, data: UpdateTaskInput): Promise<ITaskDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid task ID');

  const updateData: Record<string, unknown> = { ...data };
  if (data.sprintId) updateData.sprint = new Types.ObjectId(data.sprintId);
  if (data.sprintId === null) updateData.sprint = null;
  if (data.assignees) updateData.assignees = data.assignees.map(id => new Types.ObjectId(id));
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.dueDate === null) updateData.dueDate = null;

  const task = await Task.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('project', 'title slug')
    .populate('sprint', 'title sprintNumber')
    .populate('assignees', 'name email avatar');
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

export const updateTaskStatus = async (
  id: string,
  status: string,
  userId: string,
  userRole: string
): Promise<ITaskDocument> => {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound('Task not found');

  // Members can only move to review if requiresReview is true
  if (userRole === 'member' && task.requiresReview && status === TASK_STATUS.DONE) {
    throw ApiError.forbidden('This task requires review. Please move to review status.');
  }

  task.status = status;
  if (status === TASK_STATUS.DONE) {
    task.completedAt = new Date();
    if (task.requiresReview) task.reviewedBy = new Types.ObjectId(userId);
  }
  await task.save();

  return task.populate([
    { path: 'project', select: 'title slug' },
    { path: 'assignees', select: 'name email avatar' },
  ]);
};

export const deleteTask = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest('Invalid task ID');
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw ApiError.notFound('Task not found');
};

export const logTime = async (id: string, hours: number): Promise<ITaskDocument> => {
  const task = await Task.findByIdAndUpdate(id, { $inc: { timeLogged: hours } }, { new: true });
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

export const getKanbanTasks = async (projectId: string, sprintId?: string) => {
  const filter: Record<string, unknown> = { project: new Types.ObjectId(projectId) };
  if (sprintId) filter.sprint = new Types.ObjectId(sprintId);

  const tasks = await Task.find(filter)
    .populate('assignees', 'name email avatar')
    .sort({ order: 1 });

  return {
    todo: tasks.filter(t => t.status === TASK_STATUS.TODO),
    in_progress: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS),
    review: tasks.filter(t => t.status === TASK_STATUS.REVIEW),
    done: tasks.filter(t => t.status === TASK_STATUS.DONE),
  };
};

export const addSubtask = async (taskId: string, title: string): Promise<ITaskDocument> => {
  const task = await Task.findByIdAndUpdate(
    taskId,
    { $push: { subtasks: { title, isCompleted: false } } },
    { new: true }
  );
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

export const updateSubtask = async (
  taskId: string,
  subtaskId: string,
  data: { title?: string; isCompleted?: boolean }
): Promise<ITaskDocument> => {
  const updateFields: Record<string, unknown> = {};
  if (data.title) updateFields['subtasks.$.title'] = data.title;
  if (data.isCompleted !== undefined) updateFields['subtasks.$.isCompleted'] = data.isCompleted;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, 'subtasks._id': subtaskId },
    { $set: updateFields },
    { new: true }
  );
  if (!task) throw ApiError.notFound('Task or subtask not found');
  return task;
};

export const deleteSubtask = async (taskId: string, subtaskId: string): Promise<ITaskDocument> => {
  const task = await Task.findByIdAndUpdate(
    taskId,
    { $pull: { subtasks: { _id: subtaskId } } },
    { new: true }
  );
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};
