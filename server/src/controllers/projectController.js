import { Project } from '../models/Project.js';
import { Issue } from '../models/Issue.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../services/activityService.js';

export async function listProjects(req, res, next) {
  try {
    const { status, priority, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = { workspaceId: req.workspaceId };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('ownerId', 'name email avatarUrl')
        .populate('members', 'name email avatarUrl')
        .sort(sort)
        .skip(skip)
        .limit(take),
      Project.countDocuments(query),
    ]);

    // Derive progress for each project based on its issues
    const projectIds = projects.map((p) => p._id);
    const issueStats = await Issue.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: '$projectId',
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        },
      },
    ]);

    const statsMap = new Map();
    issueStats.forEach((s) => {
      statsMap.set(s._id.toString(), {
        total: s.total,
        done: s.done,
        progress: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0,
      });
    });

    const projectsWithProgress = projects.map((p) => {
      const stats = statsMap.get(p._id.toString()) || { total: 0, done: 0, progress: 0 };
      return {
        ...p.toObject(),
        issueCount: stats.total,
        doneIssueCount: stats.done,
        progress: stats.progress,
      };
    });

    return sendSuccess(res, projectsWithProgress, 'Projects retrieved', 200, {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      limit: take,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, key, description, priority, status, startDate, targetDate, members, tags } = req.body;

    const existingProject = await Project.findOne({
      workspaceId: req.workspaceId,
      key: key.trim().toUpperCase(),
    });
    if (existingProject) {
      return sendError(res, `A project with key ${key.toUpperCase()} already exists in this workspace.`, 409);
    }

    const project = await Project.create({
      workspaceId: req.workspaceId,
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description || '',
      priority: priority || 'medium',
      status: status || 'active',
      startDate: startDate || Date.now(),
      targetDate: targetDate || null,
      ownerId: req.user._id,
      members: members && Array.isArray(members) ? members : [req.user._id],
      tags: tags && Array.isArray(tags) ? tags : [],
    });

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: 'created project',
      entityType: 'project',
      entityId: project._id,
      entityTitle: project.name,
    });

    return sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      workspaceId: req.workspaceId,
    })
      .populate('ownerId', 'name email avatarUrl')
      .populate('members', 'name email avatarUrl title');

    if (!project) {
      return sendError(res, 'Project not found in this workspace', 404);
    }

    // Calculate issues breakdown
    const issueStats = await Issue.aggregate([
      { $match: { projectId: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let total = 0;
    let done = 0;
    const statusBreakdown = {};
    issueStats.forEach((s) => {
      statusBreakdown[s._id] = s.count;
      total += s.count;
      if (s._id === 'done') done += s.count;
    });

    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return sendSuccess(res, {
      ...project.toObject(),
      progress,
      issueStats: {
        total,
        done,
        statusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { name, description, priority, status, startDate, targetDate, members, tags } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      workspaceId: req.workspaceId,
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description;
    if (priority) project.priority = priority;
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (targetDate !== undefined) project.targetDate = targetDate;
    if (members && Array.isArray(members)) project.members = members;
    if (tags && Array.isArray(tags)) project.tags = tags;

    await project.save();

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: 'updated project',
      entityType: 'project',
      entityId: project._id,
      entityTitle: project.name,
    });

    return sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      workspaceId: req.workspaceId,
    });

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Cascade delete project's issues
    await Issue.deleteMany({ projectId: project._id });
    await Project.deleteOne({ _id: projectId });

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: 'deleted project',
      entityType: 'project',
      entityId: project._id,
      entityTitle: project.name,
    });

    return sendSuccess(res, null, 'Project and related issues deleted');
  } catch (error) {
    next(error);
  }
}
