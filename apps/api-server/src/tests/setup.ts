import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  // You might want to use a separate test database
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Clean up database connections
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data before each test
  // This ensures tests are isolated
  await prisma.transaction.deleteMany();
  await prisma.fraudAlert.deleteMany();
  await prisma.fraudRule.deleteMany();
  await prisma.user.deleteMany();
});

afterEach(async () => {
  // Clean up after each test if needed
});

// Mock external services
jest.mock('../config/kafka', () => ({
  kafka: {
    consumer: jest.fn(() => ({
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
      disconnect: jest.fn(),
    })),
    producer: jest.fn(() => ({
      connect: jest.fn(),
      send: jest.fn(),
      disconnect: jest.fn(),
    })),
  },
  producer: {
    connect: jest.fn(),
    send: jest.fn(),
    disconnect: jest.fn(),
  },
}));

jest.mock('../config/redis', () => ({
  redis: {
    zadd: jest.fn(),
    zremrangebyscore: jest.fn(),
    zcard: jest.fn(),
  },
}));

jest.mock('../config/websocket', () => ({
  initWebSocket: jest.fn(),
  broadcast: jest.fn(),
}));

jest.mock('axios', () => ({
  post: jest.fn(),
}));
