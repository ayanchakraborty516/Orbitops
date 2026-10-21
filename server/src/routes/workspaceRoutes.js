import { Router } from 'express';
import {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../controllers/workspaceController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspace, requireRole } from '../middleware/workspace.js';

const router = Router();

router.use(requireAuth);

router.get('/', listWorkspaces);
router.post('/', createWorkspace);

router.get('/:workspaceId', requireWorkspace, getWorkspace);
router.patch('/:workspaceId', requireWorkspace, requireRole(['Owner', 'Admin']), updateWorkspace);

router.get('/:workspaceId/members', requireWorkspace, listMembers);
router.post('/:workspaceId/members/invite', requireWorkspace, requireRole(['Owner', 'Admin']), inviteMember);
router.patch('/:workspaceId/members/:memberId', requireWorkspace, requireRole(['Owner', 'Admin']), updateMemberRole);
router.delete('/:workspaceId/members/:memberId', requireWorkspace, requireRole(['Owner', 'Admin']), removeMember);

export default router;
