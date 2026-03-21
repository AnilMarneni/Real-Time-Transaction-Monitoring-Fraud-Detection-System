import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { useWebSocket } from "../hooks/useWebSocket";
import { Search, ChevronDown, Wifi, X } from "lucide-react";

export default function LiveTransactions() {
  const { isConnected, transactions } = useWebSocket();
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const displayTx = transactions.map(tx => ({
    time: new Date(tx.timestamp || Date.now()).toLocaleTimeString(),
    id: tx.id,
    custId: 'N/A', 
    amount: tx.amount,
    method: 'N/A', 
    riskScore: tx.riskScore,
    risk: tx.riskScore >= 80 ? 'High Risk' : tx.riskScore >= 40 ? 'Med Risk' : 'Low risk',
    status: tx.status
  })).slice(0, 15);

  const selectedTxData = useMemo(() => {
    return transactions.find(t => t.id === selectedTx);
  }, [transactions, selectedTx]);

  return (
    <div className="flex flex-col h-full space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-white">Transactions (Live)</h2>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-green animate-pulse' : 'bg-brand-red'}`} />
          <span className={`text-xs font-medium ${isConnected ? 'text-brand-green' : 'text-brand-red'}`}>Live feed</span>
        </div>
        <Wifi className="w-4 h-4 text-gray-400" />
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for Transaction ID or Customer"
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-brand-blue"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Risk Score</span>
          <button className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white">
            High, Medium, Low
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Status</span>
          <button className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white">
            Completed, Flagged, Pending
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Date Range</span>
          <button className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white">
            Last 24h, Last Week
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Payment Method</span>
          <button className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white">
            Visa, Apple Pay
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-[500px]">
        {/* Table Container */}
        <div className="flex-1 bg-dark-card border border-dark-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-dark-border">
            <h3 className="text-gray-200 font-medium">Recent Transactions</h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-gray-400 border-b border-dark-border font-normal">
                <tr>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Transaction ID</th>
                  <th className="px-4 py-3 font-medium">Customer ID</th>
                  <th className="px-4 py-3 font-medium">Amount ($)</th>
                  <th className="px-4 py-3 font-medium">Payment Method</th>
                  <th className="px-4 py-3 font-medium">Risk Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {displayTx.map((tx, index) => {
                  const isSelected = selectedTx === tx.id;
                  return (
                    <tr 
                      key={index} 
                      onClick={() => setSelectedTx(tx.id)}
                      className={clsx(
                        "cursor-pointer transition-colors border-b border-dark-border/50",
                        isSelected ? "bg-brand-blue/10 border-l-2 border-l-brand-blue outline outline-1 outline-brand-blue/50" : "hover:bg-[#121620]"
                      )}
                    >
                      <td className="px-4 py-3">{tx.time}</td>
                      <td className="px-4 py-3 text-brand-blue font-mono">{tx.id.substring(0, 16)}...</td>
                      <td className="px-4 py-3 font-mono">{tx.custId}</td>
                      <td className="px-4 py-3 text-white">${tx.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">{tx.method}</td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-xs",
                          tx.risk.includes('High') ? 'bg-brand-red text-white' :
                          tx.risk.includes('Med') ? 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30' :
                          'bg-brand-green/20 text-brand-green border border-brand-green/30'
                        )}>
                          {tx.risk}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize">{tx.status}</td>
                    </tr>
                  )
                })}
                {displayTx.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Waiting for live transactions...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Transaction Panel */}
        {selectedTxData && (
          <div className="w-[320px] bg-dark-card border border-dark-border rounded-xl flex flex-col overflow-hidden relative">
            <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-5 flex-1 overflow-y-auto w-full">
              <div className="space-y-4 text-sm w-full">
                <div>
                  <span className="text-gray-400 block mb-1">Transaction ID:</span>
                  <span className="text-white font-mono">{selectedTxData.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Timestamp</span>
                  <span className="text-white">{new Date(selectedTxData.timestamp || Date.now()).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Amount</span>
                  <span className="text-white">${selectedTxData.amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Status</span>
                  <span className="text-white capitalize">{selectedTxData.status}</span>
                </div>
                
                <div className="pt-2">
                  <span className="text-white font-medium block mb-2">Full raw data</span>
                  <div className="bg-[#121620] border border-dark-border rounded-lg p-3 text-xs font-mono text-gray-400 overflow-x-auto whitespace-pre">
{JSON.stringify(selectedTxData, null, 2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
