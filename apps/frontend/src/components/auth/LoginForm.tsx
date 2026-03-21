import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Shield, ChevronDown } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans flex flex-col items-center justify-center relative">
      {/* Fake Header to match exactly the mockups */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-brand-blue" strokeWidth={2} />
          <span className="text-xl font-bold text-white tracking-wide">GuardPoint</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-dark-card border border-dark-border overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=1F2937"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="w-full max-w-[420px] bg-dark-card p-10 rounded-2xl shadow-xl border border-dark-border/50">
        <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#121620] border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors text-sm"
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#121620] border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors text-sm"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Link to="#" className="text-sm text-brand-blue hover:text-blue-400 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-blue hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-blue hover:text-blue-400 transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
      
      {/* Decorative Star */}
      <div className="absolute bottom-10 right-10 opacity-20 text-white">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>
    </div>
  );
}
