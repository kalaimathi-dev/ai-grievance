import { Router } from 'express';
import multer from 'multer';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import {
  createComplaint,
  getComplaintById,
  listComplaints,
  updateComplaintStatus
} from '../services/complaintService.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image files are allowed.'));
      return;
    }

    callback(null, true);
  }
});

router.post(
  '/',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const complaint = await createComplaint(req.body || {}, req.user._id, req.file);
    req.app.locals.io?.emit('complaint:created', complaint);
    res.status(201).json({ success: true, complaint });
  })
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const complaints = await listComplaints({ user: req.user, filters: req.query || {} });
    res.status(200).json({ success: true, complaints });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await getComplaintById(req.params.id, req.user);
    res.status(200).json({ success: true, ...result });
  })
);

router.patch(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const complaint = await updateComplaintStatus({
      complaintId: req.params.id,
      status: req.body?.status,
      note: req.body?.note || '',
      user: req.user
    });

    req.app.locals.io?.emit('complaint:updated', complaint);

    res.status(200).json({ success: true, complaint });
  })
);

export default router;