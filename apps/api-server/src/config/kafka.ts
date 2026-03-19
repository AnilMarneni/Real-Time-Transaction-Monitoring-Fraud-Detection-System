import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'fraud-system',
  brokers: ['localhost:9092'],
});

export const producer = kafka.producer();