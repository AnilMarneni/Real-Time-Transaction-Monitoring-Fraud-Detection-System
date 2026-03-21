import { Router } from 'express';
import {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRule,
} from '../controllers/rules.controller';
import { authenticateToken, requireAnalystOrAdmin, requireAdmin } from '../middleware/auth';

const router = Router();

// All rules routes require authentication
router.use(authenticateToken);

// GET /api/rules - Get all rules (analyst+)
router.get('/', requireAnalystOrAdmin, getAllRules);

// GET /api/rules/:id - Get specific rule (analyst+)
router.get('/:id', requireAnalystOrAdmin, getRuleById);

// POST /api/rules - Create new rule (admin only)
router.post('/', requireAdmin, createRule);

// PUT /api/rules/:id - Update rule (admin only)
router.put('/:id', requireAdmin, updateRule);

// DELETE /api/rules/:id - Delete rule (admin only)
router.delete('/:id', requireAdmin, deleteRule);

// PATCH /api/rules/:id/toggle - Toggle rule active status (admin only)
router.patch('/:id/toggle', requireAdmin, toggleRule);

export default router;
