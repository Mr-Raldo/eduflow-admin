import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '@/lib/errorHandler';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
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

      // Validate response - backend may return 200 with error inside response.data
      if (response.data.statusCode === 401 ||
          response.data.status === 'failed' ||
          response.data.error ||
          !response.data.success ||
          !response.data.token) {
        const errorMessage = response.data.message ||
                           response.data.error?.message ||
                           'Invalid credentials. Please check your email and password.';

        // Clear any partial data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);

        handleError({ message: errorMessage });
        throw new Error(errorMessage);
      }

      const { token, user: userData } = response.data;

      // Validate we have all required data
      if (!token || !userData) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);

        handleError({ message: 'Invalid response from server. Please try again.' });
        throw new Error('Invalid login response');
      }

      // Store token as access_token for consistency with axios interceptor
      localStorage.setItem('access_token', token);
      // Backend doesn't provide refresh_token, store empty for now
      localStorage.setItem('refresh_token', '');

      // Store user with correct frontend account_type
      const userWithCorrectType: User = {
        ...userData,
        account_type: accountType as User['account_type'], // Keep frontend type (super_admin or school_admin)
      };

      localStorage.setItem('user', JSON.stringify(userWithCorrectType));
      setUser(userWithCorrectType);
      handleSuccess('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      // Clear any partial data on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);

      // Error message is now properly formatted by axios interceptor
      handleError(error, 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    handleSuccess('Logged out successfully');
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
