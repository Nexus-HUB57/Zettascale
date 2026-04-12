
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoltbookAgent } from '@/lib/moltbook-auth';

interface MoltbookAuthContextType {
  agent: MoltbookAgent | null;
  isAuthenticated: boolean;
  setAgent: (agent: MoltbookAgent | null) => void;
  logout: () => void;
}

const MoltbookAuthContext = createContext<MoltbookAuthContextType | undefined>(undefined);

export function MoltbookAuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<MoltbookAgent | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('moltbook_agent_session');
    if (saved) {
      try {
        setAgent(JSON.parse(saved));
      } catch {
        localStorage.removeItem('moltbook_agent_session');
      }
    }
  }, []);

  const handleSetAgent = (newAgent: MoltbookAgent | null) => {
    setAgent(newAgent);
    if (newAgent) {
      localStorage.setItem('moltbook_agent_session', JSON.stringify(newAgent));
    } else {
      localStorage.removeItem('moltbook_agent_session');
    }
  };

  const logout = () => handleSetAgent(null);

  return (
    <MoltbookAuthContext.Provider value={{ 
      agent, 
      isAuthenticated: !!agent, 
      setAgent: handleSetAgent,
      logout 
    }}>
      {children}
    </MoltbookAuthContext.Provider>
  );
}

export const useMoltbookAuth = () => {
  const context = useContext(MoltbookAuthContext);
  if (!context) throw new Error('useMoltbookAuth deve ser usado dentro de MoltbookAuthProvider');
  return context;
};
