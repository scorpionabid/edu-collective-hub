
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Define permission types
type PermissionAction = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_regions'
  | 'manage_sectors'
  | 'manage_schools'
  | 'access_reports'
  | 'manage_tables'
  | 'edit_settings'
  | 'import_data'
  | 'export_data'
  | 'approve_forms'
  | 'submit_forms'
  | 'manage_categories';

type PermissionTarget = 
  | 'global'
  | 'region'
  | 'sector'
  | 'school';

// Map of permissions by role
const rolePermissions: Record<string, Record<PermissionAction, PermissionTarget[]>> = {
  superadmin: {
    view_dashboard: ['global'],
    manage_users: ['global'],
    manage_regions: ['global'],
    manage_sectors: ['global'],
    manage_schools: ['global'],
    access_reports: ['global'],
    manage_tables: ['global'],
    edit_settings: ['global'],
    import_data: ['global'],
    export_data: ['global'],
    approve_forms: ['global'],
    submit_forms: ['global'],
    manage_categories: ['global'],
  },
  regionadmin: {
    view_dashboard: ['region'],
    manage_users: ['region'],
    manage_regions: [], // Cannot manage regions
    manage_sectors: ['region'],
    manage_schools: ['region'],
    access_reports: ['region'],
    manage_tables: ['region'],
    edit_settings: ['region'],
    import_data: ['region'],
    export_data: ['region'],
    approve_forms: ['region'],
    submit_forms: ['region'],
    manage_categories: [],
  },
  sectoradmin: {
    view_dashboard: ['sector'],
    manage_users: ['sector'],
    manage_regions: [], // Cannot manage regions
    manage_sectors: [], // Cannot manage sectors
    manage_schools: ['sector'],
    access_reports: ['sector'],
    manage_tables: ['sector'],
    edit_settings: ['sector'],
    import_data: ['sector'],
    export_data: ['sector'],
    approve_forms: ['sector'],
    submit_forms: ['sector'],
    manage_categories: ['sector'],
  },
  schooladmin: {
    view_dashboard: ['school'],
    manage_users: [], // Cannot manage users
    manage_regions: [], // Cannot manage regions
    manage_sectors: [], // Cannot manage sectors
    manage_schools: [], // Cannot manage schools
    access_reports: ['school'],
    manage_tables: [], // Cannot manage tables
    edit_settings: ['school'],
    import_data: ['school'],
    export_data: ['school'],
    approve_forms: [], // Cannot approve forms
    submit_forms: ['school'],
    manage_categories: [], // Cannot manage categories
  },
};

interface PermissionContextType {
  hasPermission: (action: PermissionAction, target?: string) => boolean;
  permissionActions: PermissionAction[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const permissionService = useMemo(() => {
    return {
      hasPermission: (action: PermissionAction, target?: string): boolean => {
        if (!user) return false;
        
        const userRole = user.role as keyof typeof rolePermissions;
        if (!rolePermissions[userRole]) return false;
        
        const allowedTargets = rolePermissions[userRole][action] || [];
        
        // If global access is allowed, permit any target
        if (allowedTargets.includes('global')) return true;
        
        // If no specific target is provided, check if the action is allowed at all
        if (!target) return allowedTargets.length > 0;
        
        // Check region level permissions
        if (allowedTargets.includes('region') && user.regionId && target === user.regionId) {
          return true;
        }
        
        // Check sector level permissions
        if (allowedTargets.includes('sector') && user.sectorId && target === user.sectorId) {
          return true;
        }
        
        // Check school level permissions
        if (allowedTargets.includes('school') && user.schoolId && target === user.schoolId) {
          return true;
        }
        
        return false;
      },
      permissionActions: Object.keys(rolePermissions[user?.role as string] || {}) as PermissionAction[],
    };
  }, [user]);

  return (
    <PermissionContext.Provider value={permissionService}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}
