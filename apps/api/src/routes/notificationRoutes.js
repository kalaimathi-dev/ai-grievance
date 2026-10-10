import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { getNotificationsForUser, markNotificationAsRead } from '../services/notificationService.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await getNotificationsForUser(req.user._id);
    res.status(200).json({ success: true, notifications });
  })
);

router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notification = await markNotificationAsRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, notification });
  })
);

export default router;