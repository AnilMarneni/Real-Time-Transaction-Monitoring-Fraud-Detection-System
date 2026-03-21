import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Created admin user');

    // Create sample transactions
    const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
    const merchants = ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Home Depot', 'Costco', 'Kroger', 'Lowe\'s'];
    
    const transactions = [];
    for (let i = 0; i < 1000; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      transactions.push({
        userId: admin.id,
        amount: Math.floor(Math.random() * 5000) + 50, // $50 - $5050
        merchant: merchants[Math.floor(Math.random() * merchants.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        riskScore: Math.random() * 100,
        status: Math.random() > 0.1 ? 'completed' : 'flagged',
        createdAt
      });
    }

    // Insert transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await prisma.transaction.createMany({
        data: batch,
        skipDuplicates: true
      });
    }

    console.log(`✅ Created ${transactions.length} sample transactions`);

    // Get all transactions to create fraud alerts
    const allTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200 // Use last 200 transactions for alerts
    });

    // Create sample fraud alerts
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const reasons = [
      'Unusual transaction amount',
      'Suspicious location pattern',
      'High frequency transactions',
      'Velocity check failed',
      'IP address mismatch',
      'Device fingerprint anomaly',
      'Card testing pattern',
      'Account takeover attempt'
    ];

    const fraudAlerts = allTransactions.slice(0, 50).map((transaction, index) => ({
      transactionId: transaction.id,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      resolved: Math.random() > 0.6, // 40% unresolved
      resolvedBy: Math.random() > 0.6 ? admin.id : null,
      resolvedAt: Math.random() > 0.6 ? new Date() : null,
      createdAt: new Date(transaction.createdAt.getTime() + Math.random() * 60000) // Within 1 minute of transaction
    }));

    await prisma.fraudAlert.createMany({
      data: fraudAlerts,
      skipDuplicates: true
    });

    console.log(`✅ Created ${fraudAlerts.length} sample fraud alerts`);

    // Create sample fraud rules
    const rules = [
      {
        name: 'High Velocity Check',
        description: 'Detects multiple transactions from same user in short time',
        condition: JSON.stringify({
          field: 'userId',
          operator: 'count',
          value: 5,
          timeWindow: '5m'
        }),
        severity: 'HIGH',
        isActive: true,
        createdBy: admin.id
      },
      {
        name: 'Amount Threshold',
        description: 'Flags transactions over $5000',
        condition: JSON.stringify({
          field: 'amount',
          operator: 'gt',
          value: 5000
        }),
        severity: 'MEDIUM',
        isActive: true,
        createdBy: admin.id
      },
      {
        name: 'Location Anomaly',
        description: 'Detects transactions from unusual locations',
        condition: JSON.stringify({
          field: 'location',
          operator: 'not_in',
          value: ['New York', 'Los Angeles', 'Chicago']
        }),
        severity: 'LOW',
        isActive: true,
        createdBy: admin.id
      },
      {
        name: 'IP Address Mismatch',
        description: 'Flags when IP address doesn\'t match usual pattern',
        condition: JSON.stringify({
          field: 'ipAddress',
          operator: 'pattern',
          value: 'suspicious'
        }),
        severity: 'HIGH',
        isActive: true,
        createdBy: admin.id
      }
    ];

    for (const rule of rules) {
      await prisma.fraudRule.upsert({
        where: { name: rule.name },
        update: rule,
        create: rule
      });
    }

    console.log(`✅ Created ${rules.length} sample fraud rules`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Print summary
    const summary = await prisma.$queryRaw<any[]>`
      SELECT 
        (SELECT COUNT(*) FROM "User") as users,
        (SELECT COUNT(*) FROM "Transaction") as transactions,
        (SELECT COUNT(*) FROM "FraudAlert") as fraud_alerts,
        (SELECT COUNT(*) FROM "FraudRule") as fraud_rules,
        (SELECT COUNT(*) FROM "FraudAlert" WHERE resolved = false) as active_alerts
    `;
    
    console.log('📊 Database Summary:');
    console.table(summary[0]);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedData;
