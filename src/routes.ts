/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';

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
const moduleRoutes: any[] = [];

moduleRoutes.forEach(route => router.use(route.path, route?.route));

export default router;
