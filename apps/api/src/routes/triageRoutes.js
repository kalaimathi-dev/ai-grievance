import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { triageComplaint } from '../services/triageService.js';

const router = Router();

router.post(
  '/classify',
  requireAuth,
  asyncHandler(async (req, res) => {
    const complaintText = typeof req.body?.complaintText === 'string' ? req.body.complaintText : '';
    const result = await triageComplaint(complaintText);
    res.status(200).json({ success: true, triage: result });
  })
);

export default router;