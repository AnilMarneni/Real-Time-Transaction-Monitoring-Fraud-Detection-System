import { Router } from 'express';
import { createTransaction } from '../controllers/transaction.controller';
import { authenticateToken, requireAnalystOrAdmin } from '../middleware/auth';

const router = Router();

// All transaction routes require authentication
router.use(authenticateToken);

// POST /api/transactions - Create new transaction (analyst+)
router.post('/', requireAnalystOrAdmin, createTransaction);

// GET /api/transactions - Get transactions with filters (analyst+)
router.get('/', requireAnalystOrAdmin, async (req, res) => {
  // Implementation will be added later
  res.json({ message: 'Transaction list endpoint coming soon' });
});

export default router;