import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'fraud-consumer',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'fraud-group' });

export const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'transactions', fromBeginning: true });

  await consumer.run({
  eachMessage: async ({ message }) => {
    const value = message.value?.toString();

    if (value) {
      const transaction = JSON.parse(value);

      // 🔥 Simple fraud rules
      let isFraud = false;

      if (transaction.amount > 10000) {
        isFraud = true;
      }

      if (transaction.location === 'Unknown') {
        isFraud = true;
      }

      console.log('📥 Transaction:', transaction);
      console.log('🚨 Fraud Status:', isFraud ? 'FRAUD' : 'SAFE');
    }
  },
});
};