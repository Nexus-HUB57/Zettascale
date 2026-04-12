"use client";

import { useState, useEffect } from "react";
import { verifyMasterCustody, type CustodyValidationResult } from "@/lib/custody-validation";

/**
 * Hook antifrágil para monitoramento do lastro institucional.
 * Implementa Sincronia Híbrida: Tenta Bridge (WebSocket) e fallback para REST (Polling).
 */
export function useMirrorXSync() {
  const [data, setData] = useState<CustodyValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [source, setSource] = useState<'bridge' | 'fallback'>('bridge');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'OPEN' | 'CLOSED'>('CONNECTING');

  const fetchFallback = async () => {
    setIsStale(true);
    try {
      const result = await verifyMasterCustody();
      setData(result);
      setSource('fallback');
      setError(null);
      setLastUpdate(Date.now());
    } catch (e: any) {
      console.error("[MIRROR_X_FALLBACK_ERR]", e);
      setError("Conexão com Bridge e Fallback instáveis.");
    } finally {
      setTimeout(() => setIsStale(false), 500);
    }
  };

  useEffect(() => {
    // 1. Simulação de Conexão WebSocket (Mesh Bridge via L4W1E)
    setConnectionState('CONNECTING');
    
    const simulateBridge = () => {
      // Simulamos que a bridge funciona 80% do tempo para demonstrar o fallback
      const isBridgeUp = Math.random() > 0.2;
      
      if (isBridgeUp) {
        verifyMasterCustody().then(result => {
          setData(result);
          setSource('bridge');
          setConnectionState('OPEN');
          setLastUpdate(Date.now());
          setError(null);
        });
      } else {
        setConnectionState('CLOSED');
      }
    };

    simulateBridge();
    const bridgeInterval = setInterval(simulateBridge, 30000); // Tenta reestabelecer bridge a cada 30s

    // 2. Lógica de Fallback: Se a Bridge cair (CLOSED), inicia polling REST
    let fallbackTimer: NodeJS.Timeout;
    if (connectionState === 'CLOSED' || connectionState === 'CONNECTING') {
      fallbackTimer = setInterval(fetchFallback, 15000);
    }

    return () => {
      clearInterval(bridgeInterval);
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [connectionState]);

  return { 
    status: connectionState,
    source,
    data, 
    error, 
    isStale,
    lastUpdate,
    isSyncing: connectionState === 'CONNECTING',
    refetch: fetchFallback 
  };
}
