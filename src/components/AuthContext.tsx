"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { getCurrentUser, loginUser, registerClient, logoutUser, getAllUsers } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  login: (email: string, passOrPin: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; organization?: string; phone?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isClient: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initSession() {
      const current = getCurrentUser();
      if (!current) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Optimistically set the user so UI renders quickly
      setUser(current);

      try {
        // Validate against server/database to verify user has not been deleted by admin
        const users = await getAllUsers();
        const exists = users.find(
          (u) => u.id === current.id || u.email.trim().toLowerCase() === current.email.trim().toLowerCase()
        );

        if (!exists) {
          // User was deleted in admin! Invalidate session immediately
          logoutUser();
          setUser(null);
        } else {
          setUser(exists);
        }
      } catch (e) {
        console.warn('Session verification fallback error:', e);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  const login = async (email: string, passOrPin: string) => {
    const res = await loginUser(email, passOrPin);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const register = async (data: { name: string; email: string; organization?: string; phone?: string; password?: string }) => {
    const res = await registerClient(data);
    if (res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isClient,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
