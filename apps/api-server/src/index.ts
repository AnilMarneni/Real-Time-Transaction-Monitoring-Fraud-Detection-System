import express from 'express';
import dotenv from 'dotenv';
import http from 'http';

import { producer } from './config/kafka';
import { runConsumer } from './services/consumer';
import transactionRoutes from './routes/transaction.routes';
import { initWebSocket } from './config/websocket';

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Routes
app.use('/api/transactions', transactionRoutes);

// ✅ Health check
app.get('/health', (_, res) => {
  res.send('API running');
});

const PORT = process.env.PORT || 4000;

// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔥 Attach WebSocket
initWebSocket(server);

// 🔥 Start everything
async function start() {
  try {
    // Kafka producer
    await producer.connect();

    // Kafka consumer
    await runConsumer();

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

start();