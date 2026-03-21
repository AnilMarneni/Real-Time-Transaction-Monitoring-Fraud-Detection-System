import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  AlertCircle,
  BarChart2,
  Settings2,
  Settings,
  Shield
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
    <aside className="w-[260px] h-screen bg-dark-bg border-r border-dark-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-dark-border/50">
        <Shield className="w-8 h-8 text-brand-blue" strokeWidth={2} />
        <span className="text-xl font-bold text-white tracking-wide">GuardPoint</span>
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
    </aside>
  );
}
