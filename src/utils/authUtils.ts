
import { toast } from 'sonner';
import { UserProfile } from '@/lib/api/auth';
import { roleDashboardPaths } from '@/types/auth';
import { NavigateFunction } from 'react-router-dom';

export const redirectBasedOnRole = (role: string, navigate: NavigateFunction) => {
  const redirectPath = roleDashboardPaths[role] || '/login';
  navigate(redirectPath);
};

export const handleAuthError = (error: any, message: string = "Authentication failed") => {
  console.error(`Auth error: ${message}`, error);
  toast.error(message);
  return error;
};

export const getUserDisplayName = (profile: UserProfile | null) => {
  if (!profile) return '';
  return `${profile.firstName} ${profile.lastName}`;
};

export const shouldRedirectToDashboard = (
  profile: UserProfile | null, 
  currentPath: string
) => {
  if (!profile) return false;
  
  const isOnLoginPage = currentPath === '/login' || currentPath === '/';
  const shouldBeOnDashboard = roleDashboardPaths[profile.role];
  const isAlreadyOnRightDashboard = currentPath.startsWith(`/${profile.role}`);
  
  return (
    (isOnLoginPage && shouldBeOnDashboard) || 
    (!isOnLoginPage && 
     !isAlreadyOnRightDashboard && 
     shouldBeOnDashboard && 
     !currentPath.includes('settings') && 
     !currentPath.includes('reset-password'))
  );
};
