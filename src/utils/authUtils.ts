
import { toast } from 'sonner';
import { UserProfile } from '@/lib/api/auth';
import { roleDashboardPaths } from '@/types/auth';
import { NavigateFunction } from 'react-router-dom';

/**
 * Redirects user to the appropriate dashboard based on their role
 */
export const redirectBasedOnRole = (role: string, navigate: NavigateFunction) => {
  const redirectPath = roleDashboardPaths[role] || '/login';
  navigate(redirectPath);
};

/**
 * Handles authentication errors with appropriate error messages
 */
export const handleAuthError = (error: any, message: string = "Authentication failed") => {
  console.error(`Auth error: ${message}`, error);
  toast.error(message);
  return error;
};

/**
 * Gets the display name for a user profile
 */
export const getUserDisplayName = (profile: UserProfile | null) => {
  if (!profile) return '';
  return `${profile.firstName} ${profile.lastName}`;
};

/**
 * Determines if the user should be redirected to their dashboard
 * based on their current location and role
 */
export const shouldRedirectToDashboard = (
  profile: UserProfile | null, 
  currentPath: string
) => {
  if (!profile) return false;
  
  const isOnLoginPage = currentPath === '/login' || currentPath === '/';
  const userDashboardPath = roleDashboardPaths[profile.role];
  const isAlreadyOnRightDashboard = userDashboardPath && currentPath.startsWith(userDashboardPath);
  
  // Redirect if user is on login page but should be on dashboard
  // OR if user is on wrong dashboard (not matching their role)
  return (
    (isOnLoginPage && userDashboardPath) || 
    (!isOnLoginPage && 
     !isAlreadyOnRightDashboard && 
     userDashboardPath && 
     !currentPath.includes('settings') && 
     !currentPath.includes('reset-password'))
  );
};

/**
 * Checks if user has permission to access a specific route based on role
 */
export const hasPermission = (userRole: string | undefined, allowedRoles: string[]): boolean => {
  if (!userRole) return false;
  if (allowedRoles.length === 0) return true; // No role restrictions
  return allowedRoles.includes(userRole);
};
