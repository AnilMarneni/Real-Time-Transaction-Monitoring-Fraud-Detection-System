import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get transaction metrics
    const [totalTransactions, previousWeekTransactions] = await Promise.all([
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            lt: sevenDaysAgo
          }
        }
      })
    ]);

    // Get fraud metrics - based on resolved alerts
    const [resolvedFraudAlerts, previousWeekFraudAlerts] = await Promise.all([
      prisma.fraudAlert.aggregate({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          },
          resolved: true
        },
        _count: true
      }),
      prisma.fraudAlert.aggregate({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            lt: sevenDaysAgo
          },
          resolved: true
        },
        _count: true
      })
    ]);

    // Get active alerts by severity
    const activeAlerts = await prisma.fraudAlert.groupBy({
      by: ['severity'],
      where: {
        resolved: false
      },
      _count: true
    });

    // Calculate alert counts by risk level
    const alertCounts = activeAlerts.reduce((acc, alert) => {
      const severity = alert.severity.toLowerCase();
      if (severity === 'critical') acc.critical += alert._count;
      else if (severity === 'high') acc.high += alert._count;
      else if (severity === 'medium') acc.medium += alert._count;
      else acc.low += alert._count;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });

    // Calculate trends
    const transactionChange = totalTransactions - previousWeekTransactions;
    const transactionChangePercent = previousWeekTransactions > 0 
      ? ((transactionChange / previousWeekTransactions) * 100)
      : 0;

    const fraudChange = resolvedFraudAlerts._count - previousWeekFraudAlerts._count;
    const fraudChangePercent = previousWeekFraudAlerts._count > 0
      ? ((fraudChange / previousWeekFraudAlerts._count) * 100)
      : 0;

    // Mock monetary values since we don't have amount in fraud alerts
    const avgFraudAmount = 1500; // Average fraud amount in dollars

    const metrics = {
      totalTransactions,
      preventedFraud: resolvedFraudAlerts._count * avgFraudAmount,
      activeAlerts: alertCounts,
      trends: {
        transactions: {
          current: totalTransactions,
          previous: previousWeekTransactions,
          change: transactionChange,
          changePercent: transactionChangePercent
        },
        fraud: {
          current: resolvedFraudAlerts._count * avgFraudAmount,
          previous: previousWeekFraudAlerts._count * avgFraudAmount,
          change: fraudChange * avgFraudAmount,
          changePercent: fraudChangePercent
        }
      }
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get risk trends data
router.get('/risk-trends', async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Generate hourly data points
    const riskData = [];
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(twentyFourHoursAgo.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const [totalTransactions, mediumRiskAlerts, highRiskAlerts] = await Promise.all([
        prisma.transaction.count({
          where: {
            createdAt: {
              gte: hourStart,
              lt: hourEnd
            }
          }
        }),
        prisma.fraudAlert.count({
          where: {
            createdAt: {
              gte: hourStart,
              lt: hourEnd
            },
            severity: 'MEDIUM'
          }
        }),
        prisma.fraudAlert.count({
          where: {
            createdAt: {
              gte: hourStart,
              lt: hourEnd
            },
            severity: 'HIGH'
          }
        })
      ]);

      riskData.push({
        time: `${i}h`,
        volume: totalTransactions,
        mediumRisk: mediumRiskAlerts,
        highRisk: highRiskAlerts,
        lowRisk: Math.max(0, totalTransactions - mediumRiskAlerts - highRiskAlerts)
      });
    }

    res.json(riskData);
  } catch (error) {
    logger.error('Error fetching risk trends:', error);
    res.status(500).json({ error: 'Failed to fetch risk trends' });
  }
});

// Get recent alerts
router.get('/alerts', async (req, res) => {
  try {
    const { limit = 10, sort = 'createdAt:desc' } = req.query;
    
    const orderBy: any = {};
    const [sortField, sortOrder] = (sort as string).split(':');
    orderBy[sortField] = sortOrder.toLowerCase();

    const alerts = await prisma.fraudAlert.findMany({
      orderBy,
      take: parseInt(limit as string)
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

    const formattedAlerts = alerts.map(alert => {
      const transaction = transactionMap[alert.transactionId];
      return {
        id: alert.id,
        sourceIp: transaction?.location || 'Unknown',
        amount: transaction?.amount || 0,
        riskScore: alert.severity === 'CRITICAL' ? 90 : alert.severity === 'HIGH' ? 70 : alert.severity === 'MEDIUM' ? 50 : 30,
        status: alert.resolved ? 'resolved' : 'pending',
        createdAt: alert.createdAt.toISOString(),
        userId: transaction?.userId,
        merchant: transaction?.merchant,
        location: transaction?.location
      };
    });

    res.json(formattedAlerts);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get geographic risk data
router.get('/geographic-risk', async (req, res) => {
  try {
    // Get transactions grouped by location
    const locationRisks = await prisma.transaction.groupBy({
      by: ['location'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      _count: true,
      _sum: {
        amount: true
      },
      orderBy: {
        location: 'desc'
      },
      take: 10
    });

    // Get fraud alerts by transaction location
    const transactionIds = locationRisks.map((loc: any) => loc.location);
    const transactions = await prisma.transaction.findMany({
      where: {
        location: {
          in: transactionIds
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        location: true
      }
    });

    const fraudAlerts = await prisma.fraudAlert.findMany({
      where: {
        transactionId: {
          in: transactions.map(t => t.id)
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        resolved: false
      }
    });

    // Calculate fraud by location
    const fraudByLocation = fraudAlerts.reduce((acc, alert) => {
      const transaction = transactions.find(t => t.id === alert.transactionId);
      const location = transaction?.location || 'Unknown';
      
      if (!acc[location]) {
        acc[location] = { count: 0, totalSeverity: 0 };
      }
      acc[location].count += 1;
      acc[location].totalSeverity += alert.severity === 'CRITICAL' ? 90 : 
                                  alert.severity === 'HIGH' ? 70 : 
                                  alert.severity === 'MEDIUM' ? 50 : 30;
      return acc;
    }, {} as Record<string, { count: number; totalSeverity: number }>);

    // Combine and calculate risk levels
    const geoRisks = locationRisks.map((location: any) => {
      const fraudData = fraudByLocation[location.location] || { count: 0, totalSeverity: 0 };
      const alertCount = fraudData.count;
      const avgRiskScore = fraudData.count > 0 ? fraudData.totalSeverity / fraudData.count : 0;
      const totalAmount = (location._sum as any)?.amount || 0;

      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (avgRiskScore >= 80) riskLevel = 'critical';
      else if (avgRiskScore >= 60) riskLevel = 'high';
      else if (avgRiskScore >= 40) riskLevel = 'medium';

      return {
        country: location.location || 'Unknown',
        region: location.location || 'Unknown',
        riskLevel,
        alertCount,
        totalAmount,
        coordinates: {
          lat: 40.7128 + Math.random() * 20 - 10, // Mock coordinates
          lng: -74.0060 + Math.random() * 20 - 10
        }
      };
    });

    res.json(geoRisks);
  } catch (error) {
    logger.error('Error fetching geographic risk:', error);
    res.status(500).json({ error: 'Failed to fetch geographic risk data' });
  }
});

export default router;
