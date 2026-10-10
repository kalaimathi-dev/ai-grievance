import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { getProfile, loginUser, registerUser } from '../services/authService.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const result = await registerUser(payload);
    res.status(201).json({ success: true, ...result });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const result = await loginUser(req.body || {});
    res.status(200).json({ success: true, ...result });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await getProfile(req.user._id);
    res.status(200).json({ success: true, user: profile });
  })
);

export default router;