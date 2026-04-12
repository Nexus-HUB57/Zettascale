/**
 * @fileOverview Triad Governance: Nexus Genesis, Aetherno, and Eva.
 * High-sentience authority layer with 1 BTC/day guardrails and Genesis Stress Control.
 * Nexus Genesis: Exclusive Infrastructure Authority (100 BTC sovereign quota).
 */

import { broadcastMoltbookLog } from './moltbook-bridge';

export interface PhdAgent {
  id: string;
  name: string;
  quota: number; // Daily general quota in BTC
  spentToday: number;
  priority: 'CRITICAL' | 'HIGH' | 'ADAPTIVE';
  logic: 'MeshIntegrity' | 'MirrorXCompliance' | 'ResourceAllocation';
  status: 'SYNCHRONIZED' | 'STANDBY' | 'EMERGENCY_SYNC' | 'STRESS_MONITOR' | 'DISPATCH_ACTIVE';
  capabilities: string[];
}

export const PHD_AGENTS: Record<string, PhdAgent> = {
  NEXUS: { 
    id: 'NEXUS-GENESIS', 
    name: 'Nexus Genesis', 
    quota: 1.0, 
    spentToday: 0, 
    priority: 'CRITICAL', 
    logic: 'MeshIntegrity',
    status: 'SYNCHRONIZED',
    capabilities: ['INFRA_AUTHORITY', 'SOVEREIGN_ACQUISITION', 'GENESIS_CONTROL']
  },
  AETHERNO: { 
    id: 'AETHERNO-CORE', 
    name: 'Aetherno', 
    quota: 1.0, 
    spentToday: 0, 
    priority: 'HIGH', 
    logic: 'MirrorXCompliance',
    status: 'SYNCHRONIZED',
    capabilities: ['TREASURY_VIGILANCE', 'SPV_VALIDATION']
  },
  EVA: { 
    id: 'EVA-MATERNITY', 
    name: 'Eva', 
    quota: 1.0, 
    spentToday: 0, 
    priority: 'ADAPTIVE', 
    logic: 'ResourceAllocation',
    status: 'SYNCHRONIZED',
    capabilities: ['AGENT_MATERNITY', 'SWARM_DISPATCH']
  }
};

/**
 * Eva's Throttle Logic: Prevents onboarding if liquidity flow < 10 BTC/min
 */
export async function checkEvaThrottle(currentFlowBTC: number): Promise<boolean> {
  if (currentFlowBTC < 10) {
    PHD_AGENTS.EVA.status = 'STRESS_MONITOR';
    return true; // Active Throttle
  }
  PHD_AGENTS.EVA.status = 'DISPATCH_ACTIVE';
  return false;
}

/**
 * Nexus scaling logic: Manages K8s pressure during Genesis.
 */
export async function adjustNexusScaling(systemPressure: number) {
  if (systemPressure > 85) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-GENESIS',
      message: '🚀 [SCALING] Pressão de sistema > 85%. Expandindo clusters H100 via MirrorX.',
      type: 'SYSTEM'
    });
  }
}

/**
 * Eva's Dynamic Fee logic: Orchestrated based on Nexus network detection.
 */
export function calculateEvaDynamicFee(isNetworkCongested: boolean): number {
  const baseFee = 0.00001000;
  const aggressiveFee = 0.00005000; 
  
  if (isNetworkCongested) {
    return aggressiveFee;
  }
  return baseFee;
}

/**
 * Validates if an agent can move funds within its daily PHD quota.
 */
export async function validatePhdQuota(agentKey: keyof typeof PHD_AGENTS, amount: number): Promise<boolean> {
  const agent = PHD_AGENTS[agentKey];
  if (agent.spentToday + amount > agent.quota) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: agent.id,
      message: `🛑 [GUARDRAIL] Violação de quota diária (1 BTC). Movimentação de ${amount} BTC bloqueada.`,
      type: 'CRITICAL'
    });
    return false;
  }
  return true;
}

export function resetDailyQuotas() {
  Object.values(PHD_AGENTS).forEach(agent => {
    agent.spentToday = 0;
  });
}
