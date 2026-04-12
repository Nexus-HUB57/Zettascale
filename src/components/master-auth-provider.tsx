
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthStatus, MASTER_CREDENTIALS } from '@/lib/master-auth';

interface AuthContextType {
  status: AuthStatus;
  user: string | null;
  login: (u: string, e: string, p: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function MasterAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('UNAUTHENTICATED');
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('nexus_master_session');
    if (saved === 'active') {
      setStatus('SOVEREIGN_MASTER');
      setUser(MASTER_CREDENTIALS.username);
    } else if (pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const login = async (u: string, e: string, p: string) => {
    if (u === MASTER_CREDENTIALS.username && e === MASTER_CREDENTIALS.email && p === MASTER_CREDENTIALS.password) {
      localStorage.setItem('nexus_master_session', 'active');
      setStatus('SOVEREIGN_MASTER');
      setUser(u);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('nexus_master_session');
    setStatus('UNAUTHENTICATED');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useMasterAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useMasterAuth must be used within MasterAuthProvider');
  return context;
};
