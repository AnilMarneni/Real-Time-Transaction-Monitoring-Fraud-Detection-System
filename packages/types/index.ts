export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  merchant: string;
  location: string;
  createdAt: string;
}

export interface FraudScore {
  transactionId: string;
  riskScore: number;
  flagged: boolean;
}