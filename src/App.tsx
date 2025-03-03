
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import './index.css';

// Import initialization first
import { initializeApplication } from './lib/init';

// Import error boundary
import { GlobalErrorBoundary } from './components/monitoring/ErrorBoundary';

// Import pages
import Home from './pages/Index';
import Login from './pages/Login';
import SignUp from './pages/Login'; // Placeholder, replace with actual SignUp page
import SuperAdminTables from './pages/superadmin/Tables';

// Lazy load Monitoring page
const Monitoring = lazy(() => import('./pages/superadmin/Monitoring'));

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
        <Route 
          path="/superadmin/monitoring" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Monitoring />
            </Suspense>
          } 
        />
        {/* Add other routes as needed */}
      </Routes>
      <Toaster />
    </GlobalErrorBoundary>
  );
};

export default App;
