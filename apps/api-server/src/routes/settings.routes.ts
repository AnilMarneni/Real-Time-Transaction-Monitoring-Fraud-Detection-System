import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getSystemSettings,
  updateSystemSettings,
} from '../controllers/settings.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All settings routes require authentication
router.use(authenticateToken);

// Profile settings
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// User preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// System settings (admin only)
router.get('/system', requireAdmin, getSystemSettings);
router.put('/system', requireAdmin, updateSystemSettings);

export default router;
