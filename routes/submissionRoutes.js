import express from 'express';
import {
  createSubmission,
  getMySubmissions,
  getApprovedSubmissions,
  getAllSubmissionsAdmin,
  moderateSubmission
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/approved', getApprovedSubmissions);
router.get('/my', protect, getMySubmissions);
router.post('/', protect, createSubmission);

// Admin moderation
router.get('/admin', protect, authorize('admin'), getAllSubmissionsAdmin);
router.put('/:id/moderate', protect, authorize('admin'), moderateSubmission);

export default router;
