import { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { roleDashboardPaths } from "@/types/auth";

// Load index page eagerly since it's the first page
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Lazy load all other pages for better performance
// SuperAdmin pages
const SuperAdminDashboard = lazy(() => import("@/pages/superadmin/Dashboard"));
const Users = lazy(() => import("@/pages/superadmin/Users"));
const Regions = lazy(() => import("@/pages/superadmin/Regions"));
const Sectors = lazy(() => import("@/pages/superadmin/Sectors"));
const Schools = lazy(() => import("@/pages/superadmin/Schools"));
const SuperAdminReports = lazy(() => import("@/pages/superadmin/Reports"));
const Tables = lazy(() => import("@/pages/superadmin/Tables"));
const Settings = lazy(() => import("@/pages/Settings"));

// RegionAdmin pages
const RegionDashboard = lazy(() => import("@/pages/regionadmin/Dashboard"));
const RegionSectors = lazy(() => import("@/pages/regionadmin/Sectors"));
const RegionSchools = lazy(() => import("@/pages/regionadmin/Schools"));
const RegionTables = lazy(() => import("@/pages/regionadmin/Tables"));
const RegionReports = lazy(() => import("@/pages/regionadmin/Reports"));

// SectorAdmin pages
const SectorDashboard = lazy(() => import("@/pages/sectoradmin/Dashboard"));
const SectorReports = lazy(() => import("@/pages/sectoradmin/Reports"));
const SectorTables = lazy(() => import("@/pages/sectoradmin/Tables"));
const SectorUsers = lazy(() => import("@/pages/sectoradmin/Users"));
const SectorCategories = lazy(() => import("@/pages/sectoradmin/Categories"));
const SectorForms = lazy(() => import("@/pages/sectoradmin/Forms"));

// SchoolAdmin pages
const SchoolDashboard = lazy(() => import("@/pages/schooladmin/Dashboard"));
const SchoolProfile = lazy(() => import("@/pages/schooladmin/Profile"));
const SchoolImport = lazy(() => import("@/pages/schooladmin/Import"));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="space-y-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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
    return <LoadingFallback />;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user's role is not in the allowed roles, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    // Get the dashboard path for the user's role
    const redirectPath = roleDashboardPaths[profile.role] || "/login";
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
              <Navigate to={roleDashboardPaths[profile.role] || "/login"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/login" element={<Login />} />
        
        {/* Wrap all the protected routes with PermissionProvider and Suspense */}
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
                <Suspense fallback={<LoadingFallback />}>
                  <SuperAdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/users"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <Users />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/regions"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <Regions />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/sectors"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <Sectors />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/schools"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'regionadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <Schools />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/reports"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SuperAdminReports />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/tables"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <Tables />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Region admin routes with new paths */}
          <Route
            path="/regionadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <RegionDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/sectors"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <RegionSectors />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/schools"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <RegionSchools />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/tables"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <RegionTables />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/regionadmin/reports"
            element={
              <ProtectedRoute allowedRoles={['regionadmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <RegionReports />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Sector admin routes with new paths */}
          <Route
            path="/sectoradmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SectorDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/tables"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SectorTables />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/users"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SectorUsers />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/categories"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SectorCategories />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/forms"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SectorForms />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sectoradmin/reports"
            element={
              <ProtectedRoute allowedRoles={['sectoradmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SectorReports />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* School admin routes with new paths */}
          <Route
            path="/schooladmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['schooladmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SchoolDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schooladmin/profile"
            element={
              <ProtectedRoute allowedRoles={['schooladmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SchoolProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schooladmin/import"
            element={
              <ProtectedRoute allowedRoles={['schooladmin']}>
                <Suspense fallback={<LoadingFallback />}>
                  <SchoolImport />
                </Suspense>
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
