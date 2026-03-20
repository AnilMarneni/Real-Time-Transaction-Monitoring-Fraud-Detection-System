import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
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
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<LiveTransactions />} />
          <Route path="/alerts" element={<FraudAlerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/rules" element={<RulesEngine />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
