
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/lib/api/auth';

type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const checkUserAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        // Check if we have a valid session with Supabase
        try {
          const user = await auth.getUser();
          if (user) {
            setUser(JSON.parse(storedUser));
            
            // If we're on the login page or root and already logged in, redirect to appropriate dashboard
            if (location.pathname === '/login' || location.pathname === '/') {
              const role = JSON.parse(storedUser).role;
              redirectBasedOnRole(role);
            }
          } else {
            // Session expired, log user out
            localStorage.removeItem('user');
            if (location.pathname !== '/login' && location.pathname !== '/reset-password') {
              navigate('/login');
            }
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          localStorage.removeItem('user');
          if (location.pathname !== '/login' && location.pathname !== '/reset-password') {
            navigate('/login');
          }
        }
      } else {
        // If not logged in and not on login page, redirect to login
        if (location.pathname !== '/login' && location.pathname !== '/reset-password') {
          navigate('/login');
        }
      }
      setLoading(false);
    };
    
    checkUserAuth();
  }, [location.pathname]);

  const redirectBasedOnRole = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        navigate('/superadmin/dashboard');
        break;
      case 'regionadmin':
        navigate('/regionadmin/dashboard');
        break;
      case 'sectoradmin':
        navigate('/sectoradmin/dashboard');
        break;
      case 'schooladmin':
        navigate('/schooladmin/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await auth.signIn(email, password);
      
      if (!result || !result.user) {
        toast.error("Daxil olmaq alınmadı");
        return;
      }
      
      // Extract user role and other information from the session
      // This is a simplified version; in a real app, you'd get this from your user profiles table
      let mockUser: User;
      
      if (email.includes('super')) {
        mockUser = {
          id: result.user.id || '1',
          name: 'Super Admin',
          email: email,
          role: 'superadmin',
        };
      } else if (email.includes('region')) {
        mockUser = {
          id: result.user.id || '2',
          name: 'Region Admin',
          email: email,
          role: 'regionadmin',
          regionId: '1', // Assume first region
        };
      } else if (email.includes('sector')) {
        mockUser = {
          id: result.user.id || '3',
          name: 'Sector Admin',
          email: email,
          role: 'sectoradmin',
          regionId: '1',
          sectorId: '1', // Assume first sector
        };
      } else {
        mockUser = {
          id: result.user.id || '4',
          name: 'School Admin',
          email: email,
          role: 'schooladmin',
          regionId: '1',
          sectorId: '1',
          schoolId: '1', // Assume first school
        };
      }

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast.success("Uğurla daxil oldunuz");
      
      // Redirect based on user role
      redirectBasedOnRole(mockUser.role);
    } catch (error) {
      toast.error("Daxil olmaq alınmadı");
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
      toast.success("Uğurla çıxış etdiniz");
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if API call fails
      setUser(null);
      localStorage.removeItem('user');
      navigate('/login');
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      // Simulate API call to send password reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Şifrə yeniləmə linki ${email} ünvanına göndərildi`);
      return Promise.resolve();
    } catch (error) {
      toast.error("Şifrə yeniləmə linki göndərilə bilmədi");
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
