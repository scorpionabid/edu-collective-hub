
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Schools from "./pages/Schools";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Tables from "./pages/Tables";
import Regions from "./pages/Regions";
import Sectors from "./pages/Sectors";
import SectorDashboard from "./pages/SectorDashboard";
import SectorTables from "./pages/SectorTables";
import SectorUsers from "./pages/SectorUsers";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />
    <Route
      path="/users"
      element={
        <PrivateRoute>
          <Users />
        </PrivateRoute>
      }
    />
    <Route
      path="/regions"
      element={
        <PrivateRoute>
          <Regions />
        </PrivateRoute>
      }
    />
    <Route
      path="/sectors"
      element={
        <PrivateRoute>
          <Sectors />
        </PrivateRoute>
      }
    />
    <Route
      path="/schools"
      element={
        <PrivateRoute>
          <Schools />
        </PrivateRoute>
      }
    />
    <Route
      path="/reports"
      element={
        <PrivateRoute>
          <Reports />
        </PrivateRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      }
    />
    <Route
      path="/tables"
      element={
        <PrivateRoute>
          <Tables />
        </PrivateRoute>
      }
    />
    {/* Sector Admin Routes */}
    <Route
      path="/sector-dashboard"
      element={
        <PrivateRoute>
          <SectorDashboard />
        </PrivateRoute>
      }
    />
    <Route
      path="/sector-tables"
      element={
        <PrivateRoute>
          <SectorTables />
        </PrivateRoute>
      }
    />
    <Route
      path="/sector-users"
      element={
        <PrivateRoute>
          <SectorUsers />
        </PrivateRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
