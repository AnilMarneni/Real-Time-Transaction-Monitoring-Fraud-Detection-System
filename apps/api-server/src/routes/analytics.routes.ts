import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get capture rate trends
router.get('/capture-rate', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    
    let days = 30;
    if (timeRange === '7d') days = 7;
    else if (timeRange === '90d') days = 90;
    else if (timeRange === '1y') days = 365;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Generate daily data
    const captureRateData = [];
    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const [totalTransactions, preventedFraud, detectedFraud] = await Promise.all([
        prisma.transaction.count({
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd
            }
          }
        }),
        prisma.fraudAlert.count({
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd
            },
            resolved: true
          }
        }),
        prisma.fraudAlert.count({
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd
            }
          }
        })
      ]);

      captureRateData.push({
        day: i + 1,
        prevented: preventedFraud * 1000, // Convert to monetary value
        detected: detectedFraud * 500,   // Convert to monetary value
        total: totalTransactions
      });
    }

    res.json(captureRateData);
  } catch (error) {
    logger.error('Error fetching capture rate data:', error);
    res.status(500).json({ error: 'Failed to fetch capture rate data' });
  }
});

// Get fraud types distribution
router.get('/fraud-types', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    
    let startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (timeRange === '7d') startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '90d') startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    else if (timeRange === '1y') startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Group fraud alerts by reason (since there's no ruleName field)
    const fraudTypes = await prisma.fraudAlert.groupBy({
      by: ['reason'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true,
      orderBy: {
        reason: 'desc'
      },
      take: 10
    });

    const totalAlerts = fraudTypes.reduce((sum, type) => sum + (type._count as number), 0);

    const colors = ['#EF4444', '#F59E0B', '#FACC15', '#8B5CF6', '#3B82F6', '#10B981', '#F97316', '#EC4899'];
    
    const fraudTypeData = fraudTypes.map((type, index) => ({
      name: type.reason || 'Unknown',
      value: type._count as number,
      fill: colors[index % colors.length],
      percentage: totalAlerts > 0 ? Math.round(((type._count as number) / totalAlerts) * 100) : 0
    }));

    res.json(fraudTypeData);
  } catch (error) {
    logger.error('Error fetching fraud types data:', error);
    res.status(500).json({ error: 'Failed to fetch fraud types data' });
  }
});

// Get merchant risk analysis
router.get('/merchant-risk', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    
    let startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (timeRange === '7d') startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '90d') startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    else if (timeRange === '1y') startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Group transactions by merchant
    const merchantData = await prisma.transaction.groupBy({
      by: ['merchant'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: true,
      _sum: {
        amount: true
      },
      orderBy: {
        merchant: 'desc'
      },
      take: 10
    });

    // Get fraud alerts per transaction to calculate risk levels
    const transactionIds = merchantData.map(m => m.merchant);
    const transactions = await prisma.transaction.findMany({
      where: {
        merchant: {
          in: transactionIds
        },
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        merchant: true
      }
    });

    const fraudAlerts = await prisma.fraudAlert.findMany({
      where: {
        transactionId: {
          in: transactions.map(t => t.id)
        },
        createdAt: {
          gte: startDate
        }
      }
    });

    // Calculate fraud by merchant
    const fraudByMerchant = fraudAlerts.reduce((acc, alert) => {
      const transaction = transactions.find(t => t.id === alert.transactionId);
      const merchant = transaction?.merchant || 'Unknown';
      
      if (!acc[merchant]) {
        acc[merchant] = { count: 0, totalSeverity: 0 };
      }
      acc[merchant].count += 1;
      acc[merchant].totalSeverity += alert.severity === 'CRITICAL' ? 90 : 
                                  alert.severity === 'HIGH' ? 70 : 
                                  alert.severity === 'MEDIUM' ? 50 : 30;
      return acc;
    }, {} as Record<string, { count: number; totalSeverity: number }>);

    const totalTransactions = merchantData.reduce((sum, m) => sum + (m._count as number), 0);
    const maxAmount = Math.max(...merchantData.map(m => (m._sum as any)?.amount || 0));

    const merchantCategories = merchantData.map((merchant: any) => {
      const fraudData = fraudByMerchant[merchant.merchant] || { count: 0, totalSeverity: 0 };
      const fraudCount = fraudData.count;
      const avgRiskScore = fraudData.count > 0 ? fraudData.totalSeverity / fraudData.count : 0;
      const transactionCount = merchant._count as number;
      const totalAmount = (merchant._sum as any)?.amount || 0;

      // Calculate risk level based on fraud rate and average risk score
      const fraudRate = transactionCount > 0 ? (fraudCount / transactionCount) * 100 : 0;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      
      if (fraudRate > 5 || avgRiskScore > 70) riskLevel = 'high';
      else if (fraudRate > 2 || avgRiskScore > 50) riskLevel = 'medium';

      return {
        label: merchant.merchant || 'Unknown',
        value: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(totalAmount),
        width: `${Math.round((totalAmount / maxAmount) * 100)}%`,
        count: transactionCount,
        totalAmount,
        riskLevel
      };
    });

    res.json(merchantCategories);
  } catch (error) {
    logger.error('Error fetching merchant risk data:', error);
    res.status(500).json({ error: 'Failed to fetch merchant risk data' });
  }
});

// Get overall analytics stats
router.get('/stats', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    
    let startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (timeRange === '7d') startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '90d') startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    else if (timeRange === '1y') startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const [
      totalTransactions,
      resolvedFraudAlerts,
      totalFraudAlerts,
      highRiskTransactions
    ] = await Promise.all([
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.fraudAlert.count({
        where: {
          createdAt: {
            gte: startDate
          },
          resolved: true
        }
      }),
      prisma.fraudAlert.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: startDate
          },
          riskScore: {
            gte: 70
          }
        }
      })
    ]);

    // Calculate metrics
    const fraudDetectionRate = totalFraudAlerts > 0 ? (resolvedFraudAlerts / totalFraudAlerts) * 100 : 0;
    const falsePositiveRate = Math.max(0, 100 - fraudDetectionRate); // Simplified calculation
    const totalFraudPrevented = resolvedFraudAlerts * 1500; // Average prevented amount per fraud
    const averageResponseTime = 150; // Mock calculation since we don't have response time data

    const stats = {
      totalFraudPrevented,
      fraudDetectionRate,
      falsePositiveRate,
      averageResponseTime,
      totalTransactions,
      highRiskTransactions,
      topFraudTypes: [], // Would be populated from fraud types endpoint
      merchantRiskData: [] // Would be populated from merchant risk endpoint
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching analytics stats:', error);
    res.status(500).json({ error: 'Failed to fetch analytics stats' });
  }
});

export default router;
