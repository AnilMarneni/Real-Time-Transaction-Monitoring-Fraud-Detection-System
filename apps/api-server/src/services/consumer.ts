import 'dotenv/config';
import { kafka } from '../config/kafka';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { redis } from '../config/redis';
import { broadcast } from '../config/websocket';

const prisma = new PrismaClient();

const consumer = kafka.consumer({ groupId: 'transaction-group' });

export const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'transactions', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const transaction = JSON.parse(message.value.toString());

      // 🔥 Redis velocity tracking
      const key = `user:${transaction.userId}:transactions`;

      await redis.zadd(key, Date.now(), transaction.id);
      await redis.zremrangebyscore(key, 0, Date.now() - 60000);

      const velocity = await redis.zcard(key);

      // 🔥 Call ML service
      const response = await axios.post('http://localhost:8000/score', {
        amount: transaction.amount,
        velocity,
      });

      const riskScore = response.data.ml_score;
      const status = riskScore > 0.5 ? 'flagged' : 'approved';

      // ✅ Store transaction
      await prisma.transaction.create({
        data: {
          ...transaction,
          riskScore,
          status,
        },
      });

      console.log(`✅ Stored transaction ${transaction.id} (${status})`);

      // 🔥 Emit transaction event
      broadcast({
        type: 'transaction:new',
        data: {
          id: transaction.id,
          amount: transaction.amount,
          status,
          riskScore,
        },
      });

      // 🚨 Fraud alert
      if (status === 'flagged') {
        await prisma.fraudAlert.create({
          data: {
            transactionId: transaction.id,
            reason: 'ML detected fraud',
            severity: 'HIGH',
          },
        });

        console.log(`🚨 Fraud detected for ${transaction.id}`);

        // 🔥 Emit fraud alert event
        broadcast({
          type: 'alert:fraud',
          data: {
            transactionId: transaction.id,
            riskScore,
            message: 'Fraud detected',
          },
        });
      }
    },
  });
};