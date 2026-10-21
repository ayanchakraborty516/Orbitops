import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspace } from '../middleware/workspace.js';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspace);

router.get('/', getDashboard);

export default router;
