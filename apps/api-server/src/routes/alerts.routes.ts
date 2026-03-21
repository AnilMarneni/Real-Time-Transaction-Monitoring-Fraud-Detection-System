import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const timeRange = req.query.timeRange as string || '24h';
    
    let timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default: 24 hours
    if (timeRange === '1h') {
      timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all alerts in time range
    const alerts = await prisma.fraudAlert.findMany({
      where: {
        createdAt: {
          gte: timeFilter
        }
      }
    });

    // Calculate stats based on actual schema
    const stats = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      high: alerts.filter(a => a.severity === 'HIGH').length,
      medium: alerts.filter(a => a.severity === 'MEDIUM').length,
      low: alerts.filter(a => a.severity === 'LOW').length,
      pending: alerts.filter(a => !a.resolved).length,
      inReview: 0, // No review status in schema
      resolved: alerts.filter(a => a.resolved).length,
      dismissed: 0, // No dismissed status in schema
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

// Get alerts with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      severity,
      timeRange = '24h',
      sort = 'createdAt:desc'
    } = req.query;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      if (status === 'resolved') {
        where.resolved = true;
      } else if (status === 'pending') {
        where.resolved = false;
      }
    }

    if (severity) {
      const severityMap: Record<string, string> = {
        'critical': 'CRITICAL',
        'high': 'HIGH',
        'medium': 'MEDIUM',
        'low': 'LOW'
      };
      where.severity = severityMap[severity.toString().toLowerCase()];
    }

    // Time range filter
    const now = new Date();
    let timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (timeRange === '1h') {
      timeFilter = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    where.createdAt = { gte: timeFilter };

    // Build order clause
    const orderBy: any = {};
    const [sortField, sortOrder] = (sort as string).split(':');
    orderBy[sortField] = sortOrder.toLowerCase();

    // Fetch alerts
    const alerts = await prisma.fraudAlert.findMany({
      where,
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Get related transactions separately
    const transactionIds = alerts.map(alert => alert.transactionId);
    const transactions = await prisma.transaction.findMany({
      where: {
        id: {
          in: transactionIds
        }
      }
    });

    // Create a map for quick lookup
    const transactionMap = transactions.reduce((map, transaction) => {
      map[transaction.id] = transaction;
      return map;
    }, {} as Record<string, any>);

    // Format alerts
    const formattedAlerts = alerts.map(alert => {
      const transaction = transactionMap[alert.transactionId];
      const riskScore = alert.severity === 'CRITICAL' ? 90 : 
                      alert.severity === 'HIGH' ? 70 : 
                      alert.severity === 'MEDIUM' ? 50 : 30;
      
      return {
        id: alert.id,
        severity: alert.severity.charAt(0) + alert.severity.slice(1).toLowerCase(),
        rule: alert.reason || 'Unknown Rule',
        time: alert.createdAt.toISOString(),
        user: transaction?.userId || 'Unknown User',
        amount: transaction?.amount || 0,
        status: alert.resolved ? 'resolved' : 'pending',
        description: alert.reason || 'Potential fraud detected',
        sourceIp: transaction?.location || 'Unknown',
        location: transaction?.location || 'Unknown',
        riskScore,
        createdAt: alert.createdAt.toISOString()
      };
    });

    res.json(formattedAlerts);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Update alert status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    let updateData: any;
    switch (action) {
      case 'resolve':
        updateData = { resolved: true, resolvedAt: new Date() };
        break;
      case 'dismiss':
        updateData = { resolved: true, resolvedAt: new Date() };
        break;
      case 'review':
        // No review status in schema, just keep as unresolved
        updateData = {};
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const alert = await prisma.fraudAlert.update({
      where: { id: id as string },
      data: updateData
    });

    res.json({ message: 'Alert updated successfully', alert });
  } catch (error) {
    logger.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Get alert details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.fraudAlert.findUnique({
      where: { id: id as string }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Get related transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: alert.transactionId },
      select: {
        userId: true,
        merchant: true,
        location: true,
        amount: true
      }
    });

    res.json({
      ...alert,
      transaction
    });
  } catch (error) {
    logger.error('Error fetching alert details:', error);
    res.status(500).json({ error: 'Failed to fetch alert details' });
  }
});

export default router;
