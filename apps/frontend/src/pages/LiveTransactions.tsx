import { clsx } from "clsx";
import { useWebSocket } from "../hooks/useWebSocket";

export default function LiveTransactions() {
  const { isConnected, transactions, alerts } = useWebSocket();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-brand-red';
    if (score >= 40) return 'bg-brand-yellow';
    return 'bg-brand-green';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-brand-green';
      case 'Flagged': return 'text-brand-yellow';
      case 'Declined': return 'text-brand-red';
      default: return 'text-gray-400';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Table Container */}
      <div className="flex-1 bg-dark-card border border-dark-border rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Live Transactions</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className={clsx(
                "flex items-center gap-2 text-sm",
                isConnected ? "text-green-400" : "text-red-400"
              )}>
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-400" : "bg-red-400"
                )} />
                {isConnected ? "Connected" : "Disconnected"}
              </span>
              <span className="text-sm text-gray-400">
                {transactions.length} transactions
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-[#141a23] sticky top-0">
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    {isConnected ? "Waiting for transactions..." : "Connecting to server..."}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr key={`${transaction.id}-${index}`} className="hover:bg-[#141a23] transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-gray-300">
                      {transaction.id.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "text-sm font-medium",
                        getStatusColor(transaction.status)
                      )}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          "w-2 h-2 rounded-full",
                          getScoreColor(transaction.riskScore)
                        )} />
                        <span className="text-sm text-white">
                          {Math.abs(transaction.riskScore).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {transaction.timestamp ? formatTime(transaction.timestamp) : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="w-80 bg-dark-card border border-dark-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-white">Fraud Alerts</h3>
          <span className="text-sm text-gray-400">
            {alerts.length} active alerts
          </span>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No fraud alerts
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div key={`${alert.transactionId}-${index}`} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-red-400 font-medium">HIGH RISK</span>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
                <div className="text-sm text-white mb-1">
                  Transaction {alert.transactionId?.slice(0, 8)}...
                </div>
                <div className="text-xs text-gray-400">
                  Risk Score: {alert.riskScore ? Math.abs(alert.riskScore).toFixed(1) : 'N/A'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {alert.message || 'Fraud detected'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
