import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip 
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

const riskData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}h`,
  volume: Math.floor(Math.random() * 5000) + 2000,
  mediumRisk: Math.floor(Math.random() * 3000) + 1000,
  highRisk: Math.floor(Math.random() * 2000) + 500,
}));

const alertsQueue = [
  { id: 'A5432', ip: '192.168.1.1', amount: '$1,200' },
  { id: 'A5433', ip: '192.168.1.1', amount: '$1,200' },
  { id: 'A5434', ip: '192.168.1.1', amount: '$1,200' },
  { id: 'A5435', ip: '192.168.1.1', amount: '$1,200' },
];

const MapDot = ({ top, left, color, delay }: { top: string; left: string; color: string; delay: string }) => (
  <div 
    className="absolute w-2 h-2 rounded-full"
    style={{ top, left, backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
  >
    <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color, animationDelay: delay }}></div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">System Security Overview</h2>
      
      {/* 3 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-gray-400 text-sm font-medium mb-2">Total Transactions (7d)</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-semibold text-white">1.2M</h2>
            <span className="text-brand-green text-sm font-medium">+5.2%</span>
          </div>
          <div className="h-8 mt-4 bg-gradient-to-r from-transparent via-brand-green/20 to-transparent flex items-end">
            <div className="w-full h-[2px] bg-brand-green relative shadow-[0_0_8px_#10B981]"></div>
          </div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <p className="text-gray-400 text-sm font-medium mb-2">Prevented Fraud (7d)</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-semibold text-white">$45.8K</h2>
            <span className="text-brand-yellow text-sm font-medium">-1.2%</span>
          </div>
          <div className="h-8 mt-4 bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent flex items-end">
             <div className="w-full h-[2px] bg-brand-yellow relative shadow-[0_0_8px_#F59E0B]"></div>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Active Alerts (High/Med)</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl font-semibold text-white">14 / 89</h2>
                <span className="text-brand-red text-sm font-medium">Critical: 3</span>
              </div>
            </div>
            <div className="p-2 bg-brand-red/10 border border-brand-red/30 rounded-lg text-brand-red">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Risk Volume */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-96">
        <h3 className="text-gray-200 font-medium mb-4">Real-time Risk Volume</h3>
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
              <Area type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
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
          <h3 className="text-gray-200 font-medium mb-4">High Risk Alerts Queue</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 border-b border-dark-border uppercase">
                <tr>
                  <th className="py-3 font-normal">Alert ID</th>
                  <th className="py-3 font-normal">Source IP</th>
                  <th className="py-3 font-normal">Amount</th>
                  <th className="py-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {alertsQueue.map((alert, idx) => (
                  <tr key={idx} className="border-b border-dark-border/50 hover:bg-[#121620] transition-colors">
                    <td className="py-4">{alert.id}</td>
                    <td className="py-4 font-mono text-gray-400">{alert.ip}</td>
                    <td className="py-4 font-medium text-white">{alert.amount}</td>
                    <td className="py-4 text-right">
                      <button className="bg-[#121620] border border-dark-border hover:border-brand-blue text-xs px-3 py-1.5 rounded transition-all">
                        Review Button
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geographic Risk Heatmap Mock */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-200 font-medium">Geographic Risk Heatmap</h3>
            <span className="text-sm text-gray-400">Top Fraud Sources</span>
          </div>
          <div className="flex-1 rounded-lg bg-[#111827] border border-dark-border relative overflow-hidden flex items-center justify-center">
            {/* Mock World Map Background Grid/Dots */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#374151 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Glowing Map Dots */}
            <MapDot top="30%" left="20%" color="#EF4444" delay="0s" />
            <MapDot top="45%" left="25%" color="#F59E0B" delay="1s" />
            <MapDot top="25%" left="45%" color="#EF4444" delay="0.5s" />
            <MapDot top="55%" left="75%" color="#EF4444" delay="2s" />
            <MapDot top="65%" left="80%" color="#F59E0B" delay="1.5s" />
            
            <span className="text-gray-500 font-mono text-xs z-10 opacity-50 uppercase tracking-widest">Map Simulation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
