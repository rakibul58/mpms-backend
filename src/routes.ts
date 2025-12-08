/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';
import { authRoutes } from './modules/auth';
import { userRoutes } from './modules/user';
import { projectRoutes } from './modules/project';
import { sprintRoutes } from './modules/sprint';
import { taskRoutes } from './modules/task';
import { commentRoutes } from './modules/comment';
import { reportRoutes } from './modules/report';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'MPMS API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/projects',
    route: projectRoutes,
  },
  {
    path: '/sprints',
    route: sprintRoutes,
  },
  {
    path: '/tasks',
    route: taskRoutes,
  },
  {
    path: '/comments',
    route: commentRoutes,
  },
  {
    path: '/reports',
    route: reportRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route?.route));

export default router;
