import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip 
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
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

interface RiskDataPoint {
  time: string;
  volume: number;
  mediumRisk: number;
  highRisk: number;
  lowRisk: number;
}

interface FraudAlert {
  id: string;
  sourceIp: string;
  amount: number;
  riskScore: number;
  status: 'pending' | 'reviewing' | 'resolved';
  createdAt: string;
  userId?: string;
  merchant?: string;
  location?: string;
}

interface GeographicRisk {
  country: string;
  region: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  alertCount: number;
  totalAmount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const MapDot = ({ 
  top, 
  left, 
  color, 
  delay, 
  riskLevel 
}: { 
  top: string; 
  left: string; 
  color: string; 
  delay: string;
  riskLevel: string;
}) => (
  <div 
    className="absolute w-2 h-2 rounded-full cursor-pointer group"
    style={{ top, left, backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
    title={`Risk Level: ${riskLevel}`}
  >
    <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color, animationDelay: delay }}></div>
    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {riskLevel}
    </div>
  </div>
);

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [riskData, setRiskData] = useState<RiskDataPoint[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [geoRisks, setGeoRisks] = useState<GeographicRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard metrics
      const metricsResponse = await apiService.get('/api/dashboard/metrics');
      setMetrics(metricsResponse.data);

      // Fetch risk data for charts
      const riskResponse = await apiService.get('/api/dashboard/risk-trends');
      setRiskData(riskResponse.data);

      // Fetch recent alerts
      const alertsResponse = await apiService.get('/api/dashboard/alerts?limit=10&sort=createdAt:desc');
      setAlerts(alertsResponse.data);

      // Fetch geographic risk data
      const geoResponse = await apiService.get('/api/dashboard/geographic-risk');
      setGeoRisks(geoResponse.data);

    } catch (err: unknown) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTrendIcon = (change: number) => {
    return change > 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const getTrendColor = (change: number) => {
    return change > 0 ? 'text-brand-green' : 'text-brand-red';
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button 
            onClick={fetchDashboardData}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">System Security Overview</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Activity className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Transactions Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-gray-400 text-sm font-medium mb-2">Total Transactions (7d)</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-semibold text-white">
              {formatNumber(metrics?.trends.transactions.current || 0)}
            </h2>
            <div className={`flex items-center gap-1 ${getTrendColor(metrics?.trends.transactions.change || 0)}`}>
              {getTrendIcon(metrics?.trends.transactions.change || 0)}
              <span className="text-sm font-medium">
                {Math.abs(metrics?.trends.transactions.changePercent || 0).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className={`h-8 mt-4 bg-gradient-to-r from-transparent ${
            (metrics?.trends.transactions.change || 0) > 0 
              ? 'via-brand-green/20' 
              : 'via-brand-red/20'
          } flex items-end`}>
            <div className={`w-full h-[2px] relative ${
              (metrics?.trends.transactions.change || 0) > 0 
                ? 'bg-brand-green shadow-[0_0_8px_#10B981]' 
                : 'bg-brand-red shadow-[0_0_8px_#EF4444]'
            }`}></div>
          </div>
        </div>
        
        {/* Prevented Fraud Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-gray-400 text-sm font-medium mb-2">Prevented Fraud (7d)</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-semibold text-white">
              {formatCurrency(metrics?.trends.fraud.current || 0)}
            </h2>
            <div className={`flex items-center gap-1 ${getTrendColor(metrics?.trends.fraud.change || 0)}`}>
              {getTrendIcon(metrics?.trends.fraud.change || 0)}
              <span className="text-sm font-medium">
                {Math.abs(metrics?.trends.fraud.changePercent || 0).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className={`h-8 mt-4 bg-gradient-to-r from-transparent ${
            (metrics?.trends.fraud.change || 0) > 0 
              ? 'via-brand-green/20' 
              : 'via-brand-red/20'
          } flex items-end`}>
            <div className={`w-full h-[2px] relative ${
              (metrics?.trends.fraud.change || 0) > 0 
                ? 'bg-brand-green shadow-[0_0_8px_#10B981]' 
                : 'bg-brand-red shadow-[0_0_8px_#EF4444]'
            }`}></div>
          </div>
        </div>

        {/* Active Alerts Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Active Alerts</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl font-semibold text-white">
                  {(metrics?.activeAlerts.high || 0) + (metrics?.activeAlerts.medium || 0)} / {metrics?.activeAlerts.low || 0}
                </h2>
                {(metrics?.activeAlerts.critical || 0) > 0 && (
                  <span className="text-brand-red text-sm font-medium">
                    Critical: {metrics?.activeAlerts.critical}
                  </span>
                )}
              </div>
            </div>
            {(metrics?.activeAlerts.critical || 0) > 0 && (
              <div className="p-2 bg-brand-red/10 border border-brand-red/30 rounded-lg text-brand-red">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Risk Volume Chart */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-200 font-medium">Real-time Risk Volume</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
              <span className="text-gray-400">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
              <span className="text-gray-400">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-red rounded-full"></div>
              <span className="text-gray-400">High Risk</span>
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="lowRisk" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              <Area type="monotone" dataKey="mediumRisk" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorMed)" />
              <Area type="monotone" dataKey="highRisk" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Alerts Queue Table */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-200 font-medium">High Risk Alerts Queue</h3>
            <button 
              onClick={fetchDashboardData}
              className="text-xs text-brand-blue hover:text-brand-blue/80"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 border-b border-dark-border uppercase">
                <tr>
                  <th className="py-3 font-normal">Alert ID</th>
                  <th className="py-3 font-normal">Risk Score</th>
                  <th className="py-3 font-normal">Amount</th>
                  <th className="py-3 font-normal">Status</th>
                  <th className="py-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-dark-border/50 hover:bg-[#121620] transition-colors">
                    <td className="py-4 font-mono">{alert.id}</td>
                    <td className="py-4">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.riskScore >= 80 ? 'bg-red-500/20 text-red-400' :
                          alert.riskScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {alert.riskScore}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-white">
                      {formatCurrency(alert.amount)}
                    </td>
                    <td className="py-4">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          alert.status === 'reviewing' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="bg-[#121620] border border-dark-border hover:border-brand-blue text-xs px-3 py-1.5 rounded transition-all">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No high-risk alerts at this time
              </div>
            )}
          </div>
        </div>

        {/* Geographic Risk Heatmap */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-200 font-medium">Geographic Risk Heatmap</h3>
            <span className="text-sm text-gray-400">
              {geoRisks.length} Active Regions
            </span>
          </div>
          <div className="flex-1 rounded-lg bg-[#111827] border border-dark-border relative overflow-hidden flex items-center justify-center">
            {/* Mock World Map Background Grid */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#374151 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Dynamic Map Dots based on real data */}
            {geoRisks.map((risk, index) => {
              const position = {
                top: `${20 + (index * 15) % 60}%`,
                left: `${15 + (index * 20) % 70}%`
              };
              return (
                <MapDot 
                  key={risk.country}
                  top={position.top}
                  left={position.left}
                  color={getRiskColor(risk.riskLevel)}
                  delay={`${index * 0.5}s`}
                  riskLevel={`${risk.country} - ${risk.alertCount} alerts`}
                />
              );
            })}
            
            <div className="absolute bottom-4 left-4 text-xs text-gray-500">
              <div className="space-y-1">
                <div>• Real-time geographic risk analysis</div>
                <div>• Updated every 30 seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
