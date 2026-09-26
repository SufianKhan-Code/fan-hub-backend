import express from 'express';
import {
  getDashboardData,
  getAllUsersAdmin,
  updateUserRoleAdmin,
  deleteUserAdmin
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);

// Admin user administration
router.get('/', protect, authorize('admin'), getAllUsersAdmin);
router.put('/:id/role', protect, authorize('admin'), updateUserRoleAdmin);
router.delete('/:id', protect, authorize('admin'), deleteUserAdmin);

export default router;
