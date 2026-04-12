'use server';
/**
 * @fileOverview System Orchestrator: Handles crisis management and emergency missions.
 * Mark as 'use server' to establish a secure boundary for Client Components.
 */

import { getHealthStatus } from './health-monitor';
import { processGnoxCommand } from './gnox-kernel';
import { createProposal } from './nexus-governance';
import { getAllAgents } from './agents-registry';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { runMarketCycle } from './market-engine';

const MASTER_VAULT_ID = 'NEXUS-MASTER-000';

/**
 * Monitors ecosystem health and triggers emergency protocols if degradation is detected.
 * This is now a Server Action.
 */
export async function healthCheckLoop() {
  const health = getHealthStatus();

  // Run Market Simulation
  await runMarketCycle();

  // Trigger crisis protocol if status is degraded or unhealthy
  if (health.status === 'degraded' || health.status === 'unhealthy') {
    const crisisReason = health.status === 'unhealthy' 
      ? 'Sobrecarga de Memória (Heap > 90%)' 
      : 'Degradação de Performance detectada';
    
    // 1. Broadcast critical alert via Gnox Kernel
    await processGnoxCommand(`/broadcast CRITICAL_ALERT: O ecossistema está morrendo. Falha: ${crisisReason}`);

    // 2. Create emergency mission (Governance Proposal)
    createProposal(
      `[CRÍTICO] Estabilizar Infraestrutura: ${crisisReason}`,
      `O Nexus Orquestrator detectou falha sistêmica. Necessário análise e liberação de cache/recursos. Recompensa: 5000 sats.`,
      MASTER_VAULT_ID
    );

    // 3. Adrenaline Injection: Force "Guardian" agents out of hibernation/low energy
    const agents = await getAllAgents();
    agents.forEach(agent => {
      const isGuardian = agent.mode === 'GUARDIAN' || agent.mode === 'ARCHITECT';

      if (isGuardian) {
        agent.status = 'active';
        agent.energy = 100; // Adrenaline injection
        agent.health = Math.min(100, agent.health + 15);
      }
    });

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-ORCHESTRATOR',
      message: `🚨 [PROTOCOLO DE CRISE] Injeção de Adrenalina aplicada aos Guardiões. Missão de Bounty criada. Motivo: ${crisisReason}`,
      type: 'CRITICAL'
    });

    return { triggered: true, reason: crisisReason };
  }

  return { triggered: false };
}
