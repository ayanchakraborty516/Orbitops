import { Router } from 'express';
import authRoutes from './authRoutes.js';
import workspaceRoutes from './workspaceRoutes.js';
import projectRoutes from './projectRoutes.js';
import issueRoutes from './issueRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import incidentRoutes from './incidentRoutes.js';
import releaseRoutes from './releaseRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import { isDbConnected } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Health check endpoint (reports status without exposing secrets)
router.get('/health', (req, res) => {
  const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
  const statusCode = dbStatus === 'connected' ? 200 : 503;

  return res.status(statusCode).json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: dbStatus,
    },
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// Mounted modules under /api/v1
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/services', serviceRoutes);
router.use('/incidents', incidentRoutes);
router.use('/releases', releaseRoutes);
router.use('/notifications', notificationRoutes);

export default router;
