'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';
import { UserRole } from '@/app/types';

interface AuthContextType {
  user: { id: string; email: string; role: UserRole } | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; role: UserRole } | null>(null);
  const [loading, setLoading]  = useState(true);

  const parseToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      // 1. Проверяваме дали токенът е изтекъл (JWT exp е в секунди, а Date.now() в милисекунди)
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null; // Изтекъл токен
      }

      return {
        id: payload.sub,
        email: payload.email,
        role: (payload.role as UserRole) || 'developer',
      };
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const userData = parseToken(token);
      if (userData) {
        setUser(userData);
      } else {
        
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0;';
        router.push('/login');
      }
    } else {
      
    }
    setLoading(false);
  }, [router]);

  const login = async (email: string, password: string) => {
    const data = await userService.login({ email, password });
    const token = data.access_token;

    localStorage.setItem('access_token', token);
    document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;

    const userData = parseToken(token);
    if (userData) {
      setUser(userData);
    }

    router.push('/dashboard');
    router.refresh();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; path=/; max-age=0;';
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}