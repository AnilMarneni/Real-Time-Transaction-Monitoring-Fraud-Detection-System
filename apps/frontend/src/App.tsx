import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './pages/Dashboard';
import LiveTransactions from './pages/LiveTransactions';
import FraudAlerts from './pages/FraudAlerts';
import Analytics from './pages/Analytics';
import RulesEngine from './pages/RulesEngine';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<LiveTransactions />} />
          <Route path="alerts" element={<FraudAlerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route 
            path="rules" 
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'ANALYST']}>
                <RulesEngine />
              </ProtectedRoute>
            } 
          />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
