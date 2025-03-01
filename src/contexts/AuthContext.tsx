
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      // If we're on the login page and already logged in, redirect to appropriate dashboard
      if (location.pathname === '/login' || location.pathname === '/') {
        const role = JSON.parse(storedUser).role;
        redirectBasedOnRole(role);
      }
    }
    setLoading(false);
  }, [location.pathname, navigate]);

  const redirectBasedOnRole = (role: UserRole) => {
    if (role === 'superadmin') {
      navigate('/dashboard');
    } else if (role === 'regionadmin') {
      navigate('/region-dashboard');
    } else if (role === 'sectoradmin') {
      navigate('/sector-dashboard');
    } else if (role === 'schooladmin') {
      navigate('/school-dashboard');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call - Replace with actual authentication
      // For demonstration, we'll set different user roles based on email
      let mockUser: User;
      
      if (email.includes('super')) {
        mockUser = {
          id: '1',
          name: 'Super Admin',
          email: email,
          role: 'superadmin',
        };
      } else if (email.includes('region')) {
        mockUser = {
          id: '2',
          name: 'Region Admin',
          email: email,
          role: 'regionadmin',
          regionId: '1', // Assume first region
        };
      } else if (email.includes('sector')) {
        mockUser = {
          id: '3',
          name: 'Sector Admin',
          email: email,
          role: 'sectoradmin',
          regionId: '1',
          sectorId: '1', // Assume first sector
        };
      } else {
        mockUser = {
          id: '4',
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
    toast.success("Uğurla çıxış etdiniz");
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
