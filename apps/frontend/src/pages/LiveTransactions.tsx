import { useState } from "react";
import { clsx } from "clsx";
import { useWebSocket } from "../hooks/useWebSocket";
import { Search, ChevronDown, Wifi, X, Smartphone } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const miniChartData = Array.from({ length: 7 }).map((_, i) => ({
  day: `${i + 1} Days`,
  txs: Math.floor(Math.random() * 100) + 20,
}));

export default function LiveTransactions() {
  const { isConnected, transactions } = useWebSocket();
  const [selectedTx, setSelectedTx] = useState<string | null>('020000399884551');

  // Hardcode some values to supplement ws data to map to mockup exactly
  const mockupTx = [
    { time: '2023-05-10 10:56:33', id: '020000399884551', custId: '00000035997', amount: 12.50, method: 'Visa', risk: 'High Risk', status: 'Committed' },
    { time: '2023-05-10 10:55:51', id: '020000A020A3607', custId: '0000003618', amount: 79.50, method: 'Visa', risk: 'Med Risk', status: 'Transacted' },
    { time: '2023-05-10 10:55:41', id: '0200001013A8826', custId: '00000181918', amount: 17.00, method: 'Apple Pay', risk: 'Low risk', status: 'Transacted' },
    { time: '2023-05-10 10:56:36', id: 'selected-mock', custId: '00000035997', amount: 12.50, method: 'Visa', risk: 'High Risk', status: 'Committed'},
    { time: '2023-05-10 10:55:53', id: '020000A302A3607', custId: '0000033618', amount: 79.50, method: 'Visa', risk: 'High Risk', status: 'Transacted' },
    { time: '2023-05-10 10:55:45', id: '020000A002A2406', custId: '00000103617', amount: 79.50, method: 'Apple Pay', risk: 'Med Risk', status: 'Transacted' },
    { time: '2023-05-10 10:55:40', id: '020000A002A8826', custId: '00000181818', amount: 17.00, method: 'Visa', risk: 'Med Risk', status: 'Transacted' },
    { time: '2023-05-10 10:55:35', id: '02000039984551', custId: '00000133996', amount: 12.50, method: 'Visa', risk: 'High Risk', status: 'Transacted' },
    { time: '2023-05-10 10:55:38', id: '020000131A8827', custId: '00000134853', amount: 79.50, method: 'Visa', risk: 'Low', status: 'Transacted' },
    { time: '2023-05-10 10:55:37', id: '020000281A3672', custId: '00000133317', amount: 17.00, method: 'Apple Pay', risk: 'Low', status: 'Transacted' },
  ];

  const displayTx = transactions.length > 0 
    ? transactions.map(tx => ({
        time: new Date(tx.timestamp || Date.now()).toLocaleTimeString(),
        id: tx.id,
        custId: '00000035997', 
        amount: tx.amount,
        method: 'Visa', 
        risk: tx.riskScore >= 80 ? 'High Risk' : tx.riskScore >= 40 ? 'Med Risk' : 'Low risk',
        status: tx.status
      })).slice(0, 10)
    : mockupTx;

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
                  const isSelected = selectedTx === tx.id || (index === 3 && selectedTx === '020000399884551');
                  return (
                    <tr 
                      key={index} 
                      onClick={() => setSelectedTx(tx.id === 'selected-mock' ? '020000399884551' : tx.id)}
                      className={clsx(
                        "cursor-pointer transition-colors border-b border-dark-border/50",
                        isSelected ? "bg-brand-blue/10 border-l-2 border-l-brand-blue outline outline-1 outline-brand-blue/50" : "hover:bg-[#121620]"
                      )}
                    >
                      <td className="px-4 py-3">{tx.time}</td>
                      <td className="px-4 py-3 text-brand-blue font-mono">{tx.id === 'selected-mock' ? '020000399884551' : tx.id}</td>
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
                      <td className="px-4 py-3">{tx.status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 border-t border-dark-border flex justify-center items-center gap-1 text-sm text-gray-400">
            <span>Page</span>
            <button className="px-2 hover:text-white">&lt;</button>
            <button className="w-6 h-6 rounded bg-brand-blue text-white flex items-center justify-center">1</button>
            <button className="px-2 hover:text-white">2</button>
            <button className="px-2 hover:text-white">&gt;</button>
            <button className="px-2 hover:text-white">&gt;|</button>
          </div>
        </div>

        {/* Selected Transaction Panel */}
        {selectedTx && (
          <div className="w-[320px] bg-dark-card border border-dark-border rounded-xl flex flex-col overflow-hidden relative">
            <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-5 flex-1 overflow-y-auto w-full">
              <div className="space-y-4 text-sm w-full">
                <div>
                  <span className="text-gray-400 block mb-1">Customer Name:</span>
                  <span className="text-white">Joran Smith</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Billing Address</span>
                  <p className="text-white leading-tight">702 Eltoriman Dd<br/>Street AP1, Karigi oA<br/>19032</p>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">IP Address</span>
                  <span className="text-white">222.16.07.228</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Device Type</span>
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                
                <div className="pt-2">
                  <span className="text-white font-medium block">Mini Velocity Check</span>
                  <span className="text-xs text-gray-400 block mb-3">Number of transactions from this card in the last hour</span>
                  <div className="h-24 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={miniChartData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                        <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickCount={4} domain={[0, 150]} />
                        <XAxis dataKey="day" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                        <defs>
                          <linearGradient id="colorMini" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Line type="monotone" dataKey="txs" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-white font-medium block mb-2">Full raw data</span>
                  <div className="bg-[#121620] border border-dark-border rounded-lg p-3 text-xs font-mono text-gray-400 overflow-x-auto whitespace-pre">
{`{
  "risk": null,
  "Customer Name": "Joran Smith",
  "Billing Address": "2023-00920-Street",
  "Billing Address Risk": "High",
  "IP Address": "192.12.11",
  "Device Type": "mobile",
  "Mini velocity check": 1
}`}
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
