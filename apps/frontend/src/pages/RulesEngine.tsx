import { Plus, Search, Filter, MoreVertical, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

const mockRules = [
  { id: 'RULE-001', name: 'Velocity_IP_1hr', desc: 'Trigger if > 5 transactions originate from the same IP within 1 hour.', category: 'Velocity', status: 'Active', severity: 'High' },
  { id: 'RULE-002', name: 'Geo_Anomaly', desc: 'Trigger if IP location distance > 1000 miles in < 5 hours.', category: 'Location', status: 'Active', severity: 'Critical' },
  { id: 'RULE-003', name: 'High_Value_First_Time', desc: 'Transaction volume > $5000 on account age < 30 days.', category: 'Amount', status: 'Active', severity: 'Medium' },
  { id: 'RULE-004', name: 'Merchant_Mismatch', desc: 'Merchant category heavily deviates from historical normal behavior.', category: 'Behavior', status: 'Inactive', severity: 'Low' },
  { id: 'RULE-005', name: 'Card_Testing_Bin', desc: 'Multiple rapid small transactions under $2 from same BIN.', category: 'Velocity', status: 'Active', severity: 'High' },
];

export default function RulesEngine() {
  const [rules, setRules] = useState(mockRules);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => rule.id === id ? { ...rule, status: rule.status === 'Active' ? 'Inactive' : 'Active' } : rule));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Rules Engine Configuration</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and configure fraud detection logic and thresholds.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-lg font-medium transition-colors">
           <Plus size={18} />
           Create New Rule
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between gap-4 bg-[#141a23]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search rules..." 
              className="w-full bg-[#0a0d14] border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-brand-blue transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg border border-dark-border hover:border-gray-600 transition-colors text-sm">
             <Filter size={16} />
             Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-[#0a0d14]">
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Rule Name</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-[#1f2937]/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                       <span className="text-sm font-medium text-gray-200">{rule.name}</span>
                       <span className="text-xs font-mono text-gray-500">{rule.id}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400 max-w-xs truncate" title={rule.desc}>{rule.desc}</td>
                  <td className="p-4 text-sm text-gray-300">{rule.category}</td>
                  <td className="p-4">
                     <span className={clsx(
                       "px-2.5 py-1 text-xs font-medium rounded-full",
                       rule.severity === 'Critical' ? 'bg-red-500/10 text-brand-red border border-red-500/20' :
                       rule.severity === 'High' ? 'bg-orange-500/10 text-brand-orange border border-orange-500/20' :
                       rule.severity === 'Medium' ? 'bg-yellow-500/10 text-brand-yellow border border-yellow-500/20' :
                       'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                     )}>
                       {rule.severity}
                     </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleRule(rule.id)}
                      className={clsx(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                        rule.status === 'Active' ? 'bg-brand-green' : 'bg-gray-600'
                      )}
                    >
                      <span className={clsx(
                        "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                        rule.status === 'Active' ? 'translate-x-5' : 'translate-x-1'
                      )} />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors p-1">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-dark-border bg-[#0a0d14] flex justify-between items-center text-xs text-gray-500">
          <span>Showing 1 to {rules.length} of {rules.length} rules</span>
          <div className="flex gap-1">
             <button className="px-2 py-1 border border-dark-border rounded hover:bg-gray-800 disabled:opacity-50" disabled>Prev</button>
             <button className="px-2 py-1 border border-dark-border rounded hover:bg-gray-800 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
