import { ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useState } from 'react';

export function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-end px-8 bg-dark-bg sticky top-0 z-10 border-b border-dark-border/0">
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:bg-dark-card/50 p-2 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-dark-card border border-dark-border overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=1F2937"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg py-1">
            <div className="px-4 py-2 border-b border-dark-border">
              <p className="text-sm font-medium text-white">{user?.username || 'Joran Smith'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'joran@guardpoint.com'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-dark-bg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
