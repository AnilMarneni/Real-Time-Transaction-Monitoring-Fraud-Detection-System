import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';

import { producer } from './config/kafka';
import { runConsumer } from './services/consumer';
import transactionRoutes from './routes/transaction.routes';
import authRoutes from './routes/auth.routes';
import rulesRoutes from './routes/rules.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';
import healthRoutes from './routes/health.routes';
import alertsRoutes from './routes/alerts.routes';
import analyticsRoutes from './routes/analytics.routes';
import { initWebSocket } from './config/websocket';
import logger from './utils/logger';
import { 
  securityHeaders, 
  generalRateLimit, 
  authRateLimit,
  transactionRateLimit,
  sanitizeInput,
  requestLogger 
} from './middleware/security';

dotenv.config();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(requestLogger);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
app.use(generalRateLimit);

// ✅ Routes with specific rate limits
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/transactions', transactionRateLimit, transactionRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);

// ✅ Health check
app.get('/health', (_, res) => {
  res.send('API running');
});

// ✅ Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket
initWebSocket(server);

// Start everything
async function start() {
  try {
    logger.info('Starting fraud detection system...');
    
    // Skip Kafka for now to allow basic functionality
    logger.warn('⚠️  Kafka connection skipped - running in limited mode');
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.warn('⚠️  Kafka features disabled - running in limited mode');
    });
  } catch (error) {
    logger.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

start();