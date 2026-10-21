import mongoose from 'mongoose';
import { Membership } from '../models/Membership.js';
import { Workspace } from '../models/Workspace.js';
import { sendError } from '../utils/response.js';

export async function requireWorkspace(req, res, next) {
  try {
    const rawWorkspaceId =
      req.params.workspaceId ||
      req.headers['x-workspace-id'] ||
      req.body?.workspaceId ||
      req.query?.workspaceId;

    if (!rawWorkspaceId) {
      return sendError(res, 'Workspace ID is required for this operation.', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(rawWorkspaceId)) {
      return sendError(res, 'Invalid Workspace ID format.', 400);
    }

    const membership = await Membership.findOne({
      workspaceId: rawWorkspaceId,
      userId: req.user._id,
    });

    if (!membership) {
      return sendError(
        res,
        'Access denied. You are not a member of this workspace or workspace does not exist.',
        403
      );
    }

    req.workspaceId = rawWorkspaceId;
    req.membership = membership;
    next();
  } catch (error) {
    return sendError(res, 'Workspace validation failed', 500, error.message);
  }
}

export function requireRole(allowedRoles = ['Owner', 'Admin']) {
  return (req, res, next) => {
    if (!req.membership) {
      return sendError(res, 'Workspace membership not established.', 403);
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return sendError(
        res,
        `Permission denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.membership.role}`,
        403
      );
    }

    next();
  };
}
