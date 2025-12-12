import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  roles: AppRole[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  getRoleColor: () => string;
  getRoleGradient: () => string;
  hasRole: (role: AppRole) => boolean;
  getPrimaryRole: () => AppRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      const roles = rolesData?.map(r => r.role) || [];

      if (profileData) {
        return {
          ...profileData,
          roles,
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id).then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        setProfile(userProfile);

        if (!userProfile?.roles?.length) {
          toast.error('Your account has no assigned role. Please contact an administrator.');
          await supabase.auth.signOut();
          return;
        }

        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created successfully! Please contact an administrator to assign your role.');
        navigate('/login');
      }
    } catch (error: any) {
      const message = error.message || 'Signup failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return profile?.roles?.includes(role) || false;
  };

  const getPrimaryRole = (): AppRole | null => {
    if (!profile?.roles?.length) return null;

    // Priority order for display
    const priority: AppRole[] = ['admin', 'headmaster', 'hod', 'teacher', 'parent', 'student'];
    for (const role of priority) {
      if (profile.roles.includes(role)) return role;
    }
    return profile.roles[0];
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

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
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
