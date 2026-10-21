import { Router } from 'express';
import {
  listIncidents,
  createIncident,
  getIncident,
  addTimelineUpdate,
  deleteIncident,
} from '../controllers/incidentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspace, requireRole } from '../middleware/workspace.js';
import { validateIncident } from '../validators/entityValidators.js';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspace);

router.get('/', listIncidents);
router.post('/', requireRole(['Owner', 'Admin', 'Member']), validateIncident, createIncident);
router.get('/:incidentId', getIncident);
router.post('/:incidentId/timeline', requireRole(['Owner', 'Admin', 'Member']), addTimelineUpdate);
router.delete('/:incidentId', requireRole(['Owner', 'Admin']), deleteIncident);

export default router;
