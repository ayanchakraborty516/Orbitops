import { Router } from 'express';
import {
  listIssues,
  createIssue,
  getIssue,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
  addComment,
} from '../controllers/issueController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspace, requireRole } from '../middleware/workspace.js';
import { validateIssue } from '../validators/entityValidators.js';

const router = Router();

router.use(requireAuth);
router.use(requireWorkspace);

router.get('/', listIssues);
router.post('/', requireRole(['Owner', 'Admin', 'Member']), validateIssue, createIssue);
router.get('/:issueId', getIssue);
router.patch('/:issueId', requireRole(['Owner', 'Admin', 'Member']), updateIssue);
router.patch('/:issueId/status', requireRole(['Owner', 'Admin', 'Member']), updateIssueStatus);
router.delete('/:issueId', requireRole(['Owner', 'Admin']), deleteIssue);

router.post('/:issueId/comments', requireRole(['Owner', 'Admin', 'Member', 'Viewer']), addComment);

export default router;
