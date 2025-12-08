import { Types } from 'mongoose';
import { Project } from '../project/project.model';
import { Task } from '../task/task.model';
import { Sprint } from '../sprint/sprint.model';
import { User } from '../user/user.model';
import { TASK_STATUS, PROJECT_STATUS } from '../../shared/constants';

export const getDashboardStats = async () => {
  const [totalProjects, activeProjects, totalTasks, completedTasks, totalUsers, totalHoursLogged] =
    await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: PROJECT_STATUS.ACTIVE }),
      Task.countDocuments(),
      Task.countDocuments({ status: TASK_STATUS.DONE }),
      User.countDocuments({ isActive: true }),
      Task.aggregate([{ $group: { _id: null, total: { $sum: '$timeLogged' } } }]),
    ]);

  const [projectsByStatus, tasksByStatus, tasksByPriority] = await Promise.all([
    Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
  ]);

  const recentProjects = await Project.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status');

  const upcomingDeadlines = await Task.find({
    dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    status: { $ne: TASK_STATUS.DONE },
  })
    .populate('project', 'title')
    .sort({ dueDate: 1 })
    .limit(10);

  const toObject = (arr: Array<{ _id: string; count: number }>) =>
    arr.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});

  return {
    overview: {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      totalUsers,
      totalHoursLogged: totalHoursLogged[0]?.total || 0,
    },
    projectsByStatus: toObject(projectsByStatus),
    tasksByStatus: toObject(tasksByStatus),
    tasksByPriority: toObject(tasksByPriority),
    recentProjects: recentProjects.map(p => ({
      _id: p._id,
      title: p.title,
      status: p.status,
      progress: 0,
    })),
    upcomingDeadlines,
  };
};

export const getMyReport = async (userId: string) => {
  const userObjectId = new Types.ObjectId(userId);
  const user = await User.findById(userId).select('name email role');

  const [assignedTasks, completedTasks, inProgressTasks, totalHours] = await Promise.all([
    Task.countDocuments({ assignees: userObjectId }),
    Task.countDocuments({ assignees: userObjectId, status: TASK_STATUS.DONE }),
    Task.countDocuments({ assignees: userObjectId, status: TASK_STATUS.IN_PROGRESS }),
    Task.aggregate([
      { $match: { assignees: userObjectId } },
      { $group: { _id: null, total: { $sum: '$timeLogged' } } },
    ]),
  ]);

  const tasksByProject = await Task.aggregate([
    { $match: { assignees: userObjectId } },
    {
      $group: {
        _id: '$project',
        taskCount: { $sum: 1 },
        completedCount: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.DONE] }, 1, 0] } },
      },
    },
    { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
    { $unwind: '$project' },
    {
      $project: {
        projectId: '$_id',
        projectTitle: '$project.title',
        taskCount: 1,
        completedCount: 1,
      },
    },
  ]);

  return {
    user,
    stats: {
      assignedTasks,
      completedTasks,
      inProgressTasks,
      totalHoursLogged: totalHours[0]?.total || 0,
      completionRate: assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0,
    },
    tasksByProject,
  };
};

export const getProjectReport = async (projectId: string) => {
  const project = await Project.findById(projectId).select('title status startDate endDate');
  if (!project) throw new Error('Project not found');

  const [taskStats, sprintStats, hoursStats, teamSize] = await Promise.all([
    Task.aggregate([
      { $match: { project: new Types.ObjectId(projectId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.DONE] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.IN_PROGRESS] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.TODO] }, 1, 0] } },
          review: { $sum: { $cond: [{ $eq: ['$status', TASK_STATUS.REVIEW] }, 1, 0] } },
          estimatedHours: { $sum: '$estimate' },
          loggedHours: { $sum: '$timeLogged' },
        },
      },
    ]),
    Sprint.aggregate([
      { $match: { project: new Types.ObjectId(projectId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
    ]),
    Task.aggregate([
      { $match: { project: new Types.ObjectId(projectId) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Project.findById(projectId)
      .select('teamMembers')
      .then(p => p?.teamMembers?.length || 0),
  ]);

  const stats = taskStats[0] || {};
  const sprints = sprintStats[0] || {};

  return {
    project,
    stats: {
      totalTasks: stats.total || 0,
      completedTasks: stats.completed || 0,
      inProgressTasks: stats.inProgress || 0,
      todoTasks: stats.todo || 0,
      reviewTasks: stats.review || 0,
      progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      totalSprints: sprints.total || 0,
      completedSprints: sprints.completed || 0,
      estimatedHours: stats.estimatedHours || 0,
      loggedHours: stats.loggedHours || 0,
      teamSize,
    },
    tasksByPriority: hoursStats.reduce(
      (acc: Record<string, number>, item: { _id: string; count: number }) => ({
        ...acc,
        [item._id]: item.count,
      }),
      {}
    ),
  };
};
