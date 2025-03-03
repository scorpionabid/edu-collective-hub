
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import './index.css';
import { BrowserWarning } from '@/components/browser/BrowserWarning';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Import pages
import Home from './pages/Index';
import Login from './pages/Login';
import SignUp from './pages/Login'; // Placeholder, replace with actual SignUp page
import SuperAdminTables from './pages/superadmin/Tables';

// Lazy load pages
const Monitoring = lazy(() => import('./pages/superadmin/Monitoring'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/Dashboard'));
const RegionAdminDashboard = lazy(() => import('./pages/regionadmin/Dashboard'));
const SectorAdminDashboard = lazy(() => import('./pages/sectoradmin/Dashboard'));
const SchoolAdminDashboard = lazy(() => import('./pages/schooladmin/Dashboard'));

const App = () => {
  return (
    <>
      <BrowserWarning />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected SuperAdmin routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route 
            path="/superadmin/dashboard" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <SuperAdminDashboard />
              </Suspense>
            } 
          />
          <Route path="/superadmin/tables" element={<SuperAdminTables />} />
          <Route 
            path="/superadmin/monitoring" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Monitoring />
              </Suspense>
            } 
          />
          {/* Add other superadmin routes as needed */}
        </Route>
        
        {/* Protected RegionAdmin routes */}
        <Route element={<ProtectedRoute allowedRoles={['regionadmin']} />}>
          <Route 
            path="/regionadmin/dashboard" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RegionAdminDashboard />
              </Suspense>
            } 
          />
          {/* Add other regionadmin routes as needed */}
        </Route>
        
        {/* Protected SectorAdmin routes */}
        <Route element={<ProtectedRoute allowedRoles={['sectoradmin']} />}>
          <Route 
            path="/sectoradmin/dashboard" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <SectorAdminDashboard />
              </Suspense>
            } 
          />
          {/* Add other sectoradmin routes as needed */}
        </Route>
        
        {/* Protected SchoolAdmin routes */}
        <Route element={<ProtectedRoute allowedRoles={['schooladmin']} />}>
          <Route 
            path="/schooladmin/dashboard" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <SchoolAdminDashboard />
              </Suspense>
            } 
          />
          {/* Add other schooladmin routes as needed */}
        </Route>
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
