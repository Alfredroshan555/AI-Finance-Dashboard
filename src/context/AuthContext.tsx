'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      setUser(res.ok ? (await res.json()).user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navigateToTarget = (redirectTo = '/') => {
    const target = redirectTo?.startsWith('/') && !redirectTo.startsWith('/login') && !redirectTo.startsWith('/register')
      ? redirectTo
      : '/';
    router.push(target);
    router.refresh();
  };

  const handleAuthApiCall = async (
    endpoint: string,
    payload: object,
    defaultErrorMessage: string,
    redirectTo = '/'
  ) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || defaultErrorMessage };
      }

      setUser(data.user);
      navigateToTarget(redirectTo);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const login = (email: string, password: string, redirectTo = '/') =>
    handleAuthApiCall('/api/auth/login', { email, password }, 'Failed to sign in.', redirectTo);

  const register = (email: string, name: string, password: string, redirectTo = '/') =>
    handleAuthApiCall('/api/auth/register', { email, name, password }, 'Failed to create account.', redirectTo);

  const loginWithGoogle = (credential: string, redirectTo = '/') =>
    handleAuthApiCall('/api/auth/google', { credential }, 'Google SSO failed.', redirectTo);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
