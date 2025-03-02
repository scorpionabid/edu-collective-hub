
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/contexts/AuthContext";

// SuperAdmin pages
import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import Users from "@/pages/Users";
import Regions from "@/pages/Regions";
import Sectors from "@/pages/Sectors";
import Schools from "@/pages/Schools";
import Reports from "@/pages/Reports";
import Tables from "@/pages/Tables";
import Settings from "@/pages/Settings";

// RegionAdmin pages
import RegionDashboard from "@/pages/regionadmin/Dashboard";
import RegionSectors from "@/pages/regionadmin/Sectors";
import RegionSchools from "@/pages/regionadmin/Schools";

// SectorAdmin pages
import SectorDashboard from "@/pages/sectoradmin/Dashboard";
import SectorTables from "@/pages/SectorTables";
import SectorUsers from "@/pages/SectorUsers";
import SectorCategories from "@/pages/SectorCategories";
import SectorForms from "@/pages/SectorForms";

// SchoolAdmin pages
import SchoolDashboard from "@/pages/schooladmin/Dashboard";
import SchoolProfile from "@/pages/SchoolProfile";
import SchoolImport from "@/pages/SchoolImport";

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
              <SuperAdminDashboard />
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
        
        {/* Region admin routes */}
        <Route
          path="/region-dashboard"
          element={
            <ProtectedRoute allowedRoles={['regionadmin']}>
              <RegionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/region-sectors"
          element={
            <ProtectedRoute allowedRoles={['regionadmin']}>
              <RegionSectors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/region-schools"
          element={
            <ProtectedRoute allowedRoles={['regionadmin']}>
              <RegionSchools />
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
