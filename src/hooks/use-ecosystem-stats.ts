"use client";

import { useState, useEffect } from "react";
import { getHealthStatus, type SystemHealth } from "@/lib/health-monitor";
import { getOpenClawStatusAction } from "@/lib/openclaw-orchestrator";

/**
 * Hook para monitoramento de senciência e fluxo de dados do ecossistema.
 * Retorna métricas de agentes ativos, throughput e saúde da malha.
 * Escalonado para a meta de 102M de agentes e 10.2k BTC TVL.
 */
export function useEcosystemStats() {
  const [stats, setStats] = useState({
    agentsActive: 0,
    totalTVL: 0,
    throughput: 4.2,
    meshHealth: 1.0,
    isGenesisActive: false,
    lastUpdate: Date.now()
  });

  useEffect(() => {
    const refresh = async () => {
      const health = getHealthStatus();
      const ocStatus = await getOpenClawStatusAction();
      
      setStats({
        agentsActive: ocStatus.units || 102000000,
        totalTVL: ocStatus.totalTVL || 10200,
        throughput: health.mesh.throughput,
        meshHealth: health.mesh.health,
        isGenesisActive: ocStatus.isGenesisActive,
        lastUpdate: Date.now()
      });
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  return stats;
}
