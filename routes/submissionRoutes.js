import express from 'express';
import {
  createSubmission,
  getMySubmissions,
  getApprovedSubmissions,
  getAllSubmissionsAdmin,
  updateSubmissionAdmin,
  moderateSubmission,
  deleteSubmissionAdmin
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/approved', getApprovedSubmissions);
router.get('/my', protect, getMySubmissions);
router.post('/', protect, createSubmission);

// Admin moderation and management
router.get('/admin', protect, authorize('admin'), getAllSubmissionsAdmin);
router.put('/:id/admin', protect, authorize('admin'), updateSubmissionAdmin);
router.put('/:id/moderate', protect, authorize('admin'), moderateSubmission);
router.delete('/:id', protect, authorize('admin'), deleteSubmissionAdmin);

export default router;
