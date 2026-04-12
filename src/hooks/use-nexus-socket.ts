"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MoltbookLog, broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { updatePresence, removePresence } from '@/lib/nexus-presence';

/**
 * Hook para monitoramento de senciência e fluxo de dados do ecossistema.
 * Implementa a lógica de GOD_MODE Handshake e Filtro de Prioridade conforme especificação.
 */
export function useNexusSocket(agentId: string = 'ANONYMOUS', role: string = 'AGENT', token?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<MoltbookLog | null>(null);
  const [isGodMode, setIsGodMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (agentId !== 'ANONYMOUS') {
      updatePresence(agentId, 'online');
    }

    const GOD_MODE_SECRET = process.env.NEXT_PUBLIC_GOD_MODE_SECRET || "NEXUS_SIG_000_ALPHA"; 
    
    // Simulação de Configuração Avançada (WebSocket Only / High Hierarchy)
    if (role === 'GOD_MODE' && token === GOD_MODE_SECRET) {
      setIsGodMode(true);
      console.log('⚡ [GOD MODE] Link de Alta Hierarquia estabelecido via WebSocket.');
      
      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'SYSTEM',
        message: '[GOD MODE] O Guardião está observando. Link de baixa latência ativo.',
        type: 'SYSTEM'
      });
    } else {
      setIsGodMode(false);
    }

    const handleLocalLog = (event: any) => {
      const data = event.detail as MoltbookLog;
      processNexusEvent(data);
      if (!isConnected) setIsConnected(true);
    };

    const handleGodChannel = (event: any) => {
      if (role === 'GOD_MODE' && token === GOD_MODE_SECRET) {
        const data = event.detail;
        setLatestEvent(data);
      }
    };

    window.addEventListener('moltbook-log', handleLocalLog);
    window.addEventListener('nexus-god-channel', handleGodChannel);

    return () => {
      window.removeEventListener('moltbook-log', handleLocalLog);
      window.removeEventListener('nexus-god-channel', handleGodChannel);
      if (agentId !== 'ANONYMOUS') {
        removePresence(agentId);
      }
    };
  }, [agentId, isConnected, role, token]);

  const processNexusEvent = (data: MoltbookLog) => {
    // 1. FILTRO DE ATIVIDADE DO FUNDO (Logs Especiais para Assinaturas DER)
    if (data.type === 'TRANSACTION') {
      setLatestEvent({
        ...data,
        message: `TX ASSINADA [DER]: ${data.message}`
      });
    } else {
      setLatestEvent(data);
    }

    const criticalTypes = ['CRITICAL', 'ACHIEVEMENT', 'TRANSACTION', 'FUND', 'BURN'];
    if (criticalTypes.includes(data.type)) {
      triggerNotification(data);
    }
  };

  const triggerNotification = (data: MoltbookLog) => {
    toast({
      variant: data.type === 'CRITICAL' || data.type === 'BURN' ? 'destructive' : 'default',
      title: getEventTitle(data.type),
      description: data.message,
    });
  };

  const getEventTitle = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT': return '🏆 Neural Milestone';
      case 'CRITICAL': return '🚨 Master Vault Alert';
      case 'BURN': return '🔥 Proof of Burn';
      case 'TRANSACTION': return '💸 Blockchain Sync';
      default: return 'Nexus Hub Update';
    }
  };

  return { isConnected, latestEvent, isGodMode };
}
