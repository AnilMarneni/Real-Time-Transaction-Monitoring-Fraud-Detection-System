import { useState } from 'react';
import { User, Bell, Shield, Sliders, Save } from 'lucide-react';
import { clsx } from 'clsx';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-white">System Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your account preferences and global system configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-[#1f2937] text-white shadow-[inset_2px_0_0_0_#3b82f6]" 
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#1a2230]"
                  )}
                >
                  <Icon size={18} className={isActive ? "text-brand-blue" : "text-gray-500"} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-dark-card border border-dark-border rounded-xl p-6 min-h-[500px]">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-medium text-gray-200 border-b border-dark-border pb-4">Profile Information</h3>
              
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-full bg-dark-bg border-4 border-dark-border overflow-hidden shadow-lg relative group">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=1F2937" alt="Profile" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                      <span className="text-xs text-white font-medium">Change</span>
                   </div>
                 </div>
                 <div>
                   <h4 className="text-gray-200 font-medium">Avatar Picture</h4>
                   <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size of 800K</p>
                   <button className="mt-3 text-xs bg-[#1f2937] hover:bg-[#374151] border border-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors">
                     Upload New
                   </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Full Name</label>
                  <input type="text" defaultValue="Alex R." className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email Address</label>
                  <input type="email" defaultValue="alex.r@sec-ops.local" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Role</label>
                  <input type="text" defaultValue="Senior Security Analyst" disabled className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Department</label>
                  <input type="text" defaultValue="Fraud Prevention Team" disabled className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-6 border-t border-dark-border flex justify-end">
                 <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-brand-blue/20">
                    <Save size={18} /> Save Changes
                 </button>
              </div>
            </div>
          )}
          
          {activeTab !== 'profile' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-in fade-in duration-300">
               <Sliders size={48} className="text-gray-600 mb-4 opacity-50" />
               <p className="text-lg font-medium text-gray-400">This section is under construction.</p>
               <p className="text-sm text-gray-500 mt-2">Additional settings will be available shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
