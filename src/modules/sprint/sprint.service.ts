import mongoose, { Types } from 'mongoose';
import { Sprint, ISprintDocument } from './sprint.model';
import { Project } from '../project/project.model';
import { Task } from '../task/task.model';
import { ApiError } from '../../shared/errors';
import { CreateSprintInput, UpdateSprintInput } from './sprint.validation';
import { TASK_STATUS } from '../../shared/constants';

// Create sprint
export const createSprint = async (data: CreateSprintInput): Promise<ISprintDocument> => {
  const project = await Project.findById(data.projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  const sprint = await Sprint.create({
    title: data.title,
    project: new Types.ObjectId(data.projectId),
    description: data.description,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    status: data.status,
    goals: data.goals,
  });

  return sprint.populate('project', 'title slug');
};

// Get sprint by ID
export const getSprintById = async (id: string): Promise<ISprintDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid sprint ID');
  }

  const sprint = await Sprint.findById(id).populate('project', 'title slug');
  if (!sprint) {
    throw ApiError.notFound('Sprint not found');
  }

  return sprint;
};

// Get sprints by project
export const getSprintsByProject = async (projectId: string): Promise<ISprintDocument[]> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw ApiError.badRequest('Invalid project ID');
  }

  return Sprint.find({ project: projectId }).sort({ order: 1 }).populate('project', 'title slug');
};

// Get active sprint by project
export const getActiveSprint = async (projectId: string): Promise<ISprintDocument | null> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw ApiError.badRequest('Invalid project ID');
  }

  return Sprint.findOne({ project: projectId, status: 'active' }).populate('project', 'title slug');
};

// Update sprint
export const updateSprint = async (
  id: string,
  data: UpdateSprintInput
): Promise<ISprintDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid sprint ID');
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.startDate) {
    updateData.startDate = new Date(data.startDate);
  }
  if (data.endDate) {
    updateData.endDate = new Date(data.endDate);
  }

  const sprint = await Sprint.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('project', 'title slug');

  if (!sprint) {
    throw ApiError.notFound('Sprint not found');
  }

  return sprint;
};

// Delete sprint
export const deleteSprint = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid sprint ID');
  }

  const sprint = await Sprint.findById(id);
  if (!sprint) {
    throw ApiError.notFound('Sprint not found');
  }

  // Check if there are tasks in this sprint
  const taskCount = await Task.countDocuments({ sprint: sprint._id });
  if (taskCount > 0) {
    throw ApiError.badRequest(
      'Cannot delete sprint with existing tasks. Move or delete tasks first.'
    );
  }

  await sprint.deleteOne();
};

// Reorder sprints
export const reorderSprints = async (
  projectId: string,
  sprintOrders: Array<{ sprintId: string; order: number }>
): Promise<ISprintDocument[]> => {
  const bulkOps = sprintOrders.map(({ sprintId, order }) => ({
    updateOne: {
      filter: { _id: new Types.ObjectId(sprintId), project: new Types.ObjectId(projectId) },
      update: { $set: { order } },
    },
  }));

  await Sprint.bulkWrite(bulkOps);

  return Sprint.find({ project: projectId }).sort({ order: 1 }).populate('project', 'title slug');
};

// Get sprint with stats
export const getSprintStats = async (id: string) => {
  const sprint = await getSprintById(id);

  const taskStats = await Task.aggregate([
    { $match: { sprint: sprint._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.DONE] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.IN_PROGRESS] }, 1, 0] } },
        todo: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.TODO] }, 1, 0] } },
      },
    },
  ]);

  const stats = taskStats[0] || { total: 0, completed: 0, inProgress: 0, todo: 0 };
  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return {
    sprint,
    stats: {
      totalTasks: stats.total,
      completedTasks: stats.completed,
      inProgressTasks: stats.inProgress,
      todoTasks: stats.todo,
      progress,
    },
  };
};
