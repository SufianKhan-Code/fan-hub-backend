import express from 'express';
import {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from '../controllers/characterController.js';
import { protect, authorize, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCharacters);
router.get('/:id', optionalAuth, getCharacterById);
router.post('/', protect, authorize('admin'), createCharacter);
router.put('/:id', protect, authorize('admin'), updateCharacter);
router.delete('/:id', protect, authorize('admin'), deleteCharacter);

export default router;
