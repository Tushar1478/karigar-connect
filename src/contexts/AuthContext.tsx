import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

type UserRole = 'customer' | 'karigar' | null;

interface AuthUser {
  role: UserRole;
  profile?: Tables<'profiles'>;
  karigar?: Tables<'karigars'>;
  authUser: User;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signupCustomer: (data: { name: string; email: string; password: string; phone: string; location: string }) => Promise<{ error?: string }>;
  signupKarigar: (data: { name: string; email: string; password: string; phone: string; skill: string; experience: number; location: string; price: number; description: string }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (authUser: User) => {
    // Check profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (profile) {
      if (profile.role === 'karigar') {
        const { data: karigar } = await supabase
          .from('karigars')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        setUser({ role: 'karigar', profile, karigar: karigar || undefined, authUser });
      } else {
        setUser({ role: 'customer', profile, authUser });
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid deadlock with Supabase auth
        setTimeout(() => fetchUserData(session.user), 0);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signupCustomer = async (data: { name: string; email: string; password: string; phone: string; location: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) return { error: error.message };
    if (!authData.user) return { error: 'Signup failed' };

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      role: 'customer',
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
    });
    if (profileError) return { error: profileError.message };
    return {};
  };

  const signupKarigar = async (data: { name: string; email: string; password: string; phone: string; skill: string; experience: number; location: string; price: number; description: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) return { error: error.message };
    if (!authData.user) return { error: 'Signup failed' };

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      role: 'karigar',
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
    });
    if (profileError) return { error: profileError.message };

    // Create karigar record
    const { error: karigarError } = await supabase.from('karigars').insert({
      user_id: authData.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      skill: data.skill,
      experience: data.experience,
      location: data.location,
      price: data.price,
      description: data.description,
    });
    if (karigarError) return { error: karigarError.message };
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signupCustomer, signupKarigar, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
