
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

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
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Redirect based on user role
      if (mockUser.role === 'superadmin') {
        navigate('/dashboard');
      } else if (mockUser.role === 'regionadmin') {
        navigate('/region-dashboard');
      } else if (mockUser.role === 'sectoradmin') {
        navigate('/sector-dashboard');
      } else if (mockUser.role === 'schooladmin') {
        navigate('/school-dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };
  
  const resetPassword = async (email: string) => {
    try {
      // Simulate API call to send password reset email
      // This would be replaced with an actual API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Success",
        description: `Password reset link has been sent to ${email}`,
      });
      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
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
