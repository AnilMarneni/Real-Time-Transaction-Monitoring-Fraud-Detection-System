import { Request, Response } from 'express';
import { producer } from '../config/kafka';
import { transactionSchema } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const data = transactionSchema.parse(req.body);

    const transaction = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    await producer.send({
      topic: 'transactions',
      messages: [
        {
          key: transaction.id,
          value: JSON.stringify(transaction),
        },
      ],
    });

    res.status(201).json({
      message: 'Transaction received',
      transactionId: transaction.id,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};