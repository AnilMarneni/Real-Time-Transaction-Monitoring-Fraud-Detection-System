import 'dotenv/config';
import { kafka } from '../config/kafka';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { redis } from '../config/redis';

const prisma = new PrismaClient();

const consumer = kafka.consumer({ groupId: 'transaction-group' });

export const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'transactions', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const transaction = JSON.parse(message.value.toString());

      try {
        // -------------------------------
        // 1. Velocity Calculation (Redis)
        // -------------------------------
        const key = `user:${transaction.userId}:transactions`;

        // Add current transaction timestamp
        await redis.zadd(key, Date.now(), transaction.id);

        // Keep only last 60 seconds
        await redis.zremrangebyscore(key, 0, Date.now() - 60000);

        // Count transactions in last 60 seconds
        const velocity = await redis.zcard(key);

        // Prevent memory buildup
        await redis.expire(key, 120);

        // -------------------------------
        // 2. ML Scoring
        // -------------------------------
        let mlScore = 0;

        try {
          const response = await axios.post('http://localhost:8000/score', {
            amount: transaction.amount,
            velocity,
          });

          mlScore = response.data.ml_score;
        } catch (error) {
          console.error('❌ ML service error:', error);
          mlScore = 0; // fallback
        }

        // -------------------------------
        // 3. Normalize ML Score
        // -------------------------------
        const normalizedML = Math.max(0, Math.min(1, 1 - mlScore));

        // -------------------------------
        // 4. Rule-Based Scoring
        // -------------------------------
        let ruleScore = 0;

        if (transaction.amount > 10000) {
          ruleScore += 0.4;
        }

        if (velocity > 5) {
          ruleScore += 0.3;
        }

        // -------------------------------
        // 5. Final Risk Score
        // -------------------------------
        const riskScore = 0.6 * normalizedML + 0.4 * ruleScore;

        const status = riskScore > 0.5 ? 'flagged' : 'approved';

        // -------------------------------
        // 6. Persist Transaction
        // -------------------------------
        await prisma.transaction.create({
          data: {
            id: transaction.id,
            userId: transaction.userId,
            amount: transaction.amount,
            merchant: transaction.merchant,
            location: transaction.location,
            riskScore,
            status,
          },
        });

        // -------------------------------
        // 7. Create Alert (if flagged)
        // -------------------------------
        if (status === 'flagged') {
          await prisma.fraudAlert.create({
            data: {
              transactionId: transaction.id,
              reason: `Risk score ${riskScore.toFixed(2)} exceeded threshold`,
              severity: 'HIGH',
            },
          });
        }

        // -------------------------------
        // 8. Logging
        // -------------------------------
        console.log(`✅ Transaction ${transaction.id}`);
        console.log(
          `Amount: ${transaction.amount} | Velocity: ${velocity} | ML: ${mlScore.toFixed(
            3
          )} | Final: ${riskScore.toFixed(3)} | Status: ${status}`
        );
      } catch (error) {
        console.error('❌ Consumer processing error:', error);
      }
    },
  });
};