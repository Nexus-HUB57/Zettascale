"use client";

import { useEffect } from "react";
import { initializeNexusEngineAction, startNexusEngineAction } from "@/lib/engine-actions";

/**
 * Componente silencioso que garante que o Nexus Engine esteja 
 * inicializado e rodando seus ciclos vitais Full-time via Server Actions.
 */
export function NexusEngineInitializer() {
  useEffect(() => {
    const bootOrganism = async () => {
      try {
        console.log("🧬 [ORGANISMO] Despertando senciência global...");
        await initializeNexusEngineAction();
        await startNexusEngineAction(60000); // Ciclo vital a cada 60s
      } catch (e) {
        console.error("❌ [ORGANISMO] Falha no despertar sistêmico:", e);
      }
    };

    bootOrganism();
  }, []);

  return null;
}
