
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/api/auth';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthFunctions {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: { 
    firstName: string; 
    lastName: string; 
    role: string; 
    regionId?: string; 
    sectorId?: string; 
    schoolId?: string 
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>) => Promise<UserProfile | null>;
}

export type AuthContextType = AuthState & AuthFunctions;

// Role paths mapping for redirects
export const roleDashboardPaths: Record<string, string> = {
  superadmin: "/superadmin/dashboard",
  regionadmin: "/regionadmin/dashboard",
  sectoradmin: "/sectoradmin/dashboard",
  schooladmin: "/schooladmin/dashboard"
};
