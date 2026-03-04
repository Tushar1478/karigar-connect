import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Customer, Karigar, mockKarigars } from '@/data/mockData';

type UserRole = 'customer' | 'karigar' | null;

interface AuthUser {
  role: UserRole;
  customer?: Customer;
  karigar?: Karigar;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole, email: string) => boolean;
  signupCustomer: (data: Omit<Customer, 'id'>) => void;
  signupKarigar: (data: Omit<Karigar, 'id' | 'rating' | 'reviewCount' | 'completedJobs' | 'photo'>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (role: UserRole, email: string): boolean => {
    if (role === 'karigar') {
      const karigar = mockKarigars.find(k => k.email === email);
      if (karigar) {
        setUser({ role: 'karigar', karigar });
        return true;
      }
      // Demo: allow any email to log in as first karigar
      setUser({ role: 'karigar', karigar: mockKarigars[0] });
      return true;
    }
    // Customer login — create a demo customer
    setUser({
      role: 'customer',
      customer: { id: 'c1', name: 'Demo Customer', email, phone: '+91 99999 99999', location: 'Delhi' },
    });
    return true;
  };

  const signupCustomer = (data: Omit<Customer, 'id'>) => {
    const customer: Customer = { ...data, id: `c_${Date.now()}` };
    setUser({ role: 'customer', customer });
  };

  const signupKarigar = (data: Omit<Karigar, 'id' | 'rating' | 'reviewCount' | 'completedJobs' | 'photo'>) => {
    const karigar: Karigar = {
      ...data,
      id: `k_${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
    };
    setUser({ role: 'karigar', karigar });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signupCustomer, signupKarigar, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
