import { Router } from 'express';
import { createTransaction } from '../controllers/transaction.controller';

const router = Router();

router.post('/', createTransaction);

export default router;