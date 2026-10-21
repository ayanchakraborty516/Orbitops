import { getDashboardStats } from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboard(req, res, next) {
  try {
    const stats = await getDashboardStats(req.workspaceId);
    return sendSuccess(res, stats, 'Dashboard metrics retrieved');
  } catch (error) {
    next(error);
  }
}
