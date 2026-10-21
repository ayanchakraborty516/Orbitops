import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspace, requireRole } from '../middleware/workspace.js';
import { validateProject } from '../validators/entityValidators.js';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspace);

router.get('/', listProjects);
router.post('/', requireRole(['Owner', 'Admin', 'Member']), validateProject, createProject);
router.get('/:projectId', getProject);
router.patch('/:projectId', requireRole(['Owner', 'Admin', 'Member']), validateProject, updateProject);
router.delete('/:projectId', requireRole(['Owner', 'Admin']), deleteProject);

export default router;
