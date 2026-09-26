import express from 'express';
import {
  getBookmarks,
  checkBookmarkStatus,
  toggleBookmark,
  updateBookmarkNote,
  deleteBookmark
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All bookmark routes require authentication

router.get('/', getBookmarks);
router.get('/check', checkBookmarkStatus);
router.post('/toggle', toggleBookmark);
router.put('/:id/note', updateBookmarkNote);
router.delete('/:id', deleteBookmark);

export default router;
