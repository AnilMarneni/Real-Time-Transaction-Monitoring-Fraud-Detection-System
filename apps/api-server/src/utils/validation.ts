import { z } from 'zod';

export const transactionSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  merchant: z.string(),
  location: z.string(),
});