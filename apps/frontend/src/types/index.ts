export interface User {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  merchant: string;
  location: string;
  riskScore: number;
  status: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalTransactions: number;
  preventedFraud: number;
  activeAlerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  trends: {
    transactions: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
    fraud: {
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    };
  };
}

export interface AnalyticsData {
  captureRate: Array<{
    day: number;
    prevented: number;
    detected: number;
    total: number;
  }>;
  fraudTypes: Array<{
    name: string;
    value: number;
    fill: string;
    percentage: number;
  }>;
  merchantRisk: Array<{
    label: string;
    value: string;
    width: string;
    count: number;
    totalAmount: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  stats: {
    totalFraudPrevented: number;
    fraudDetectionRate: number;
    falsePositiveRate: number;
    averageResponseTime: number;
    totalTransactions: number;
    highRiskTransactions: number;
  };
}

export interface Settings {
  system: {
    version: string;
    environment: string;
    maxTransactionsPerMinute: number;
    fraudDetectionThreshold: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
  };
  notifications: {
    smtpEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    webhookUrl: string;
  };
  database: {
    connectionPoolSize: number;
    queryTimeout: number;
    backupRetentionDays: number;
  };
}
