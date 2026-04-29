import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SystemProvider } from './context/SystemContext';
import { AppLayout } from './components/Layout';

// Pages
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { PatientManagement } from './pages/PatientManagement';
import { Prediction } from './pages/Prediction';
import { Simulation } from './pages/Simulation';
import { Analytics } from './pages/Analytics';
import { ResourceManagement } from './pages/ResourceManagement';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <SystemProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/patients" element={<AppLayout><PatientManagement /></AppLayout>} />
          <Route path="/prediction" element={<AppLayout><Prediction /></AppLayout>} />
          <Route path="/simulation" element={<AppLayout><Simulation /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/resources" element={<AppLayout><ResourceManagement /></AppLayout>} />
          <Route path="/alerts" element={<AppLayout><Alerts /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SystemProvider>
  );
}
