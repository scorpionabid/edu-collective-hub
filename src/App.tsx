
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/hooks/useAuth";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { roleDashboardPaths as dashboardPaths } from "@/types/auth";

// SuperAdmin pages
import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import Users from "@/pages/superadmin/Users";
import Regions from "@/pages/superadmin/Regions";
import Sectors from "@/pages/superadmin/Sectors";
import Schools from "@/pages/superadmin/Schools";
import SuperAdminReports from "@/pages/superadmin/Reports";
import Tables from "@/pages/superadmin/Tables";
import Settings from "@/pages/Settings";

// RegionAdmin pages
import RegionDashboard from "@/pages/regionadmin/Dashboard";
import RegionSectors from "@/pages/regionadmin/Sectors";
import RegionSchools from "@/pages/regionadmin/Schools";
import RegionTables from "@/pages/regionadmin/Tables";
import RegionReports from "@/pages/regionadmin/Reports";

// SectorAdmin pages
import SectorDashboard from "@/pages/sectoradmin/Dashboard";
import SectorReports from "@/pages/sectoradmin/Reports";
import SectorTables from "@/pages/sectoradmin/Tables";
import SectorUsers from "@/pages/sectoradmin/Users";
import SectorCategories from "@/pages/sectoradmin/Categories";
import SectorForms from "@/pages/sectoradmin/Forms";

// SchoolAdmin pages
import SchoolDashboard from "@/pages/schooladmin/Dashboard";
import SchoolProfile from "@/pages/schooladmin/Profile";
import SchoolImport from "@/pages/schooladmin/Import";

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode,
  allowedRoles?: string[]
}) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user's role is not in the allowed roles, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    // Get the dashboard path for the user's role
    const redirectPath = dashboardPaths[profile.role] || "/login";
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { user, profile } = useAuth();
  
  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            user && profile ? (
              // Redirect to the appropriate dashboard based on user role
              <Navigate to={dashboardPaths[profile.role] || "/login"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/login" element={<Login />} />
        
        {/* Wrap all the protected routes with PermissionProvider */}
        <PermissionProvider>
          {/* Legacy path redirects */}
          <Route path="/dashboard" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/users" element={<Navigate to="/superadmin/users" replace />} />
          <Route path="/regions" element={<Navigate to="/superadmin/regions" replace />} />
          <Route path="/sectors" element={<Navigate to="/superadmin/sectors" replace />} />
          <Route path="/schools" element={<Navigate to="/superadmin/schools" replace />} />
          <Route path="/reports" element={<Navigate to="/superadmin/reports" replace />} />
          <Route path="/tables" element={<Navigate to="/superadmin/tables" replace />} />
          
          <Route path="/region-dashboard" element={<Navigate to="/regionadmin/dashboard" replace />} />
          <Route path="/region-sectors" element={<Navigate to="/regionadmin/sectors" replace />} />
          <Route path="/region-schools" element={<Navigate to="/regionadmin/schools" replace />} />
          <Route path="/region-tables" element={<Navigate to="/regionadmin/tables" replace />} />
          <Route path="/region-reports" element={<Navigate to="/regionadmin/reports" replace />} />
          
          <Route path="/sector-dashboard" element={<Navigate to="/sectoradmin/dashboard" replace />} />
          <Route path="/sector-tables" element={<Navigate to="/sectoradmin/tables" replace />} />
          <Route path="/sector-users" element={<Navigate to="/sectoradmin/users" replace />} />
          <Route path="/sector-categories" element={<Navigate to="/sectoradmin/categories" replace />} />
          <Route path="/sector-forms" element={<Navigate to="/sectoradmin/forms" replace />} />
          <Route path="/sector-reports" element={<Navigate to="/sectoradmin/reports" replace />} />
          
          <Route path="/school-dashboard" element={<Navigate to="/schooladmin/dashboard" replace />} />
          <Route path="/school-profile" element={<Navigate to="/schooladmin/profile" replace />} />
          <Route path="/school-import" element={<Navigate to="/schooladmin/import" replace />} />
          
          {/* SuperAdmin Routes with new paths */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/users"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/regions"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Regions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/sectors"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
                <Sectors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/schools"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
                <Schools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/reports"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/tables"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
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
          
          {/* Region admin routes with new paths */}
          <Route
            path="/regionadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <RegionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/sectors"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <RegionSectors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/schools"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <RegionSchools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/tables"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <RegionTables />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/reports"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <RegionReports />
              </ProtectedRoute>
            }
          />
          
          {/* Sector admin routes with new paths */}
          <Route
            path="/sectoradmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <SectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/tables"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <SectorTables />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/users"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <SectorUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/categories"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <SectorCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/forms"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <SectorForms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/reports"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <SectorReports />
              </ProtectedRoute>
            }
          />
          
          {/* School admin routes with new paths */}
          <Route
            path="/schooladmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['schooladmin']}>
                <SchoolDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schooladmin/profile"
            element={
              <ProtectedRoute allowedRoles={['schooladmin']}>
                <SchoolProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schooladmin/import"
            element={
              <ProtectedRoute allowedRoles={['schooladmin']}>
                <SchoolImport />
              </ProtectedRoute>
            }
          />
        </PermissionProvider>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
