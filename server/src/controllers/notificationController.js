import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}
