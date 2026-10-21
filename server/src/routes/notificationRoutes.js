import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listNotifications);
router.patch('/:notificationId/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
