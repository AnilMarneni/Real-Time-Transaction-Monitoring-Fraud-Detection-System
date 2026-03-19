import 'dotenv/config';
import { kafka } from '../config/kafka';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // ✅ works perfectly in v6

const consumer = kafka.consumer({ groupId: 'transaction-group' });

export const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'transactions', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const transaction = JSON.parse(message.value.toString());

      let riskScore = 0;

      if (transaction.amount > 10000) {
        riskScore += 0.5;
      }

      const status = riskScore > 0.4 ? 'flagged' : 'approved';

      await prisma.transaction.create({
        data: {
          ...transaction,
          riskScore,
          status,
        },
      });

      if (status === 'flagged') {
        await prisma.fraudAlert.create({
          data: {
            transactionId: transaction.id,
            reason: 'High amount',
            severity: 'HIGH',
          },
        });
      }

      console.log(`✅ Stored transaction ${transaction.id} (${status})`);
    },
  });
};