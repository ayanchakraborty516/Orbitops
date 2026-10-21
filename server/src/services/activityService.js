import { Activity } from '../models/Activity.js';

export async function logActivity({ workspaceId, userId, action, entityType, entityId, entityTitle = '', details = {} }) {
  try {
    return await Activity.create({
      workspaceId,
      userId,
      action,
      entityType,
      entityId,
      entityTitle,
      details,
    });
  } catch (error) {
    console.error('[Activity Log Error]:', error.message);
  }
}
