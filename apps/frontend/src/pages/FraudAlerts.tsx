import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface AlertSeverity {
  name: string;
  value: number;
  fill: string;
}

interface AlertStatus {
  name: string;
  value: number;
  color: string;
}

interface FraudAlert {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  rule: string;
  time: string;
  user: string;
  amount: number;
  status: 'Pending' | 'In Review' | 'Resolved' | 'Dismissed';
  description: string;
  sourceIp: string;
  location: string;
  riskScore: number;
  createdAt: string;
}

interface AlertStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  pending: number;
  inReview: number;
  resolved: number;
  dismissed: number;
}

export default function FraudAlerts() {
  const [severityData, setSeverityData] = useState<AlertSeverity[]>([]);
  const [statusData, setStatusData] = useState<AlertStatus[]>([]);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState<FraudAlert[]>([]);
  const [warningAlerts, setWarningAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  const fetchAlertsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all alerts data
      const [alertsResponse, statsResponse] = await Promise.all([
        apiService.getAlerts({ 
          limit: 100, 
          severity: filter === 'all' ? undefined : filter
        }),
        apiService.get('/api/alerts/stats')
      ]);

      const alerts = alertsResponse.data;
      const alertStats = statsResponse.data;

      setStats(alertStats);

      // Process severity data
      const severity: AlertSeverity[] = [
        { name: 'Critical', value: alertStats.critical, fill: '#EF4444' },
        { name: 'High', value: alertStats.high, fill: '#F59E0B' },
        { name: 'Medium', value: alertStats.medium, fill: '#F97316' },
        { name: 'Low', value: alertStats.low, fill: '#10B981' },
      ].filter((item: AlertSeverity) => item.value > 0);

      setSeverityData(severity);

      // Process status data
      const status: AlertStatus[] = [
        { name: 'Pending', value: alertStats.pending, color: '#F59E0B' },
        { name: 'In Review', value: alertStats.inReview, color: '#3B82F6' },
        { name: 'Resolved', value: alertStats.resolved, color: '#10B981' },
        { name: 'Dismissed', value: alertStats.dismissed, color: '#6B7280' },
      ].filter((item: AlertStatus) => item.value > 0);

      setStatusData(status);

      // Filter high priority alerts (Critical and High severity)
      const criticalAlerts = alerts.filter((alert: FraudAlert) => alert.severity === 'Critical');
      const highAlerts = alerts.filter((alert: FraudAlert) => alert.severity === 'High');
      
      setHighPriorityAlerts(criticalAlerts.slice(0, 10));
      setWarningAlerts(highAlerts.slice(0, 10));

    } catch (err: unknown) {
      console.error('Failed to fetch alerts data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts data');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlertsData();
    const interval = setInterval(fetchAlertsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter, timeRange, fetchAlertsData]);

  const handleAlertAction = async (alertId: string, action: 'resolve' | 'dismiss' | 'review') => {
    try {
      await apiService.request(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
      
      // Refresh data
      fetchAlertsData();
    } catch (err: unknown) {
      console.error('Failed to update alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to update alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'High': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'Low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !stats) {
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
            onClick={fetchAlertsData}
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Fraud Alerts Management</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAlertsData}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50"
            >
              <option value="all">All Alerts</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Time Range</span>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Alerts</p>
                <p className="text-lg font-semibold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Pending</p>
                <p className="text-lg font-semibold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">In Review</p>
                <p className="text-lg font-semibold text-white">{stats.inReview}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Resolved</p>
                <p className="text-lg font-semibold text-white">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-64 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-200 font-medium">Active Alerts by Severity</h3>
            <span className="text-xs text-gray-400">Total: {severityData.reduce((sum, item) => sum + item.value, 0)}</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {severityData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-64 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-200 font-medium">Alert Status Distribution</h3>
            <span className="text-xs text-gray-400">Total: {statusData.reduce((sum, item) => sum + item.value, 0)}</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={12} />
                <YAxis stroke="#4B5563" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-200 font-medium">Critical Alerts</h3>
            <span className="text-xs text-red-400">Requires Immediate Action</span>
          </div>
          <div className="space-y-3">
            {highPriorityAlerts.length > 0 ? (
              highPriorityAlerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{alert.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(alert.createdAt)}</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <p className="font-medium">{alert.rule}</p>
                    <p className="text-xs">{alert.description}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      <p>User: {alert.user}</p>
                      <p>IP: {alert.sourceIp}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAlertAction(alert.id, 'review')}
                        className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No critical alerts at this time
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-200 font-medium">High Priority Alerts</h3>
            <span className="text-xs text-yellow-400">Monitor Closely</span>
          </div>
          <div className="space-y-3">
            {warningAlerts.length > 0 ? (
              warningAlerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{alert.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTime(alert.createdAt)}</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <p className="font-medium">{alert.rule}</p>
                    <p className="text-xs">{alert.description}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      <p>User: {alert.user}</p>
                      <p>Score: {alert.riskScore}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAlertAction(alert.id, 'review')}
                        className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleAlertAction(alert.id, 'dismiss')}
                        className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded hover:bg-gray-500/30 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No high priority alerts at this time
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
