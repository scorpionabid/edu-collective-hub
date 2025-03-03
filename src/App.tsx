import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import './index.css';

// Import initialization first
import { initializeApplication } from './lib/init';

// Import error boundary
import { GlobalErrorBoundary } from './components/monitoring/ErrorBoundary';

// Initialize the application
initializeApplication();

const App = () => {
  return (
    <GlobalErrorBoundary>
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/superadmin/tables" element={<SuperAdminTables />} />
        <Route path="/superadmin/monitoring" element={<React.lazy(() => import('./pages/superadmin/Monitoring'))} />} />
        {/* Add other routes as needed */}
      </Routes>
      <Toaster />
    </GlobalErrorBoundary>
  );
};

export default App;
