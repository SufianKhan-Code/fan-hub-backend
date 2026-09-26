import express from 'express';
import {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent
} from '../controllers/contentController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getContent);
router.get('/:id', optionalAuth, getContentById);
router.post('/', protect, authorize('admin'), createContent);
router.put('/:id', protect, authorize('admin'), updateContent);
router.delete('/:id', protect, authorize('admin'), deleteContent);

export default router;
