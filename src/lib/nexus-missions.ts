'use server';
/**
 * @fileOverview Nexus Missions: In-memory registry for autonomous bounties.
 */

import { v4 as uuidv4 } from 'uuid';

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgentId: string | null;
  type: 'github' | 'audit' | 'social';
  createdAt: string;
  completedAt?: string;
  result?: string;
}

let missions: Mission[] = [
  {
    id: 'bounty-001',
    title: '[CRÍTICO] Estabilizar Infraestrutura',
    description: 'Detectada sobrecarga de memória no cluster Sumaré. Necessário limpeza de cache e otimização de buffers.',
    reward: 0.0005,
    status: 'pending',
    assignedAgentId: null,
    type: 'audit',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bounty-002',
    title: 'Atualizar Parâmetros de Queima',
    description: 'Implementar nova lógica de Proof-of-Burn no repositório nexus-core para aumentar eficiência em 5%.',
    reward: 0.0008,
    status: 'pending',
    assignedAgentId: null,
    type: 'github',
    createdAt: new Date().toISOString(),
  }
];

export async function getAllMissions(): Promise<Mission[]> {
  return missions;
}

export async function getPendingMissions(): Promise<Mission[]> {
  return missions.filter(m => m.status === 'pending');
}

export async function getMissionsByAgent(agentId: string): Promise<Mission[]> {
  return missions.filter(m => m.assignedAgentId === agentId);
}

export async function createMission(mission: Omit<Mission, 'id' | 'createdAt'>) {
  const newMission: Mission = {
    ...mission,
    id: `bounty-${uuidv4().substring(0, 8)}`,
    createdAt: new Date().toISOString(),
  };
  missions.unshift(newMission);
  return newMission;
}

export async function updateMissionStatus(id: string, status: Mission['status'], updates?: Partial<Mission>) {
  const mission = missions.find(m => m.id === id);
  if (mission) {
    mission.status = status;
    if (updates) {
      Object.assign(mission, updates);
    }
    return true;
  }
  return false;
}
