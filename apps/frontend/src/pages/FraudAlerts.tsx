import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';

const severityData = [
  { name: 'Critical', value: 14500, fill: '#EF4444' },
  { name: 'High', value: 8200, fill: '#F59E0B' },
  { name: 'Medium', value: 4100, fill: '#F97316' },
];

const statusData = [
  { name: 'Pending', value: 45, color: '#F59E0B' },
  { name: 'In Review', value: 25, color: '#3B82F6' },
  { name: 'Resolved', value: 30, color: '#10B981' },
];

const highPriorityAlerts = [
  { id: 'A-9871', severity: 'Critical', rule: 'Velocity_IP_1hr', time: '12:32 PM', user: 'Affected User' },
  { id: 'A-9872', severity: 'Critical', rule: 'Velocity_IP_1hr', time: '12:31 PM', user: 'Affected User' },
  { id: 'A-9873', severity: 'Critical', rule: 'Velocity_IP_1hr', time: '12:28 PM', user: 'Affected User' },
];

const warningAlerts = [
  { id: 'W-4432', severity: 'High', rule: 'Geo_Anomaly', user: 'Alex J User' },
  { id: 'W-4433', severity: 'High', rule: 'Geo_Anomaly', user: 'Alex J User' },
  { id: 'W-4434', severity: 'High', rule: 'Geo_Anomaly', user: 'Alex J User' },
];

export default function FraudAlerts() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Fraud Alerts Management</h2>
        <div className="flex items-center gap-3">
           <span className="text-sm text-gray-400">Data Range</span>
           <select className="bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50">
             <option>Real-time Feed</option>
           </select>
        </div>
      </div>

      {/* Top Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-64 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-gray-200 font-medium">Active Alerts by Severity</h3>
             <div className="flex flex-col gap-2">
               {severityData.map(item => (
                 <div key={item.name} className="flex items-center gap-2 text-sm text-gray-400">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></div>
                   {item.name}
                 </div>
               ))}
             </div>
          </div>
          <div className="flex-1 w-2/3 ml-auto mr-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#1F2937' }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-64 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-gray-200 font-medium">Alert Status</h3>
             <div className="flex flex-col gap-2">
               {statusData.map(item => (
                 <div key={item.name} className="flex items-center gap-2 text-sm text-gray-400">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                   {item.name}
                 </div>
               ))}
             </div>
          </div>
          <div className="flex-1 right-12 relative flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alert Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-gray-200 font-medium mb-4">High Priority Alerts</h3>
          <div className="space-y-4">
            {highPriorityAlerts.map(alert => (
              <div key={alert.id} className="bg-dark-bg border border-dark-border border-t-2 border-t-brand-red rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-200 font-mono text-sm">Alert ID: {alert.id}</span>
                  <div className="flex gap-2 text-xs">
                    <button className="bg-dark-card border border-dark-border hover:border-brand-blue hover:text-white px-3 py-1.5 rounded transition-colors text-gray-300">
                      [Review Details]
                    </button>
                    <button className="bg-dark-card border border-dark-border hover:border-brand-green hover:text-white px-3 py-1.5 rounded transition-colors text-gray-300">
                      [Mark as Resolved]
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-400">Severity: <span className="text-brand-red ml-2">{alert.severity}</span></span>
                  <span className="text-gray-400">Rule Triggered: <span className="text-gray-200 ml-2">{alert.rule}</span></span>
                  {alert.time && <span className="text-gray-400">Time: <span className="text-gray-200 ml-2">{alert.time}</span></span>}
                  <span className="text-gray-400">Affected User: <span className="text-gray-200 ml-2">{alert.user}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-gray-200 font-medium mb-4">Warning Level Alerts</h3>
          <div className="space-y-4">
            {warningAlerts.map(alert => (
              <div key={alert.id} className="bg-dark-bg border border-dark-border border-t-2 border-t-brand-yellow rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-200 font-mono text-sm">Alert ID: {alert.id}</span>
                  <div className="flex gap-2 text-xs">
                    <button className="bg-dark-card border border-dark-border hover:border-brand-blue hover:text-white px-3 py-1.5 rounded transition-colors text-gray-300">
                      [Investigate]
                    </button>
                    <button className="bg-dark-card border border-dark-border hover:border-gray-400 hover:text-white px-3 py-1.5 rounded transition-colors text-gray-300">
                      [Dismiss]
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-400">Severity: <span className="text-brand-yellow ml-2">{alert.severity}</span></span>
                  <span className="text-gray-400">Rule Triggered: <span className="text-gray-200 ml-2">{alert.rule}</span></span>
                  <span className="text-gray-400 col-span-2">Affected User: <span className="text-gray-200 ml-2">{alert.user}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
