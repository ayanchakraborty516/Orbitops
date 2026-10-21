import { Issue } from '../models/Issue.js';
import { Project } from '../models/Project.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../services/activityService.js';
import { emitToWorkspace, emitToUser } from '../sockets/socketHandler.js';

export async function listIssues(req, res, next) {
  try {
    const {
      projectId,
      status,
      priority,
      assigneeId,
      search,
      page = 1,
      limit = 100,
      sort = 'order -createdAt',
    } = req.query;

    const query = { workspaceId: req.workspaceId };

    if (projectId && projectId !== 'all' && projectId !== 'undefined' && projectId !== 'null') {
      query.projectId = projectId;
    }
    if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
      query.status = status;
    }
    if (priority && priority !== 'all' && priority !== 'undefined' && priority !== 'null') {
      query.priority = priority;
    }
    if (assigneeId && assigneeId !== 'all' && assigneeId !== 'undefined' && assigneeId !== 'null') {
      query.assigneeId = assigneeId;
    }
    if (search && search !== 'undefined' && search !== 'null') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('assigneeId', 'name email avatarUrl title')
        .populate('reporterId', 'name email avatarUrl')
        .populate('projectId', 'name key')
        .sort(sort)
        .skip(skip)
        .limit(take),
      Issue.countDocuments(query),
    ]);

    return sendSuccess(res, issues, 'Issues retrieved', 200, {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      limit: take,
    });
  } catch (error) {
    next(error);
  }
}

