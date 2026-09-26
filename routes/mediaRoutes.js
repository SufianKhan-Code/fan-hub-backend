import express from 'express';
import {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia
} from '../controllers/mediaController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMedia);
router.get('/:id', optionalAuth, getMediaById);
router.post('/', protect, authorize('admin'), createMedia);
router.put('/:id', protect, authorize('admin'), updateMedia);
router.delete('/:id', protect, authorize('admin'), deleteMedia);

export default router;
