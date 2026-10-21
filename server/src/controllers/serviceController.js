import { Service } from '../models/Service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logActivity } from '../services/activityService.js';
import { emitToWorkspace } from '../sockets/socketHandler.js';

export async function listServices(req, res, next) {
  try {
    const services = await Service.find({ workspaceId: req.workspaceId }).sort({ createdAt: -1 });
    return sendSuccess(res, services, 'Services retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createService(req, res, next) {
  try {
    const { name, description, status, environment, uptimePercentage, latencyMs, isDemo } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 'Service name is required', 400);
    }

    const service = await Service.create({
      workspaceId: req.workspaceId,
      name: name.trim(),
      description: description || '',
      status: status || 'operational',
      environment: environment || 'production',
      uptimePercentage: uptimePercentage !== undefined ? uptimePercentage : 99.98,
      latencyMs: latencyMs !== undefined ? latencyMs : 45,
      isDemo: isDemo !== undefined ? isDemo : false,
      lastCheckedAt: new Date(),
    });

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: 'created monitored service',
      entityType: 'service',
      entityId: service._id,
      entityTitle: service.name,
    });

    emitToWorkspace(req.workspaceId, 'service_created', service);

    return sendSuccess(res, service, 'Service created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const { name, description, status, environment, uptimePercentage, latencyMs, isDemo } = req.body;

    const service = await Service.findOne({ _id: serviceId, workspaceId: req.workspaceId });
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }

    const oldStatus = service.status;

    if (name) service.name = name.trim();
    if (description !== undefined) service.description = description;
    if (status) service.status = status;
    if (environment) service.environment = environment;
    if (uptimePercentage !== undefined) service.uptimePercentage = uptimePercentage;
    if (latencyMs !== undefined) service.latencyMs = latencyMs;
    if (isDemo !== undefined) service.isDemo = isDemo;
    service.lastCheckedAt = new Date();

    await service.save();

    await logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: oldStatus !== service.status ? `changed status to ${service.status}` : 'updated service',
      entityType: 'service',
      entityId: service._id,
      entityTitle: service.name,
    });

    emitToWorkspace(req.workspaceId, 'service_updated', service);

    return sendSuccess(res, service, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const { serviceId } = req.params;

    const service = await Service.findOne({ _id: serviceId, workspaceId: req.workspaceId });
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }

    await Service.deleteOne({ _id: serviceId });

    emitToWorkspace(req.workspaceId, 'service_deleted', { serviceId });

    return sendSuccess(res, null, 'Service removed from monitoring');
  } catch (error) {
    next(error);
  }
}
