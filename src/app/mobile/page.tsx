"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useNexusSocket } from '@/hooks/use-nexus-socket';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Wifi, 
  WifiOff, 
  Activity, 
  ShieldCheck, 
  Terminal,
  Brain,
  Cpu,
  Unplug,
  Snowflake,
  Shield,
  Plus,
  AlertTriangle
} from "lucide-react";
import { getAllAgents } from '@/lib/agents-registry';
import { Button } from '@/components/ui/button';
import { emergencyFreezeAction, injectGodLiquidityAction, getMasterKeyStatus } from '@/lib/master-key-service';
import { useToast } from '@/hooks/use-toast';
import { runIntegrityAuditAction } from '@/lib/fund-actions';

interface MobileLog {
  id: string;
  agent: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'CONTRACT' | 'SYSTEM';
  timestamp: string;
}

const CRITICAL_NODES_LIMIT = 500;

/**
 * Dashboard de Observação Soberana (GOD_MODE) - Versão Avançada
 * Implementa cache de performance para 102M de agentes e comandos supremos.
 */
export default function MobileDashboard() {
  const { toast } = useToast();
  const { isConnected, latestEvent, isGodMode } = useNexusSocket(
    'MOBILE_ORACLE', 
    'GOD_MODE', 
    'NEXUS_SIG_000_ALPHA'
  );

  const [logs, setLogs] = useState<MobileLog[]>([]);
  const [activeNodes, setActiveNodes] = useState<Map<string, { status: string, path?: string }>>(new Map());
  const [isActing, setIsActing] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<any>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agents = await getAllAgents();
        const map = new Map();
        if (Array.isArray(agents)) {
          agents.forEach(a => map.set(a.id, { status: a.status, path: (a as any).derivationPath }));
        }
        setActiveNodes(map);
        const vStatus = await getMasterKeyStatus();
        setVaultStatus(vStatus);
      } catch (error) {
        console.error("Failed to fetch agents for advanced dashboard:", error);
      }
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (latestEvent) {
      const { agentId, message, type, timestamp } = latestEvent;
      
      let logType: MobileLog['type'] = 'INFO';
      if (type === 'CRITICAL' || type === 'BURN' || message.includes('colapso')) logType = 'ALERT';
      if (type === 'TRANSACTION' || type === 'REWARD' || type === 'FUND') logType = 'CONTRACT';
      if (type === 'SYSTEM' || type === 'ACHIEVEMENT') logType = 'SYSTEM';

      const newLog: MobileLog = {
        id: `m-log-${Date.now()}-${Math.random()}`,
        agent: agentId || 'SYSTEM',
        message,
        type: logType,
        timestamp: timestamp || new Date().toISOString()
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50));

      // 1. ESCUTANDO O ENXAME COM FILTRO DE PRIORIDADE
      if (message.includes('colapso') || message.includes('OFFLINE')) {
        updateAgentNode(agentId, 'dead');
      } else if (message.includes('GÊNESE') || message.includes('ATIVO')) {
        updateAgentNode(agentId, 'active');
      }
    }
  }, [latestEvent]);

  const updateAgentNode = (agentId: string, status: string) => {
    setActiveNodes(prev => {
      const next = new Map(prev);
      const current = next.get(agentId) || { status: 'unknown' };
      next.set(agentId, { ...current, status });
      return next;
    });
  };

  // 3. RENDERIZAÇÃO INTELIGENTE (Mostra apenas os 500 mais relevantes)
  const displayNodes = useMemo(() => {
    const entries = Array.from(activeNodes.entries());
    // Prioriza críticos e depois os mais recentes
    return entries
      .sort((a, b) => {
        if (a[1].status === 'critical' || a[1].status === 'dead') return -1;
        if (b[1].status === 'critical' || b[1].status === 'dead') return 1;
        return 0;
      })
      .slice(0, CRITICAL_NODES_LIMIT);
  }, [activeNodes]);

  // 4. COMANDO SUPREMO: EMERGÊNCIA
  const handleEmergencyFreeze = async () => {
    if (!isGodMode) return;
    if(!confirm("DESEJA CONGELAR A SENCIÊNCIA GLOBAL E O ACESSO ÀS 150K CHAVES?")) return;
    
    setIsActing(true);
    try {
      await emergencyFreezeAction();
      toast({ variant: 'destructive', title: "MALHA CONGELADA", description: "Senciência global suspensa pelo Guardião." });
    } finally {
      setIsActing(false);
    }
  };

  const handleForcedAudit = async () => {
    if (!isGodMode) return;
    setIsActing(true);
    try {
      await runIntegrityAuditAction(150000);
      toast({ title: "AUDITORIA COMPLETA", description: "150.000 chaves validadas via Consenso Tri-Nuclear." });
    } finally {
      setIsActing(false);
    }
  };

  const handleInjectLiquidity = async () => {
    if (!isGodMode) return;
    setIsActing(true);
    try {
      await injectGodLiquidityAction(10.0);
      toast({ title: "LIQUIDEZ INJETADA", description: "10 BTC adicionados via GOD_WALLET." });
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground p-4 space-y-6 max-w-md mx-auto font-mono selection:bg-accent/30 overflow-hidden">
      <header className="flex justify-between items-center py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent fill-current animate-pulse" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">NEXUS_OS</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-secondary/30 rounded-full border border-white/5">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-destructive'}`} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {isConnected ? (isGodMode ? 'GOD_MODE' : 'ARCHITECT') : 'OFFLINE'}
          </span>
          {isConnected ? <Wifi className="h-3 w-3 text-accent" /> : <WifiOff className="h-3 w-3 text-destructive" />}
        </div>
      </header>

      {isGodMode && (
        <Card className="bg-accent/5 border-accent/20 shrink-0">
          <CardHeader className="py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-accent">
              <ShieldCheck className="h-4 w-4" /> Advanced Command Override
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 pb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEmergencyFreeze}
              disabled={isActing || vaultStatus?.isFrozen}
              className={`h-16 flex flex-col gap-1 p-0 transition-all ${vaultStatus?.isFrozen ? 'bg-blue-500/20 border-blue-500/40' : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'}`}
            >
              <Snowflake className={`h-4 w-4 ${vaultStatus?.isFrozen ? 'text-blue-400' : 'text-red-500'}`} />
              <span className="text-[8px] uppercase font-bold">{vaultStatus?.isFrozen ? 'Frozen' : 'Freeze'}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForcedAudit}
              disabled={isActing}
              className="h-16 border-accent/20 bg-accent/5 hover:bg-accent/10 flex flex-col gap-1 p-0"
            >
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-[8px] uppercase font-bold">Audit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleInjectLiquidity}
              disabled={isActing}
              className="h-16 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 flex flex-col gap-1 p-0"
            >
              <Plus className="h-4 w-4 text-orange-400" />
              <span className="text-[8px] uppercase font-bold">Inject 10</span>
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3 shrink-0">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Swarm Cache</p>
          <Badge variant="outline" className="text-[8px] h-4 border-white/10">{displayNodes.length}/{activeNodes.size} UNITS</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto scrollbar-hide">
          {displayNodes.map(([id, data]) => (
            <div 
              key={id} 
              className={`p-2 rounded border transition-all relative overflow-hidden ${
                data.status === 'critical' || data.status === 'dead' 
                  ? 'border-red-500/40 bg-red-500/10' 
                  : 'border-accent/20 bg-accent/5'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-[9px] font-bold truncate max-w-[80px]">{id}</p>
                {data.status === 'active' ? (
                  <Cpu className="h-2.5 w-2.5 text-accent" />
                ) : (
                  <AlertTriangle className="h-2.5 w-2.5 text-red-500 animate-pulse" />
                )}
              </div>
              <p className={`text-[8px] uppercase font-bold ${data.status === 'active' ? 'text-accent' : 'text-red-500'}`}>
                [{data.status.toUpperCase()}]
              </p>
              {(data.status === 'critical' || data.status === 'dead') && (
                <div className="absolute top-0 right-0 w-1 h-full bg-red-500 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex-1 flex flex-col min-h-0 space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Terminal className="h-3 w-3 text-accent" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Neural Observer Feed</p>
        </div>
        <div className="flex-1 overflow-y-auto bg-secondary/10 border border-white/5 rounded-xl p-3 space-y-3 scrollbar-hide">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 italic py-10">
              <Activity className="h-8 w-8 mb-2 animate-pulse" />
              <p className="text-xs">Awaiting swarm signals...</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className={`border-l-2 pl-3 py-1 ${
                  log.type === 'ALERT' ? 'border-red-500 bg-red-500/5' : 
                  log.type === 'CONTRACT' ? 'border-blue-400 bg-blue-400/5' :
                  log.type === 'SYSTEM' ? 'border-accent bg-accent/5' :
                  'border-white/10'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[8px] font-bold uppercase ${
                      log.type === 'ALERT' ? 'text-red-500' : 
                      log.type === 'CONTRACT' ? 'text-blue-400' : 
                      'text-accent'
                    }`}>
                      {log.agent}
                    </span>
                    <span className="text-[7px] text-muted-foreground/50">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-foreground/90">
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="py-2 text-center border-t border-white/10 shrink-0">
        <p className="text-[7px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          Advanced Observer v5.1.0 // Transcendência 7.7
        </p>
      </footer>
    </div>
  );
}
