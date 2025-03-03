
import React from 'react';
import { usePermission } from '@/contexts/PermissionContext';
import { AccessDenied } from './AccessDenied';

interface PermissionGuardProps {
  action: string;
  target?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions
 * 
 * @param action - The permission action to check
 * @param target - Optional target ID to check permission against (e.g., regionId, sectorId)
 * @param children - The content to render if permission is granted
 * @param fallback - Optional content to render if permission is denied
 */
export function PermissionGuard({
  action,
  target,
  children,
  fallback
}: PermissionGuardProps) {
  const { hasPermission } = usePermission();
  
  // Check if the user has permission for the action on the target
  if (hasPermission(action, target)) {
    return <>{children}</>;
  }
  
  // If the user doesn't have permission, render the fallback or default AccessDenied
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default AccessDenied component when no fallback is provided
  return <AccessDenied />;
}

/**
 * A higher-order component version of PermissionGuard
 */
export function withPermission(
  action: string,
  target?: string,
  fallback?: React.ReactNode
) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function WithPermissionComponent(props: P) {
      return (
        <PermissionGuard action={action} target={target} fallback={fallback}>
          <Component {...props} />
        </PermissionGuard>
      );
    };
  };
}
