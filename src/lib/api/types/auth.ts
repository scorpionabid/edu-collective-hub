
import { Session, User } from '@supabase/supabase-js';

// Auth-related types
export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: any;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  password: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
}

export interface AdminUser extends UserProfile {
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface AuthErrorResponse {
  error: string;
  message: string;
  status: number;
}
