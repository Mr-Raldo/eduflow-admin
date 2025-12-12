import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

type AppRole = 'admin' | 'headmaster' | 'hod' | 'teacher' | 'student' | 'parent';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: AppRole;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
    // Check for existing session on mount
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      // Validate response
      if (!response.data.success || !response.data.token || !response.data.user) {
        const errorMessage = response.data.error || 'Invalid credentials. Please check your email and password.';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const { token, user: userData } = response.data;

      // Store token and user
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      // Clear any partial data on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);

      const message = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleColor = () => {
    if (!user) return 'hsl(var(--primary))';

    const roleColors: Record<AppRole, string> = {
      admin: 'hsl(var(--super-admin))',
      headmaster: 'hsl(var(--super-admin))',
      hod: 'hsl(var(--teacher))',
      teacher: 'hsl(var(--teacher))',
      student: 'hsl(var(--student))',
      parent: 'hsl(var(--parent))',
    };

    return roleColors[user.role] || 'hsl(var(--primary))';
  };

  const getRoleGradient = () => {
    if (!user) return 'gradient-teacher';

    const roleGradients: Record<AppRole, string> = {
      admin: 'gradient-super-admin',
      headmaster: 'gradient-super-admin',
      hod: 'gradient-teacher',
      teacher: 'gradient-teacher',
      student: 'gradient-student',
      parent: 'gradient-parent',
    };

    return roleGradients[user.role] || 'gradient-teacher';
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
