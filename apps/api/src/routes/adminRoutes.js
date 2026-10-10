import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { buildComplaintAnalytics } from '../services/complaintService.js';

const router = Router();

router.get(
  '/analytics',
  requireAuth,
  requireRole('admin', 'officer'),
  asyncHandler(async (req, res) => {
    const analytics = await buildComplaintAnalytics();
    res.status(200).json({ success: true, analytics });
  })
);

router.get(
  '/health',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Admin API is healthy' });
  })
);

export default router;