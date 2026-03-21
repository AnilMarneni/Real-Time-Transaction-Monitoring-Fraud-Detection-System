import { Search, Bell, LogOut, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const routeNames: Record<string, string> = {
  '/': 'DASHBOARD',
  '/transactions': 'LIVE TRANSACTIONS',
  '/alerts': 'FRAUD ALERTS',
  '/analytics': 'ANALYTICS',
  '/rules': 'RULES ENGINE',
  '/settings': 'SETTINGS',
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const title = routeNames[location.pathname] || 'DASHBOARD';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-[#121620] sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-white tracking-wide uppercase">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50 w-64 transition-colors"
          />
        </div>

        <button className="w-10 h-10 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-blue/10 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-brand-blue outline outline-2 outline-dark-card" />
        </button>

        <div className="flex items-center gap-3 px-3 py-2 bg-dark-card border border-dark-border rounded-lg">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{user?.username || 'User'}</span>
        </div>

        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-blue/10 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
