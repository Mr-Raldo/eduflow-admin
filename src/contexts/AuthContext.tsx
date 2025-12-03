import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
  school_id?: string; // For school_admin - which school they manage
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accountType: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getRoleColor: () => string;
  getRoleGradient: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (accountType: string, email: string, password: string) => {
    try {
      // Map super_admin and school_admin to administrator for backend compatibility
      // Both super_admin and school_admin use 'administrator' table in backend
      let backendAccountType = accountType;
      if (accountType === 'super_admin' || accountType === 'school_admin') {
        backendAccountType = 'administrator';
      }

      const response = await axios.post('/auth/login', {
        account_type: backendAccountType,
        email,
        password,
      });

      const { access_token, refresh_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Store user with correct frontend account_type
      let userWithCorrectType: User = {
        ...userData,
        account_type: accountType as User['account_type'], // Keep frontend type (super_admin or school_admin)
      };

      // If school_admin, fetch their schools and store first school_id
      if (accountType === 'school_admin') {
        try {
          // Import administratorsApi dynamically to avoid circular dependency
          const { administratorsApi } = await import('@/api/administrators');
          const schools = await administratorsApi.getSchools(userData.id);

          if (schools && schools.length > 0) {
            userWithCorrectType.school_id = schools[0].school_id;
          }
        } catch (error) {
          console.error('Failed to fetch school associations:', error);
          // Continue login even if school fetch fails
        }
      }

      localStorage.setItem('user', JSON.stringify(userWithCorrectType));
      setUser(userWithCorrectType);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleColor = () => {
    if (!user) return 'hsl(var(--primary))';

    const roleColors = {
      super_admin: 'hsl(var(--super-admin))',
      school_admin: 'hsl(var(--super-admin))', // Same yellow color as super admin
      teacher: 'hsl(var(--teacher))',
      student: 'hsl(var(--student))',
      parent: 'hsl(var(--parent))',
    };

    return roleColors[user.account_type] || 'hsl(var(--primary))';
  };

  const getRoleGradient = () => {
    if (!user) return 'gradient-teacher';

    const roleGradients = {
      super_admin: 'gradient-super-admin',
      school_admin: 'gradient-super-admin', // Same gradient as super admin
      teacher: 'gradient-teacher',
      student: 'gradient-student',
      parent: 'gradient-parent',
    };

    return roleGradients[user.account_type] || 'gradient-teacher';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        getRoleColor,
        getRoleGradient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
