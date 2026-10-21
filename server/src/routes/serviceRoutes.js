import { Router } from 'express';
import {
  listServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspace, requireRole } from '../middleware/workspace.js';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspace);

router.get('/', listServices);
router.post('/', requireRole(['Owner', 'Admin', 'Member']), createService);
router.patch('/:serviceId', requireRole(['Owner', 'Admin', 'Member']), updateService);
router.delete('/:serviceId', requireRole(['Owner', 'Admin']), deleteService);

export default router;
