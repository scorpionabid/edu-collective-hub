
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { roleDashboardPaths } from '@/types/auth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

/**
 * A component that protects routes based on user authentication and role
 * @param allowedRoles - Array of roles allowed to access the route
 * @param redirectPath - Path to redirect to if access is denied
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  redirectPath = '/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    toast.error('You must be logged in to access this page');
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    toast.error('You do not have permission to access this page');
    
    // Redirect to the appropriate dashboard based on user role
    const userDashboard = roleDashboardPaths[user.role];
    return <Navigate to={userDashboard || '/'} replace />;
  }

  // If user is authenticated and authorized, render the protected route
  return <Outlet />;
};
