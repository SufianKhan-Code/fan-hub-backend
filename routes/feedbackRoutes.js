import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.put('/:id', protect, authorize('admin'), updateFeedbackStatus);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

export default router;