export async function createIssue(req, res, next) {
  try {
    const { projectId, title, description, priority, status, assigneeId, type, labels, dueDate } = req.body;

    const project = await Project.findOne({ _id: projectId, workspaceId: req.workspaceId });
    if (!project) {
      return sendError(res, 'Project not found in this workspace', 404);
    }

    // Increment project issue counter to generate readable issue key like ORB-101
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { issueCounter: 1 } },
      { new: true }
    );

    const issueKey = `${updatedProject.key}-${updatedProject.issueCounter}`;

    const maxOrderIssue = await Issue.findOne({ workspaceId: req.workspaceId, status: status || 'todo' })
      .sort({ order: -1 })
      .select('order');
    const order = maxOrderIssue ? maxOrderIssue.order + 1 : 0;

    const issue = await Issue.create({
      workspaceId: req.workspaceId,
      projectId,
      key: issueKey,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      status: status || 'todo',
      type: type || 'task',
      assigneeId: assigneeId || null,
      reporterId: req.user._id,
      labels: labels && Array.isArray(labels) ? labels : [],
      dueDate: dueDate || null,
      order,
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('assigneeId', 'name email avatarUrl title')
      .populate('reporterId', 'name email avatarUrl')
      .populate('projectId', 'name key');

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: 'created issue',
      entityType: 'issue',
      entityId: issue._id,
      entityTitle: `${issue.key}: ${issue.title}`,
    });

    // Notify assignee if different from reporter
    if (assigneeId && assigneeId.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        workspaceId: req.workspaceId,
        userId: assigneeId,
        title: 'New Issue Assigned',
        message: `${req.user.name} assigned ${issue.key}: "${issue.title}" to you.`,
        type: 'issue_assigned',
        link: `/app/issues?id=${issue._id}`,
      });
      emitToUser(assigneeId, 'notification', notif);
    }

    // Broadcast to workspace room
    emitToWorkspace(req.workspaceId, 'issue_created', populatedIssue);

    return sendSuccess(res, populatedIssue, 'Issue created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getIssue(req, res, next) {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findOne({ _id: issueId, workspaceId: req.workspaceId })
      .populate('assigneeId', 'name email avatarUrl title')
      .populate('reporterId', 'name email avatarUrl')
      .populate('projectId', 'name key description');

    if (!issue) {
      return sendError(res, 'Issue not found', 404);
    }

    const comments = await Comment.find({ issueId: issue._id })
      .populate('userId', 'name email avatarUrl title')
      .sort({ createdAt: 1 });

    return sendSuccess(res, {
      ...issue.toObject(),
      comments,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateIssue(req, res, next) {
  try {
    const { issueId } = req.params;
    const { title, description, priority, status, assigneeId, type, labels, dueDate, order } = req.body;

    const issue = await Issue.findOne({ _id: issueId, workspaceId: req.workspaceId });
    if (!issue) {
      return sendError(res, 'Issue not found', 404);
    }

    const oldAssignee = issue.assigneeId ? issue.assigneeId.toString() : null;
    const oldStatus = issue.status;

    if (title) issue.title = title.trim();
    if (description !== undefined) issue.description = description;
    if (priority) issue.priority = priority;
    if (status) issue.status = status;
    if (type) issue.type = type;
    if (assigneeId !== undefined) issue.assigneeId = assigneeId || null;
    if (labels && Array.isArray(labels)) issue.labels = labels;
    if (dueDate !== undefined) issue.dueDate = dueDate || null;
    if (order !== undefined) issue.order = order;

    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('assigneeId', 'name email avatarUrl title')
      .populate('reporterId', 'name email avatarUrl')
      .populate('projectId', 'name key');

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: oldStatus !== issue.status ? `changed status to ${issue.status}` : 'updated issue',
      entityType: 'issue',
      entityId: issue._id,
      entityTitle: `${issue.key}: ${issue.title}`,
    });

    // Notify new assignee if changed
    if (assigneeId && assigneeId.toString() !== oldAssignee && assigneeId.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        workspaceId: req.workspaceId,
        userId: assigneeId,
        title: 'Issue Assigned to You',
        message: `${req.user.name} assigned ${issue.key} to you.`,
        type: 'issue_assigned',
        link: `/app/issues?id=${issue._id}`,
      });
      emitToUser(assigneeId, 'notification', notif);
    }

    emitToWorkspace(req.workspaceId, 'issue_updated', populatedIssue);

    return sendSuccess(res, populatedIssue, 'Issue updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateIssueStatus(req, res, next) {
  try {
    const { issueId } = req.params;
    const { status, order } = req.body;

    if (!['backlog', 'todo', 'in_progress', 'in_review', 'done', 'canceled'].includes(status)) {
      return sendError(res, 'Invalid issue status', 400);
    }

    const issue = await Issue.findOne({ _id: issueId, workspaceId: req.workspaceId });
    if (!issue) {
      return sendError(res, 'Issue not found', 404);
    }

    const prevStatus = issue.status;
    issue.status = status;
    if (order !== undefined) issue.order = order;

    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate('assigneeId', 'name email avatarUrl title')
      .populate('reporterId', 'name email avatarUrl')
      .populate('projectId', 'name key');

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: `moved from ${prevStatus} to ${status}`,
      entityType: 'issue',
      entityId: issue._id,
      entityTitle: `${issue.key}: ${issue.title}`,
    });

    emitToWorkspace(req.workspaceId, 'issue_updated', populated);

    return sendSuccess(res, populated, `Issue moved to ${status}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteIssue(req, res, next) {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findOne({ _id: issueId, workspaceId: req.workspaceId });
    if (!issue) {
      return sendError(res, 'Issue not found', 404);
    }

    await Comment.deleteMany({ issueId });
    await Issue.deleteOne({ _id: issueId });

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: 'deleted issue',
      entityType: 'issue',
      entityId: issue._id,
      entityTitle: `${issue.key}: ${issue.title}`,
    });

    emitToWorkspace(req.workspaceId, 'issue_deleted', { issueId });

    return sendSuccess(res, null, 'Issue deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const { issueId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return sendError(res, 'Comment text cannot be empty', 400);
    }

    const issue = await Issue.findOne({ _id: issueId, workspaceId: req.workspaceId });
    if (!issue) {
      return sendError(res, 'Issue not found', 404);
    }

    const comment = await Comment.create({
      workspaceId: req.workspaceId,
      issueId,
      userId: req.user._id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name email avatarUrl title');

    emitToWorkspace(req.workspaceId, 'comment_added', {
      issueId,
      comment: populatedComment,
    });

    return sendSuccess(res, populatedComment, 'Comment added', 201);
  } catch (error) {
    next(error);
  }
}
