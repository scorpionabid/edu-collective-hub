
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Users from "@/pages/Users";
import Regions from "@/pages/Regions";
import Sectors from "@/pages/Sectors";
import Schools from "@/pages/Schools";
import Reports from "@/pages/Reports";
import Tables from "@/pages/Tables";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import SectorDashboard from "@/pages/SectorDashboard";
import SectorTables from "@/pages/SectorTables";
import SectorUsers from "@/pages/SectorUsers";
import SectorCategories from "@/pages/SectorCategories";
import SectorForms from "@/pages/SectorForms";
import SchoolDashboard from "@/pages/SchoolDashboard";
import SchoolProfile from "@/pages/SchoolProfile";
import SchoolImport from "@/pages/SchoolImport";
import { useAuth } from "@/contexts/AuthContext";

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode,
  allowedRoles?: string[]
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user's role is not in the allowed roles, redirect
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on role
    switch (user.role) {
      case 'superadmin':
        return <Navigate to="/dashboard" replace />;
      case 'regionadmin':
        return <Navigate to="/region-dashboard" replace />;
      case 'sectoradmin':
        return <Navigate to="/sector-dashboard" replace />;
      case 'schooladmin':
        return <Navigate to="/school-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return <>{children}</>;
};

function App() {
  const { user } = useAuth();
  
  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              // Redirect to the appropriate dashboard based on user role
              (() => {
                switch (user.role) {
                  case 'superadmin':
                    return <Navigate to="/dashboard" replace />;
                  case 'regionadmin':
                    return <Navigate to="/region-dashboard" replace />;
                  case 'sectoradmin':
                    return <Navigate to="/sector-dashboard" replace />;
                  case 'schooladmin':
                    return <Navigate to="/school-dashboard" replace />;
                  default:
                    return <Navigate to="/login" replace />;
                }
              })()
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/login" element={<Login />} />
        
        {/* SuperAdmin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regions"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Regions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sectors"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
              <Sectors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schools"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
              <Schools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'regionadmin', 'sectoradmin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
              <Tables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        
        {/* Sector admin routes */}
        <Route
          path="/sector-dashboard"
          element={
            <ProtectedRoute allowedRoles={['sectoradmin']}>
              <SectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sector-tables"
          element={
            <ProtectedRoute allowedRoles={['sectoradmin']}>
              <SectorTables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sector-users"
          element={
            <ProtectedRoute allowedRoles={['sectoradmin']}>
              <SectorUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sector-categories"
          element={
            <ProtectedRoute allowedRoles={['sectoradmin']}>
              <SectorCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sector-forms"
          element={
            <ProtectedRoute allowedRoles={['sectoradmin']}>
              <SectorForms />
            </ProtectedRoute>
          }
        />
        
        {/* School admin routes */}
        <Route
          path="/school-dashboard"
          element={
            <ProtectedRoute allowedRoles={['schooladmin']}>
              <SchoolDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school-profile"
          element={
            <ProtectedRoute allowedRoles={['schooladmin']}>
              <SchoolProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school-import"
          element={
            <ProtectedRoute allowedRoles={['schooladmin']}>
              <SchoolImport />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
