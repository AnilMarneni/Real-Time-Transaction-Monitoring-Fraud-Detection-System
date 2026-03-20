import { clsx } from "clsx";

const mockTransactions = Array.from({ length: 12 }).map((_, i) => {
  const isDeclined = i === 11;
  const isFlagged = i === 3 || i === 8 || i === 10;
  
  let status = 'Approved';
  let score = Math.floor(Math.random() * 30) + 12; // 12-42
  
  if (isFlagged) {
    status = 'Flagged';
    score = Math.floor(Math.random() * 20) + 40; // 40-60
  }
  if (isDeclined || i === 0 || i === 4) {
    status = i === 11 ? 'Declined' : 'Approved';
    if(i===0 || i===4) score = 92;
  }
  
  return {
    id: `TXN_A1B2C3D${i % 10}`,
    customer: 'J. Doe',
    time: '14:32:01.05',
    method: 'Visa ...4421',
    amount: '$15.50',
    location: 'Berlin, DE',
    score,
    status
  };
});

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

export default function LiveTransactions() {
  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Table Container */}
      <div className="flex-1 bg-dark-card border border-dark-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-dark-border/50 flex justify-between items-center bg-[#18212F]">
          <h2 className="text-lg font-medium text-white">Transaction Stream</h2>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 border-b border-dark-border bg-dark-card sticky top-0 z-10">
              <tr>
                <th className="py-4 px-6 font-normal">ID</th>
                <th className="py-4 px-6 font-normal">Customer</th>
                <th className="py-4 px-6 font-normal">Time</th>
                <th className="py-4 px-6 font-normal">Method</th>
                <th className="py-4 px-6 font-normal">Amount</th>
                <th className="py-4 px-6 font-normal">Location</th>
                <th className="py-4 px-6 font-normal">Score</th>
                <th className="py-4 px-6 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((txn, idx) => (
                <tr key={idx} className="border-b border-dark-border/30 hover:bg-[#121620] transition-colors group cursor-pointer">
                  <td className="py-4 px-6 font-mono text-gray-400">{txn.id}</td>
                  <td className="py-4 px-6 font-medium text-gray-200">{txn.customer}</td>
                  <td className="py-4 px-6 text-gray-400">{txn.time}</td>
                  <td className="py-4 px-6 text-gray-400">{txn.method}</td>
                  <td className="py-4 px-6 font-medium text-gray-200">{txn.amount}</td>
                  <td className="py-4 px-6 text-gray-400">{txn.location}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-1.5 bg-[#121620] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getScoreColor(txn.score)}`} style={{ width: `${txn.score}%` }}></div>
                      </div>
                      <span className={clsx("font-medium", `text-${getScoreColor(txn.score).replace('bg-', '')}`)}>
                        {txn.score}
                      </span>
                    </div>
                  </td>
                  <td className={`py-4 px-6 font-medium ${getStatusColor(txn.status)}`}>
                    {txn.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters Sidebar */}
      <div className="w-[280px] flex-shrink-0 bg-dark-card border border-dark-border rounded-xl p-5 overflow-y-auto hidden tracking-wide lg:block">
        <h3 className="text-lg font-medium text-white mb-6">Quick Filters</h3>
        
        <div className="space-y-8">
          {/* Risk Level */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Risk Level</h4>
            <div className="space-y-3">
              {['Critical', 'High', 'Medium', 'Low'].map((level, i) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <div className={clsx(
                    "w-4 h-4 rounded flex items-center justify-center transition-colors",
                    i === 0 ? "border-transparent bg-brand-blue" : "border border-dark-border bg-[#121620] group-hover:border-brand-blue"
                  )}>
                    {i === 0 && (
                       <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                       </svg>
                    )}
                  </div>
                  <span className={clsx("text-sm", i===0 ? "text-gray-200" : "text-gray-400")}>{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Payment Method</h4>
            <div className="space-y-3">
              <select className="w-full bg-[#121620] border border-dark-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-brand-blue/50 appearance-none">
                <option>Card</option>
              </select>
              <select className="w-full bg-[#121620] border border-dark-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-brand-blue/50 appearance-none">
                <option>Bank Transfer</option>
              </select>
              <select className="w-full bg-[#121620] border border-dark-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-brand-blue/50 appearance-none">
                <option>Crypto</option>
              </select>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Amount Range</h4>
            <div className="flex gap-3">
              <input type="text" placeholder="Min" className="w-1/2 bg-[#121620] border border-dark-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-blue/50" />
              <input type="text" placeholder="Max" className="w-1/2 bg-[#121620] border border-dark-border rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-blue/50" />
            </div>
          </div>

          {/* Velocity */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-4">Velocity Check</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Transactions &gt; 5/min</span>
              <div className="w-10 h-6 bg-brand-blue rounded-full relative cursor-pointer border border-brand-blue transition-colors">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1/2 -translate-y-1/2 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
