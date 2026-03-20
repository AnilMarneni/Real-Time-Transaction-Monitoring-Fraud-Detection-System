import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  AlertCircle,
  BarChart2,
  Settings2,
  Settings,
  Waves
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'DASHBOARD', path: '/', icon: LayoutDashboard },
  { name: 'LIVE TRANSACTIONS', path: '/transactions', icon: Activity },
  { name: 'FRAUD ALERTS', path: '/alerts', icon: AlertCircle },
  { name: 'ANALYTICS', path: '/analytics', icon: BarChart2 },
  { name: 'RULES ENGINE', path: '/rules', icon: Settings2 },
  { name: 'SETTINGS', path: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-[260px] h-screen bg-[#121620] border-r border-dark-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-dark-border/50">
        <Waves className="w-8 h-8 text-brand-blue" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-card/50'
                )
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-dark-border mt-auto">
        <Link to="/settings" className="flex items-center gap-3 w-full hover:bg-[#1a2230] p-2 -ml-2 rounded-xl transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-dark-card border border-dark-border overflow-hidden group-hover:border-brand-blue transition-colors">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=1F2937"
              alt="Alex R."
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 overflow-hidden">
             <p className="text-sm font-medium text-gray-200 truncate">Alex R.</p>
             <p className="text-xs text-gray-500 truncate">Senior Analyst</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
