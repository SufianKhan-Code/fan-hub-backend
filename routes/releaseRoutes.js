import express from 'express';
import {
  getReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease
} from '../controllers/releaseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getReleases);
router.get('/:id', getReleaseById);
router.post('/', protect, authorize('admin'), createRelease);
router.put('/:id', protect, authorize('admin'), updateRelease);
router.delete('/:id', protect, authorize('admin'), deleteRelease);

export default router;
