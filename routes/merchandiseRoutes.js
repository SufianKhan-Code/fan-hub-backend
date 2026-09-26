import express from 'express';
import {
  getMerchandise,
  getMerchandiseById,
  createMerchandise,
  updateMerchandise,
  deleteMerchandise
} from '../controllers/merchandiseController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMerchandise);
router.get('/:id', optionalAuth, getMerchandiseById);
router.post('/', protect, authorize('admin'), createMerchandise);
router.put('/:id', protect, authorize('admin'), updateMerchandise);
router.delete('/:id', protect, authorize('admin'), deleteMerchandise);

export default router;
