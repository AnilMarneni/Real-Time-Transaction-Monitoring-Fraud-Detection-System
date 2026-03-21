import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { apiService } from '../services/api';

interface DashboardMetrics {
  totalTransactions: number;
  preventedFraud: number;
  activeAlerts: {
    high: number;
    medium: number;
    low: number;
    critical: number;
  };
  trends: {
    transactions: { changePercent: number; };
    fraud: { changePercent: number; };
  };
}

// Mock data to exactly match the charts in the mockup
const volumeVsFraudData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i + 1}`,
  valid: Math.floor(Math.random() * 1500) + 1000,
  blocked: Math.floor(Math.random() * 300) + 50,
}));

const incidenceTrendData = Array.from({ length: 7 }).map((_, i) => ({
  day: `${i + 1} Days`,
  rate: Math.random() * 0.8 + 0.2,
}));

const recentTransactionsMock = [
  { id: '02000...39884551', time: '2023-05-10 10:56:33', amount: 12.50, risk: 'High Risk', status: 'Committed' },
  { id: '020003A020A3607', time: '2023-05-10 10:55:51', amount: 79.50, risk: 'High Risk', status: 'Transacted' },
  { id: '0900001013A4826', time: '2023-05-10 10:55:41', amount: 17.00, risk: 'Low risk', status: 'Transacted' },
  { id: '02000...39884551', time: '2023-05-10 10:55:36', amount: 12.50, risk: 'High Risk', status: 'Committed' },
  { id: '020003A020A3607', time: '2023-05-10 10:55:33', amount: 79.50, risk: 'High Risk', status: 'Transacted' },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const metricsResponse = await apiService.get('/api/dashboard/metrics');
      setMetrics(metricsResponse.data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('en-US');
  const formatCurrencyM = (num: number) => `$${(num / 1000000).toFixed(2)}M`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {/* Left Side: Main Overview & Charts */}
        <div className="col-span-3 space-y-4">
          
          {/* Main Overview Panel */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Main Overview</h2>
            <div className="grid grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="p-4 border border-dark-border rounded-lg bg-[#121620]">
                <p className="text-sm text-gray-400 mb-1">Total Transactions (Last 24h)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">{metrics ? formatNumber(metrics.totalTransactions) : '14,258'}</h3>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-brand-green">
                  <span>{metrics?.trends?.transactions?.changePercent ? `+${metrics.trends.transactions.changePercent}%` : '+3.5%'}</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="p-4 border border-dark-border rounded-lg bg-[#121620]">
                <p className="text-sm text-gray-400 mb-1">Fraud Prevented ($)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">{metrics ? formatCurrencyM(metrics.preventedFraud) : '$1.25M'}</h3>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-brand-green">
                  <span>+1.1%</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 border border-dark-border rounded-lg bg-[#121620]">
                <p className="text-sm text-gray-400 mb-1">Active Alerts</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">287</h3>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30">High Risk</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-brand-red">
                  <span>+12%</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-4 border border-dark-border rounded-lg bg-[#121620]">
                <p className="text-sm text-gray-400 mb-1">System Status</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-brand-green/20 text-brand-green border border-brand-green/30">OPERATIONAL</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>100%</span>
                  <span>Uptime</span>
                  <span>32 hrs</span>
                </div>
                <div className="h-6 w-full flex items-end overflow-hidden">
                  <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none">
                    <path d="M0,12 L10,14 L20,8 L30,15 L40,10 L50,12 L60,5 L70,16 L80,9 L90,14 L100,10" fill="none" stroke="#10B981" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Chart 1: Transaction Volume */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-200 mb-4">Transaction Volume vs. Blocked Fraud (Hourly) - Last 24h</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeVsFraudData} margin={{ top: 0, right: 0, bottom: -10, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
                    <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="valid" name="Valid transactions" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="blocked" name="Blocked Fraud" stackId="a" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Fraud Incidence */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-200 mb-4">Fraud Incidence Trend (Weekly)</h3>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incidenceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(1)}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', fontSize: '12px' }} />
                    <defs>
                      <linearGradient id="colorIncidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Line type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} />
                    {/* Fake area effect under line */}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-200 mb-4">Recent Transactions (Flagged)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-dark-border">
                    <th className="pb-3 font-medium">Transaction ID</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Amount ($)</th>
                    <th className="pb-3 font-medium">Risk Score</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {recentTransactionsMock.map((tx, idx) => (
                    <tr key={idx} className="border-b border-dark-border/50 hover:bg-[#121620] transition-colors">
                      <td className="py-3 text-brand-blue">{tx.id}</td>
                      <td className="py-3">{tx.time}</td>
                      <td className="py-3">${tx.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          tx.risk === 'High Risk' ? 'bg-brand-red text-white' :
                          tx.risk === 'Low risk' ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' :
                          'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30'
                        }`}>
                          {tx.risk}
                        </span>
                      </td>
                      <td className="py-3 text-right">{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Alert Summary */}
        <div className="col-span-1 border border-dark-border rounded-xl bg-dark-card p-5 h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Alert Summary</h2>
          
          <div className="space-y-2 mb-6 text-sm">
            <p className="text-gray-400 mb-2">Quick action</p>
            <button className="w-full text-center py-2 bg-transparent border border-dark-border rounded hover:bg-dark-border transition-colors text-gray-300">
              Resolve
            </button>
            <button className="w-full text-center py-2 bg-transparent border border-dark-border rounded hover:bg-dark-border transition-colors text-gray-300">
              Dismiss
            </button>
            <button className="w-full text-center py-2 bg-transparent border border-dark-border rounded hover:bg-dark-border transition-colors text-gray-300">
              Investigate
            </button>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-3">Quick view of top 3 critical alerts</p>
            <div className="space-y-3">
              <div className="p-3 border border-dark-border rounded-lg bg-[#121620]">
                <p className="text-sm font-medium text-white mb-1">
                  <span className="text-brand-red">1 High Risk:</span> Retail Transacti...
                </p>
                <p className="text-xs text-gray-500">Fraud rate | 3 hours ago</p>
              </div>
              <div className="p-3 border border-dark-border rounded-lg bg-[#121620]">
                <p className="text-sm font-medium text-white mb-1">
                  <span className="text-brand-red">2 High Risk:</span> Transaction Su...
                </p>
                <p className="text-xs text-gray-500">Fraud rate | 3 hours ago</p>
              </div>
              <div className="p-3 border border-dark-border rounded-lg bg-[#121620]">
                <p className="text-sm font-medium text-white mb-1">
                  <span className="text-brand-red">3 High Risk:</span> Transaction Tu...
                </p>
                <p className="text-xs text-gray-500">Fraud rate | 3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
