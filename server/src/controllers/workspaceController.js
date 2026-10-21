import crypto from 'crypto';
import { Workspace } from '../models/Workspace.js';
import { Membership } from '../models/Membership.js';
import { Invitation } from '../models/Invitation.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../services/activityService.js';

export async function listWorkspaces(req, res, next) {
  try {
    const memberships = await Membership.find({ userId: req.user._id }).populate('workspaceId');
    const workspaces = memberships
      .filter((m) => m.workspaceId)
      .map((m) => ({
        ...m.workspaceId.toObject(),
        role: m.role,
      }));

    return sendSuccess(res, workspaces);
  } catch (error) {
    next(error);
  }
}

export async function createWorkspace(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || name.trim().length < 2) {
      return sendError(res, 'Workspace name must be at least 2 characters long.', 400);
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const workspace = await Workspace.create({
      name: name.trim(),
      slug,
      description: description || '',
      ownerId: req.user._id,
    });

    const membership = await Membership.create({
      workspaceId: workspace._id,
      userId: req.user._id,
      role: 'Owner',
    });

    await logActivity({
      workspaceId: workspace._id,
      userId: req.user._id,
      action: 'created',
      entityType: 'project',
      entityId: workspace._id,
      entityTitle: workspace.name,
      details: { role: 'Owner' },
    });

    return sendSuccess(
      res,
      {
        ...workspace.toObject(),
        role: 'Owner',
      },
      'Workspace created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function getWorkspace(req, res, next) {
  try {
    const workspace = await Workspace.findById(req.workspaceId).populate('ownerId', 'name email avatarUrl');
    if (!workspace) {
      return sendError(res, 'Workspace not found', 404);
    }

    return sendSuccess(res, {
      ...workspace.toObject(),
      userRole: req.membership.role,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateWorkspace(req, res, next) {
  try {
    const { name, description, settings } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (settings) updates.settings = settings;

    const workspace = await Workspace.findByIdAndUpdate(req.workspaceId, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, workspace, 'Workspace updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function listMembers(req, res, next) {
  try {
    const [memberships, invitations] = await Promise.all([
      Membership.find({ workspaceId: req.workspaceId })
        .populate('userId', 'name email avatarUrl title')
        .populate('invitedBy', 'name email'),
      Invitation.find({ workspaceId: req.workspaceId, status: 'pending' }),
    ]);

    return sendSuccess(res, {
      members: memberships,
      invitations,
    });
  } catch (error) {
    next(error);
  }
}

export async function inviteMember(req, res, next) {
  try {
    const { email, role = 'Member' } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return sendError(res, 'A valid email address is required', 400);
    }

    // Check if already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMember = await Membership.findOne({
        workspaceId: req.workspaceId,
        userId: existingUser._id,
      });
      if (existingMember) {
        return sendError(res, 'This user is already a member of the workspace.', 400);
      }

      // If user exists, immediately add them to workspace
      const newMembership = await Membership.create({
        workspaceId: req.workspaceId,
        userId: existingUser._id,
        role,
        invitedBy: req.user._id,
      });

      await logActivity({
        workspaceId: req.workspaceId,
        userId: req.user._id,
        action: 'added member',
        entityType: 'member',
        entityId: existingUser._id,
        entityTitle: existingUser.name,
        details: { role },
      });

      return sendSuccess(res, newMembership, `${existingUser.name} added to workspace as ${role}`, 201);
    }

    // Otherwise create pending invitation
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await Invitation.create({
      workspaceId: req.workspaceId,
      email,
      role,
      token,
      expiresAt,
      invitedBy: req.user._id,
    });

    return sendSuccess(res, invitation, `Invitation created for ${email}`, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    if (!['Admin', 'Member', 'Viewer'].includes(role)) {
      return sendError(res, 'Invalid role. Must be Admin, Member, or Viewer.', 400);
    }

    const membership = await Membership.findOne({
      _id: memberId,
      workspaceId: req.workspaceId,
    });

    if (!membership) {
      return sendError(res, 'Member record not found in this workspace.', 404);
    }

    if (membership.role === 'Owner') {
      return sendError(res, 'Owner role cannot be changed directly.', 400);
    }

    membership.role = role;
    await membership.save();

    return sendSuccess(res, membership, `Member role updated to ${role}`);
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req, res, next) {
  try {
    const { memberId } = req.params;

    const membership = await Membership.findOne({
      _id: memberId,
      workspaceId: req.workspaceId,
    });

    if (!membership) {
      return sendError(res, 'Member not found', 404);
    }

    if (membership.role === 'Owner') {
      return sendError(res, 'Workspace owner cannot be removed.', 400);
    }

    await Membership.deleteOne({ _id: memberId });

    return sendSuccess(res, null, 'Member removed from workspace');
  } catch (error) {
    next(error);
  }
}
