import { Router } from 'express';
import {
  listReleases,
  createRelease,
  getRelease,
  toggleChecklistItem,
  triggerDeployment,
  listDeployments,
} from '../controllers/releaseController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspace, requireRole } from '../middleware/workspace.js';
import { validateRelease } from '../validators/entityValidators.js';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspace);

router.get('/', listReleases);
router.post('/', requireRole(['Owner', 'Admin', 'Member']), validateRelease, createRelease);
router.get('/deployments', listDeployments);
router.get('/:releaseId', getRelease);
router.patch('/:releaseId/checklists/:itemId', requireRole(['Owner', 'Admin', 'Member']), toggleChecklistItem);
router.post('/:releaseId/deploy', requireRole(['Owner', 'Admin', 'Member']), triggerDeployment);

export default router;
