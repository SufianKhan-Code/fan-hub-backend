import express from 'express';
import {
  handleMessage,
  getChatHistory,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from '../controllers/chatbotController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', optionalAuth, handleMessage);
router.get('/history', optionalAuth, getChatHistory);
router.get('/faqs', getFAQs);

// Admin FAQ management
router.post('/faqs', protect, authorize('admin'), createFAQ);
router.put('/faqs/:id', protect, authorize('admin'), updateFAQ);
router.delete('/faqs/:id', protect, authorize('admin'), deleteFAQ);

export default router;
