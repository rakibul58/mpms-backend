import mongoose, { Types } from 'mongoose';
import { Project, IProjectDocument } from './project.model';
import { Task } from '../task/task.model';
import { Sprint } from '../sprint/sprint.model';
import { ApiError } from '../../shared/errors';
import { CreateProjectInput, UpdateProjectInput, QueryProjectsInput } from './project.validation';
import { IPaginationOptions, IPaginatedResult } from '../../shared/interfaces';
import { parsePagination, createPaginatedResult, calculateSkip } from '../../shared/utils';
import { TASK_STATUS } from '../../shared/constants';

// Create a new project
export const createProject = async (
  data: CreateProjectInput,
  userId: string
): Promise<IProjectDocument> => {
  const project = await Project.create({
    ...data,
    createdBy: new Types.ObjectId(userId),
    teamMembers: data.teamMembers?.map(id => new Types.ObjectId(id)) || [],
    managers: data.managers?.map(id => new Types.ObjectId(id)) || [],
  });

  return project.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'teamMembers', select: 'name email role' },
    { path: 'managers', select: 'name email' },
  ]);
};

// Get project by ID
export const getProjectById = async (id: string): Promise<IProjectDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid project ID');
  }

  const project = await Project.findById(id)
    .populate('createdBy', 'name email')
    .populate('teamMembers', 'name email role avatar')
    .populate('managers', 'name email avatar');

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
};

// Get project by slug
export const getProjectBySlug = async (slug: string): Promise<IProjectDocument> => {
  const project = await Project.findOne({ slug })
    .populate('createdBy', 'name email')
    .populate('teamMembers', 'name email role avatar')
    .populate('managers', 'name email avatar');

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
};

// Get project by ID or slug
export const getProjectByIdOrSlug = async (idOrSlug: string): Promise<IProjectDocument> => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    return getProjectById(idOrSlug);
  }
  return getProjectBySlug(idOrSlug);
};

// Query projects with pagination and filters
export const queryProjects = async (
  queryParams: QueryProjectsInput
): Promise<IPaginatedResult<IProjectDocument>> => {
  const paginationOptions: IPaginationOptions = parsePagination(queryParams);
  const { searchTerm, status, client, startDateFrom, startDateTo } = queryParams;

  // Build filter query
  const filter: Record<string, unknown> = {};

  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { client: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (client) {
    filter.client = { $regex: client, $options: 'i' };
  }

  if (startDateFrom || startDateTo) {
    filter.startDate = {};
    if (startDateFrom) {
      (filter.startDate as Record<string, Date>).$gte = new Date(startDateFrom);
    }
    if (startDateTo) {
      (filter.startDate as Record<string, Date>).$lte = new Date(startDateTo);
    }
  }

  // Build sort object
  const sort: Record<string, 1 | -1> = {
    [paginationOptions.sortBy || 'createdAt']: paginationOptions.sortOrder === 'asc' ? 1 : -1,
  };

  // Execute query
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role')
      .populate('managers', 'name email')
      .sort(sort)
      .skip(calculateSkip(paginationOptions.page, paginationOptions.limit))
      .limit(paginationOptions.limit),
    Project.countDocuments(filter),
  ]);

  return createPaginatedResult(projects, total, paginationOptions);
};

// Get user's projects
export const getUserProjects = async (
  userId: string,
  queryParams: QueryProjectsInput
): Promise<IPaginatedResult<IProjectDocument>> => {
  const paginationOptions: IPaginationOptions = parsePagination(queryParams);
  const { searchTerm, status } = queryParams;

  const userObjectId = new Types.ObjectId(userId);

  // Build filter for user's projects (member, manager, or creator)
  const filter: Record<string, unknown> = {
    $or: [{ createdBy: userObjectId }, { teamMembers: userObjectId }, { managers: userObjectId }],
  };

  if (searchTerm) {
    filter.$and = [
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { client: { $regex: searchTerm, $options: 'i' } },
        ],
      },
    ];
  }

  if (status) {
    filter.status = status;
  }

  const sort: Record<string, 1 | -1> = {
    [paginationOptions.sortBy || 'createdAt']: paginationOptions.sortOrder === 'asc' ? 1 : -1,
  };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('managers', 'name email')
      .sort(sort)
      .skip(calculateSkip(paginationOptions.page, paginationOptions.limit))
      .limit(paginationOptions.limit),
    Project.countDocuments(filter),
  ]);

  return createPaginatedResult(projects, total, paginationOptions);
};

// Update project
export const updateProject = async (
  id: string,
  data: UpdateProjectInput
): Promise<IProjectDocument> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid project ID');
  }

  const updateData: Record<string, unknown> = { ...data };

  if (data.teamMembers) {
    updateData.teamMembers = data.teamMembers.map(id => new Types.ObjectId(id));
  }

  if (data.managers) {
    updateData.managers = data.managers.map(id => new Types.ObjectId(id));
  }

  const project = await Project.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'name email')
    .populate('teamMembers', 'name email role')
    .populate('managers', 'name email');

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
};

// Delete project
export const deleteProject = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid project ID');
  }

  const project = await Project.findById(id);

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // Delete associated sprints and tasks
  await Promise.all([
    Sprint.deleteMany({ project: project._id }),
    Task.deleteMany({ project: project._id }),
  ]);

  await project.deleteOne();
};

// Add team members to project
export const addTeamMembers = async (
  projectId: string,
  userIds: string[]
): Promise<IProjectDocument> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw ApiError.badRequest('Invalid project ID');
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $addToSet: {
        teamMembers: { $each: userIds.map(id => new Types.ObjectId(id)) },
      },
    },
    { new: true }
  )
    .populate('createdBy', 'name email')
    .populate('teamMembers', 'name email role')
    .populate('managers', 'name email');

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
};

// Remove team members from project
export const removeTeamMembers = async (
  projectId: string,
  userIds: string[]
): Promise<IProjectDocument> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw ApiError.badRequest('Invalid project ID');
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $pull: {
        teamMembers: { $in: userIds.map(id => new Types.ObjectId(id)) },
      },
    },
    { new: true }
  )
    .populate('createdBy', 'name email')
    .populate('teamMembers', 'name email role')
    .populate('managers', 'name email');

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  return project;
};

// Get project with statistics
export const getProjectStats = async (
  id: string
): Promise<{
  project: IProjectDocument;
  stats: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
    totalSprints: number;
    activeSprints: number;
  };
}> => {
  const project = await getProjectById(id);

  const [taskStats, sprintStats] = await Promise.all([
    Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.DONE] }, 1, 0] },
          },
        },
      },
    ]),
    Sprint.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const totalTasks = taskStats[0]?.total || 0;
  const completedTasks = taskStats[0]?.completed || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    project,
    stats: {
      totalTasks,
      completedTasks,
      progress,
      totalSprints: sprintStats[0]?.total || 0,
      activeSprints: sprintStats[0]?.active || 0,
    },
  };
};

// Check if user has access to project
export const checkProjectAccess = async (projectId: string, userId: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return false;
  }

  const userObjectId = new Types.ObjectId(userId);

  const project = await Project.findOne({
    _id: projectId,
    $or: [{ createdBy: userObjectId }, { teamMembers: userObjectId }, { managers: userObjectId }],
  });

  return !!project;
};
