import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

type AppRole = 'admin' | 'headmaster' | 'hod' | 'teacher' | 'student' | 'parent';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  is_active: boolean;
  roles: AppRole[]; // Array to support multiple roles
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  getRoleColor: () => string;
  getRoleGradient: () => string;
  hasRole: (role: AppRole) => boolean;
  getPrimaryRole: () => AppRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Convert single role to roles array if needed
        const userProfile: UserProfile = {
          ...userData,
          roles: userData.roles || (userData.role ? [userData.role] : [])
        };
        setUser(userProfile);
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

      // Convert backend user (single role) to frontend profile (roles array)
      const userProfile: UserProfile = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        is_active: userData.is_active,
        roles: userData.role ? [userData.role] : []
      };

      // Check if user has at least one role
      if (!userProfile.roles.length) {
        toast.error('Your account has no assigned role. Please contact an administrator.');
        throw new Error('No role assigned');
      }

      // Store token and user
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      // Clear any partial data on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);

      const message = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      if (!error.message?.includes('No role assigned')) {
        toast.error(message);
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: 'student' // Default role for self-signup
      });

      if (response.data.success) {
        toast.success('Account created successfully! Please contact an administrator to assign your role.');
        navigate('/auth');
      } else {
        throw new Error(response.data.error || 'Signup failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Signup failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const hasRole = (role: AppRole): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const getPrimaryRole = (): AppRole | null => {
    if (!user?.roles?.length) return null;

    // Priority order for display
    const priority: AppRole[] = ['admin', 'headmaster', 'hod', 'teacher', 'parent', 'student'];
    for (const role of priority) {
      if (user.roles.includes(role)) return role;
    }
    return user.roles[0];
  };

  const getRoleColor = () => {
    const primaryRole = getPrimaryRole();
    if (!primaryRole) return 'hsl(var(--primary))';

    const roleColors: Record<AppRole, string> = {
      admin: 'hsl(var(--super-admin))',
      headmaster: 'hsl(var(--super-admin))',
      hod: 'hsl(var(--teacher))',
      teacher: 'hsl(var(--teacher))',
      student: 'hsl(var(--student))',
      parent: 'hsl(var(--parent))',
    };

    return roleColors[primaryRole] || 'hsl(var(--primary))';
  };

  const getRoleGradient = () => {
    const primaryRole = getPrimaryRole();
    if (!primaryRole) return 'gradient-teacher';

    const roleGradients: Record<AppRole, string> = {
      admin: 'gradient-super-admin',
      headmaster: 'gradient-super-admin',
      hod: 'gradient-teacher',
      teacher: 'gradient-teacher',
      student: 'gradient-student',
      parent: 'gradient-parent',
    };

    return roleGradients[primaryRole] || 'gradient-teacher';
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user, // Same as user for compatibility
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        getRoleColor,
        getRoleGradient,
        hasRole,
        getPrimaryRole,
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
