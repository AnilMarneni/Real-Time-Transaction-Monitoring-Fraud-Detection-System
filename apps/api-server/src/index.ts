import express from 'express';
import dotenv from 'dotenv';
import { producer } from './config/kafka';
import transactionRoutes from './routes/transaction.routes'; // 👈 ADD THIS
import { runConsumer } from './services/consumer';

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Register routes HERE
app.use('/api/transactions', transactionRoutes);

// health route
app.get('/health', (_, res) => {
  res.send('API running');
});

const PORT = process.env.PORT || 4000;

async function start() {
  await producer.connect();
  await runConsumer(); // 👈 ADD THIS

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();