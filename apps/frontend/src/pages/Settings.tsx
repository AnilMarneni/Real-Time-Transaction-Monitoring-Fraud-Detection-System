import { useState } from 'react';
import { User, Bell, Shield, Sliders, Save, Settings as SettingsIcon, EyeOff, Key, Smartphone, Mail, Globe, Database, Server, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Upload, Trash2, Users, Wifi, FileText, Activity, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../stores/authStore';

interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: {
    email: boolean;
    browser: boolean;
    fraudAlerts: boolean;
    systemUpdates: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    apiAlerts: boolean;
  };
  dashboard: {
    refreshInterval: number;
    defaultView: 'overview' | 'transactions' | 'alerts';
    showCharts: boolean;
    compactMode: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analyticsTracking: boolean;
    marketingEmails: boolean;
  };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    notifications: {
      email: true,
      browser: true,
      fraudAlerts: true,
      systemUpdates: false,
      weeklyReports: true,
      monthlyReports: true,
      apiAlerts: false,
    },
    dashboard: {
      refreshInterval: 30,
      defaultView: 'overview',
      showCharts: true,
      compactMode: false,
    },
    privacy: {
      dataSharing: false,
      analyticsTracking: true,
      marketingEmails: false,
    },
  });
  
  const { user } = useAuthStore();

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'system', label: 'System Settings', icon: SettingsIcon, adminOnly: true },
  ].filter(tab => !tab.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your account preferences and system configurations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
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
        <div className="flex-1 bg-dark-card border border-dark-border rounded-xl p-6 min-h-[600px]">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-dark-bg border-4 border-dark-border overflow-hidden shadow-lg relative group">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=1F2937" alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                      <span className="text-xs text-white font-medium">Change</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Profile Picture</h4>
                    <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size of 800K</p>
                    <button className="mt-3 text-xs bg-[#1f2937] hover:bg-[#374151] border border-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors">
                      Upload New
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Full Name</label>
                    <input type="text" defaultValue={user?.username || 'Admin User'} className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Email Address</label>
                    <input type="email" defaultValue={user?.email || 'admin@example.com'} className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Phone Number</label>
                    <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Department</label>
                    <select className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue">
                      <option>Fraud Prevention Team</option>
                      <option>Security Operations</option>
                      <option>Risk Management</option>
                      <option>Compliance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Role</label>
                    <input type="text" defaultValue={user?.role || 'ADMIN'} disabled className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Time Zone</label>
                    <select className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue">
                      <option>UTC-5:00 Eastern Time</option>
                      <option>UTC-6:00 Central Time</option>
                      <option>UTC-7:00 Mountain Time</option>
                      <option>UTC-8:00 Pacific Time</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-400">Bio</label>
                  <textarea rows={4} defaultValue="Senior security analyst with expertise in fraud detection and risk management." className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue resize-none" />
                </div>
              </div>

              <div className="pt-6 border-t border-dark-border flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Mail className="text-brand-blue" size={20} />
                        <div>
                          <h4 className="text-white font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-400">Receive updates and alerts via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.notifications.email} onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                      </label>
                    </div>
                    
                    <div className="space-y-3 ml-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Fraud Alerts</p>
                          <p className="text-xs text-gray-500">High-priority fraud detection alerts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.notifications.fraudAlerts} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, fraudAlerts: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Weekly Reports</p>
                          <p className="text-xs text-gray-500">Summary of weekly fraud detection activities</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.notifications.weeklyReports} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, weeklyReports: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Monthly Reports</p>
                          <p className="text-xs text-gray-500">Comprehensive monthly analytics reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.notifications.monthlyReports} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, monthlyReports: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Bell className="text-brand-blue" size={20} />
                        <div>
                          <h4 className="text-white font-medium">Browser Notifications</h4>
                          <p className="text-sm text-gray-400">Real-time alerts in your browser</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={preferences.notifications.browser} onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, browser: e.target.checked }
                        }))} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="text-brand-blue" size={20} />
                        <div>
                          <h4 className="text-white font-medium">Mobile Push Notifications</h4>
                          <p className="text-sm text-gray-400">Alerts on your mobile device</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-dark-border flex justify-end">
                <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security & Authentication */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Security & Authentication</h3>
                
                <div className="space-y-6">
                  {/* Password Section */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center gap-3 mb-6">
                      <Key className="text-brand-blue" size={20} />
                      <div>
                        <h4 className="text-white font-medium">Password</h4>
                        <p className="text-sm text-gray-400">Change your account password</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Current Password</label>
                        <div className="relative mt-2">
                          <input type="password" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-200 focus:outline-none focus:border-brand-blue" />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                            <EyeOff size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">New Password</label>
                        <div className="relative mt-2">
                          <input type="password" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-200 focus:outline-none focus:border-brand-blue" />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                            <EyeOff size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
                        <div className="relative mt-2">
                          <input type="password" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-200 focus:outline-none focus:border-brand-blue" />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                            <EyeOff size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <button className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="text-brand-blue" size={20} />
                        <div>
                          <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="text-red-500" size={16} />
                        <span className="text-sm text-red-400">Disabled</span>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-yellow-500 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm text-yellow-400 font-medium">Recommendation</p>
                          <p className="text-xs text-gray-400 mt-1">Enable 2FA to significantly improve your account security</p>
                        </div>
                      </div>
                    </div>
                    
                    <button className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Enable Two-Factor Authentication
                    </button>
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center gap-3 mb-6">
                      <Wifi className="text-brand-blue" size={20} />
                      <div>
                        <h4 className="text-white font-medium">Active Sessions</h4>
                        <p className="text-sm text-gray-400">Manage your active login sessions</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#0a0d14] rounded-lg border border-dark-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-blue/20 rounded-full flex items-center justify-center">
                            <Globe className="text-brand-blue" size={16} />
                          </div>
                          <div>
                            <p className="text-sm text-white">Chrome on Windows</p>
                            <p className="text-xs text-gray-400">192.168.1.1 • Current session</p>
                          </div>
                        </div>
                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">Active</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[#0a0d14] rounded-lg border border-dark-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-600/20 rounded-full flex items-center justify-center">
                            <Smartphone className="text-gray-400" size={16} />
                          </div>
                          <div>
                            <p className="text-sm text-white">Safari on iPhone</p>
                            <p className="text-xs text-gray-400">192.168.1.2 • 2 hours ago</p>
                          </div>
                        </div>
                        <button className="text-xs text-red-400 hover:text-red-300">Sign Out</button>
                      </div>
                    </div>
                    
                    <button className="mt-4 text-sm text-gray-400 hover:text-gray-300">
                      Sign Out All Other Sessions
                    </button>
                  </div>

                  {/* Login History */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center gap-3 mb-6">
                      <Activity className="text-brand-blue" size={20} />
                      <div>
                        <h4 className="text-white font-medium">Login History</h4>
                        <p className="text-sm text-gray-400">Recent login attempts and activity</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-green-500" size={14} />
                          <span className="text-gray-300">Successful login</span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400">Chrome on Windows</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <XCircle className="text-red-500" size={14} />
                          <span className="text-gray-300">Failed login attempt</span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400">Unknown device</p>
                          <p className="text-xs text-gray-500">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <button className="mt-4 text-sm text-brand-blue hover:text-brand-blue/80">
                      View Full History
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-dark-border flex justify-end">
                <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Preferences</h3>
                
                <div className="space-y-6">
                  {/* Appearance */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <h4 className="text-white font-medium mb-4">Appearance</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Theme</label>
                        <div className="flex gap-3 mt-2">
                          <button className="flex-1 py-2 px-4 bg-brand-blue text-white rounded-lg text-sm font-medium">Dark</button>
                          <button className="flex-1 py-2 px-4 bg-[#0a0d14] border border-dark-border text-gray-400 rounded-lg text-sm">Light</button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Compact Mode</p>
                          <p className="text-xs text-gray-500">Reduce spacing and UI elements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.dashboard.compactMode} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            dashboard: { ...prev.dashboard, compactMode: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <h4 className="text-white font-medium mb-4">Dashboard</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Default View</label>
                        <select value={preferences.dashboard.defaultView} onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          dashboard: { ...prev.dashboard, defaultView: e.target.value as 'overview' | 'transactions' | 'alerts' }
                        }))} className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2">
                          <option value="overview">Overview</option>
                          <option value="transactions">Transactions</option>
                          <option value="alerts">Alerts</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Auto Refresh Interval</label>
                        <div className="flex items-center gap-3 mt-2">
                          <input 
                            type="range" 
                            min="5" 
                            max="300" 
                            value={preferences.dashboard.refreshInterval}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              dashboard: { ...prev.dashboard, refreshInterval: parseInt(e.target.value) }
                            }))}
                            className="flex-1" 
                          />
                          <span className="text-sm text-gray-300 w-20 text-right">{preferences.dashboard.refreshInterval}s</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Show Charts</p>
                          <p className="text-xs text-gray-500">Display data visualizations</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.dashboard.showCharts} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            dashboard: { ...prev.dashboard, showCharts: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <h4 className="text-white font-medium mb-4">Privacy</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Data Sharing</p>
                          <p className="text-xs text-gray-500">Share anonymized data for improvements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.privacy.dataSharing} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, dataSharing: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Analytics Tracking</p>
                          <p className="text-xs text-gray-500">Help us improve with usage analytics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.privacy.analyticsTracking} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, analyticsTracking: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Marketing Emails</p>
                          <p className="text-xs text-gray-500">Receive product updates and news</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={preferences.privacy.marketingEmails} onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, marketingEmails: e.target.checked }
                          }))} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <h4 className="text-white font-medium mb-4">Data Management</h4>
                    
                    <div className="space-y-3">
                      <button className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                        <Download size={16} />
                        Export My Data
                      </button>
                      
                      <button className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                        <Upload size={16} />
                        Import Settings
                      </button>
                      
                      <button className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={16} />
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-dark-border flex justify-end">
                <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* System Settings (Admin Only) */}
          {activeTab === 'system' && user?.role === 'ADMIN' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">System Settings</h3>
                
                <div className="space-y-6">
                  {/* General Configuration */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <h4 className="text-white font-medium mb-4">General Configuration</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">System Name</label>
                        <input type="text" defaultValue="Fraud Detection System" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Environment</label>
                        <select className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2">
                          <option>Production</option>
                          <option>Staging</option>
                          <option>Development</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Max Transactions/Minute</label>
                        <input type="number" defaultValue="1000" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Fraud Detection Threshold</label>
                        <input type="number" step="0.1" min="0" max="1" defaultValue="0.5" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <h4 className="text-white font-medium mb-4">Security Settings</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Session Timeout (hours)</label>
                        <input type="number" defaultValue="24" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Max Login Attempts</label>
                        <input type="number" defaultValue="5" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Password Min Length</label>
                        <input type="number" defaultValue="8" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Require 2FA</label>
                        <select className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2">
                          <option>Optional</option>
                          <option>Required for Admins</option>
                          <option>Required for All</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Database Configuration */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="text-brand-blue" size={20} />
                      <h4 className="text-white font-medium">Database Configuration</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Connection Pool Size</label>
                        <input type="number" defaultValue="10" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Query Timeout (seconds)</label>
                        <input type="number" defaultValue="30" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Backup Retention (days)</label>
                        <input type="number" defaultValue="30" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Auto Backup</label>
                        <select className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2">
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                          <option>Disabled</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Database size={16} /> Test Connection
                      </button>
                      
                      <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Download size={16} /> Backup Now
                      </button>
                    </div>
                  </div>

                  {/* Server Configuration */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Server className="text-brand-blue" size={20} />
                      <h4 className="text-white font-medium">Server Configuration</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">API Rate Limit (requests/minute)</label>
                        <input type="number" defaultValue="100" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">WebSocket Timeout (seconds)</label>
                        <input type="number" defaultValue="300" className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Log Level</label>
                        <select className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2">
                          <option>Error</option>
                          <option>Warning</option>
                          <option>Info</option>
                          <option>Debug</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Maintenance Mode</label>
                        <select className="w-full bg-[#0a0d14] border border-dark-border rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-blue mt-2">
                          <option>Disabled</option>
                          <option>Enabled</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <RefreshCw size={16} /> Restart Services
                      </button>
                      
                      <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <FileText size={16} /> View Logs
                      </button>
                    </div>
                  </div>

                  {/* User Management */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="text-brand-blue" size={20} />
                      <h4 className="text-white font-medium">User Management</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-[#0a0d14] rounded-lg border border-dark-border">
                        <div>
                          <p className="text-sm text-white">Total Users</p>
                          <p className="text-xs text-gray-400">Active and inactive accounts</p>
                        </div>
                        <span className="text-2xl font-bold text-brand-blue">127</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[#0a0d14] rounded-lg border border-dark-border">
                        <div>
                          <p className="text-sm text-white">Active Sessions</p>
                          <p className="text-xs text-gray-400">Currently logged in users</p>
                        </div>
                        <span className="text-2xl font-bold text-green-400">43</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          <Users size={16} /> Manage Users
                        </button>
                        
                        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          <UserPlus size={16} /> Invite User
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-[#1a2230] rounded-lg p-6 border border-dark-border">
                    <h4 className="text-white font-medium mb-4">System Status</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-[#0a0d14] rounded-lg border border-dark-border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-400">API Server</span>
                        </div>
                        <p className="text-xs text-gray-400">Uptime: 99.9%</p>
                        <p className="text-xs text-gray-400">Response: 45ms</p>
                      </div>
                      
                      <div className="p-3 bg-[#0a0d14] rounded-lg border border-dark-border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-400">Database</span>
                        </div>
                        <p className="text-xs text-gray-400">Connections: 8/10</p>
                        <p className="text-xs text-gray-400">Size: 2.4GB</p>
                      </div>
                      
                      <div className="p-3 bg-[#0a0d14] rounded-lg border border-dark-border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-yellow-400">Kafka</span>
                        </div>
                        <p className="text-xs text-gray-400">Partitions: 3</p>
                        <p className="text-xs text-gray-400">Lag: 1.2s</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-dark-border flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleString()}
                </div>
                <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
