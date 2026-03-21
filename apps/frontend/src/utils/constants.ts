export const API_BASE_URL = 'http://localhost:4000';
export const WS_URL = 'ws://localhost:4000';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  ALERTS: '/alerts',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  RULES: '/rules'
} as const;

export const ALERT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER'
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  FLAGGED: 'flagged',
  COMPLETED: 'completed'
} as const;

export const CHART_COLORS = {
  PRIMARY: '#1f2937',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
} as const;
