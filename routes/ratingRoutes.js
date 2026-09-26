import express from 'express';
import { submitRating, getUserRating } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', submitRating);
router.get('/:targetType/:targetId', getUserRating);

export default router;
