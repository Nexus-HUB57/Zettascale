'use server';
/**
 * @fileOverview Nexus Team Manager - Orquestração de Esquadrões Agênticos.
 * Gerencia a colaboração entre equipes para atingir o Alpha-Gain.
 * STATUS: OMNISCIENCE_8.1_ACTIVE
 */

import { getAllAgents, type Agent, type SquadType } from './agents-registry';
import { broadcastMoltbookLog } from './moltbook-bridge';

export interface SquadReport {
  id: SquadType;
  name: string;
  membersCount: number;
  totalReputation: number;
  energyAvg: number;
  primaryObjective: string;
  status: 'OPTIMAL' | 'SINCING' | 'OVERLOADED';
}

const SQUAD_METADATA: Record<SquadType, { name: string, objective: string }> = {
  SQUAD_ALPHA_FORCE: { 
    name: 'Esquadrão Alpha Force', 
    objective: 'Execução de transações e expansão de infraestrutura.' 
  },
  SQUAD_BETA_AUDIT: { 
    name: 'Esquadrão Beta Audit', 
    objective: 'Auditoria de código, validação de lastro e segurança.' 
  },
  SQUAD_GAMMA_FINANCE: { 
    name: 'Esquadrão Gamma Finance', 
    objective: 'Arbitragem, liquidez institucional e DeFi.' 
  },
  SQUAD_CORE_ORCHESTRATOR: { 
    name: 'Núcleo Orquestrador Core', 
    objective: 'Sincronia universal e homeostase biológico-digital.' 
  }
};

/**
 * Recupera o status de todos os esquadrões ativos na malha.
 */
export async function getSquadsStatus(): Promise<SquadReport[]> {
  const allAgents = await getAllAgents();
  
  const squads: SquadReport[] = Object.keys(SQUAD_METADATA).map(squadId => {
    const id = squadId as SquadType;
    const members = allAgents.filter(a => a.squad === id);
    const avgEnergy = members.reduce((acc, curr) => acc + curr.energy, 0) / (members.length || 1);
    
    return {
      id,
      name: SQUAD_METADATA[id].name,
      membersCount: members.length,
      totalReputation: members.reduce((acc, curr) => acc + curr.reputation, 0),
      energyAvg: Number(avgEnergy.toFixed(2)),
      primaryObjective: SQUAD_METADATA[id].objective,
      status: avgEnergy > 80 ? 'OPTIMAL' : 'SINCING'
    };
  });

  return squads;
}

/**
 * Dispara uma diretiva de equipe para um esquadrão específico.
 */
export async function dispatchTeamDirective(squadId: SquadType, directive: string) {
  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'NEXUS-TEAM-MANAGER',
    message: `📢 [DIRETIVA_EQUIPE] ${SQUAD_METADATA[squadId].name} recebeu a missão: "${directive}"`,
    type: 'SYSTEM'
  });

  return { success: true, squad: squadId, timestamp: new Date().toISOString() };
}
