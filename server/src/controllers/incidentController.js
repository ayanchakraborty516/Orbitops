import { Incident } from '../models/Incident.js';
import { Service } from '../models/Service.js';
import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../services/activityService.js';
import { emitToWorkspace } from '../sockets/socketHandler.js';

export async function listIncidents(req, res, next) {
  try {
    const { status, severity, serviceId, page = 1, limit = 50 } = req.query;

    const query = { workspaceId: req.workspaceId };

    if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
      query.status = status;
    }
    if (severity && severity !== 'all' && severity !== 'undefined' && severity !== 'null') {
      query.severity = severity;
    }
    if (serviceId && serviceId !== 'all' && serviceId !== 'undefined' && serviceId !== 'null') {
      query.serviceIds = serviceId;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .populate('serviceIds', 'name status environment')
        .populate('leadId', 'name email avatarUrl title')
        .populate('timeline.updatedBy', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Incident.countDocuments(query),
    ]);

    return sendSuccess(res, incidents, 'Incidents retrieved', 200, {
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
      limit: take,
    });
  } catch (error) {
    next(error);
  }
}

export async function createIncident(req, res, next) {
  try {
    const { title, description, severity, status, serviceIds, initialMessage } = req.body;

    const incident = await Incident.create({
      workspaceId: req.workspaceId,
      title: title.trim(),
      description: description || '',
      severity: severity || 'minor',
      status: status || 'investigating',
      serviceIds: serviceIds && Array.isArray(serviceIds) ? serviceIds : [],
      leadId: req.user._id,
      timeline: [
        {
          status: status || 'investigating',
          message: initialMessage || 'Incident opened and investigation initiated.',
          updatedBy: req.user._id,
          timestamp: new Date(),
        },
      ],
    });

    // Optionally update impacted services status if critical/major
    if (serviceIds && serviceIds.length > 0) {
      const impactedStatus = severity === 'critical' ? 'major_outage' : 'degraded_performance';
      await Service.updateMany(
        { _id: { $in: serviceIds }, workspaceId: req.workspaceId },
        { status: impactedStatus }
      );
    }

    const populated = await Incident.findById(incident._id)
      .populate('serviceIds', 'name status environment')
      .populate('leadId', 'name email avatarUrl title')
      .populate('timeline.updatedBy', 'name email avatarUrl');

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: 'created incident',
      entityType: 'incident',
      entityId: incident._id,
      entityTitle: incident.title,
    });

    emitToWorkspace(req.workspaceId, 'incident_created', populated);

    return sendSuccess(res, populated, 'Incident created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getIncident(req, res, next) {
  try {
    const { incidentId } = req.params;

    const incident = await Incident.findOne({ _id: incidentId, workspaceId: req.workspaceId })
      .populate('serviceIds', 'name status environment')
      .populate('leadId', 'name email avatarUrl title')
      .populate('timeline.updatedBy', 'name email avatarUrl title');

    if (!incident) {
      return sendError(res, 'Incident not found', 404);
    }

    return sendSuccess(res, incident);
  } catch (error) {
    next(error);
  }
}

export async function addTimelineUpdate(req, res, next) {
  try {
    const { incidentId } = req.params;
    const { message, status } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 'Timeline message is required', 400);
    }

    const incident = await Incident.findOne({ _id: incidentId, workspaceId: req.workspaceId });
    if (!incident) {
      return sendError(res, 'Incident not found', 404);
    }

    const newStatus = status || incident.status;
    incident.status = newStatus;

    if (newStatus === 'resolved') {
      incident.resolvedAt = new Date();
    }

    incident.timeline.push({
      status: newStatus,
      message: message.trim(),
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await incident.save();

    // If resolved, restore impacted services to operational
    if (newStatus === 'resolved' && incident.serviceIds.length > 0) {
      await Service.updateMany(
        { _id: { $in: incident.serviceIds }, workspaceId: req.workspaceId },
        { status: 'operational' }
      );
    }

    const populated = await Incident.findById(incident._id)
      .populate('serviceIds', 'name status environment')
      .populate('leadId', 'name email avatarUrl title')
      .populate('timeline.updatedBy', 'name email avatarUrl');

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: `incident update: ${newStatus}`,
      entityType: 'incident',
      entityId: incident._id,
      entityTitle: incident.title,
    });

    emitToWorkspace(req.workspaceId, 'incident_updated', populated);

    return sendSuccess(res, populated, 'Timeline update posted');
  } catch (error) {
    next(error);
  }
}

export async function deleteIncident(req, res, next) {
  try {
    const { incidentId } = req.params;

    const incident = await Incident.findOne({ _id: incidentId, workspaceId: req.workspaceId });
    if (!incident) {
      return sendError(res, 'Incident not found', 404);
    }

    await Incident.deleteOne({ _id: incidentId });

    emitToWorkspace(req.workspaceId, 'incident_deleted', { incidentId });

    return sendSuccess(res, null, 'Incident deleted');
  } catch (error) {
    next(error);
  }
}
