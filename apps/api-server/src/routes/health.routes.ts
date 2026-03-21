import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: string;
    redis: string;
    kafka: string;
    ml_service: string;
  };
}

interface DetailedHealth {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  system: {
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    platform: string;
    nodeVersion: string;
  };
  services: {
    database?: any;
    redis?: any;
  };
  metrics: {
    activeConnections: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

router.get('/health', async (req, res) => {
  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown',
      kafka: 'unknown',
      ml_service: 'unknown'
    }
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error: any) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check Redis connection
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error: any) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check ML Service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(process.env.ML_SERVICE_URL + '/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      health.services.ml_service = 'healthy';
    } else {
      health.services.ml_service = 'unhealthy';
      health.status = 'degraded';
    }
  } catch (error: any) {
    health.services.ml_service = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/health/detailed', async (req, res) => {
  const detailed: DetailedHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    services: {},
    metrics: {
      activeConnections: 0,
      requestsPerMinute: 0,
      errorRate: 0
    }
  };

  // Detailed service checks
  try {
    const dbStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE "isActive" = true) as active_users,
        (SELECT COUNT(*) FROM "Transaction") as total_transactions
      FROM "User"
    `;
    detailed.services.database = { status: 'healthy', stats: dbStats };
  } catch (error: any) {
    detailed.services.database = { status: 'unhealthy', error: error.message };
  }

  try {
    const redisInfo = await redis.info();
    detailed.services.redis = { status: 'healthy', info: redisInfo };
  } catch (error: any) {
    detailed.services.redis = { status: 'unhealthy', error: error.message };
  }

  res.json(detailed);
});

router.get('/metrics', async (req, res) => {
  // Prometheus-style metrics
  const metrics = [
    `# HELP nodejs_memory_usage_bytes Memory usage in bytes`,
    `# TYPE nodejs_memory_usage_bytes gauge`,
    `nodejs_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}`,
    `nodejs_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}`,
    `nodejs_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}`,
    `# HELP nodejs_uptime_seconds Process uptime in seconds`,
    `# TYPE nodejs_uptime_seconds counter`,
    `nodejs_uptime_seconds ${process.uptime()}`,
    `# HELP http_requests_total Total number of HTTP requests`,
    `# TYPE http_requests_total counter`,
    `http_requests_total 0`, // Would be implemented with actual request counting
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

export default router;
