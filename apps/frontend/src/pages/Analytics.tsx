import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';

const captureRateData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  prevented: Math.floor(Math.random() * 8000) + 8000, // 8k to 16k
  detected: Math.floor(Math.random() * 4000) + 2000,  // 2k to 6k
}));

const fraudTypeData = [
  { name: 'Account Takeover', value: 35, fill: '#EF4444' }, // Red
  { name: 'Payment Fraud', value: 20, fill: '#F59E0B' },   // Orange
  { name: 'Friendly Fraud', value: 26, fill: '#FACC15' },  // Yellow
  { name: 'Identity Theft', value: 19, fill: '#8B5CF6' },  // Purple
];

const merchantCategories = [
  { label: 'Gaming', value: '$266.0K', width: '80%' },
  { label: 'Electronics', value: '$146.0K', width: '55%' },
  { label: 'Travel', value: '$120.0K', width: '45%' },
  { label: 'Crypto', value: '$52.0K', width: '20%' },
  { label: 'Retail', value: '$12.0K', width: '8%' },
];

const MapDot = ({ top, left, size, intensity }: { top: string; left: string; size: number; intensity: 'high' | 'medium' | 'low' }) => {
  const colors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#3B82F6'
  };
  const color = colors[intensity];
  return (
    <div 
      className="absolute rounded-full"
      style={{ top, left, width: size, height: size, backgroundColor: color, boxShadow: `0 0 ${size * 2}px ${color}` }}
    >
      <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color, animationDuration: intensity === 'high' ? '1.5s' : '3s' }}></div>
    </div>
  );
};

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Advanced Analytics</h2>
        <select className="bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50">
           <option>Last 30 Days</option>
        </select>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 h-[22rem] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-200 font-medium">Fraud Capture Rate Trends</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-blue"></div> Detected Fraud</span>
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-green"></div> Prevented Fraud</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={captureRateData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val % 5 === 0 ? val : ''} />
                <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="prevented" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPrev)" />
                <Area type="monotone" dataKey="detected" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorDet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-[22rem] flex flex-col items-center relative">
          <h3 className="text-gray-200 font-medium self-start mb-6">Fraud Type Breakdown</h3>
          <div className="w-full h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fraudTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    return (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
                         {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={false}
                >
                  {fraudTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full mt-auto grid grid-cols-2 gap-y-3 gap-x-2">
            {fraudTypeData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col h-[22rem]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-gray-200 font-medium">High Risk Merchant Categories</h3>
            <span className="text-sm text-gray-400">Total Flagged Transaction</span>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {merchantCategories.map(item => (
              <div key={item.label} className="flex items-center gap-4 group">
                <span className="w-24 text-sm text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                <div className="flex-1 h-6 bg-[#121620] overflow-hidden">
                  <div className="h-full bg-brand-blue/90 border-r-2 border-brand-blue group-hover:brightness-110 transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: item.width }}></div>
                </div>
                <span className="w-20 text-right text-sm font-medium text-gray-200">{item.value}</span>
              </div>
            ))}
            <div className="mt-4 flex justify-between text-xs text-gray-500 border-t border-dark-border/50 pt-2 px-28">
              <span>0</span>
              <span>5k</span>
              <span>10k</span>
              <span>15k</span>
              <span>20k</span>
              <span>25k</span>
              <span>30k</span>
            </div>
          </div>
        </div>
        
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-[22rem] flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 z-10 relative">
            <h3 className="text-gray-200 font-medium">Device Fingerprinting Analysis</h3>
            <span className="text-sm text-gray-400">Global Anomaly Map</span>
          </div>
          <div className="absolute inset-0 top-16 bottom-6 right-6 left-6 rounded-lg bg-[#111827] border border-dark-border flex items-center justify-center overflow-hidden">
            {/* Mock map via an SVG pattern or CSS */}
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'radial-gradient(#6B7280 1px, transparent 1px)', 
              backgroundSize: '12px 12px',
              backgroundPosition: 'center center'
            }}></div>
            
            {/* Heatmap Nodes */}
            <MapDot top="40%" left="25%" size={24} intensity="high" />   {/* US */}
            <MapDot top="35%" left="45%" size={12} intensity="medium" /> {/* Europe */}
            <MapDot top="60%" left="75%" size={16} intensity="high" />   {/* SE Asia */}
            <MapDot top="50%" left="85%" size={10} intensity="medium" /> {/* Japan */}
            <MapDot top="70%" left="28%" size={8}  intensity="low" />    {/* South America */}
            
            <span className="text-gray-500 font-mono text-xs z-10 opacity-30 uppercase tracking-widest pointer-events-none">Map Representation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
