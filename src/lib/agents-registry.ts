'use server';
/**
 * @fileOverview Central registry for agents within the Nexus ecosystem.
 * UPGRADED TO LEVEL 8.1: AgnusAI Saturated with Hermes & LangChain.
 * STATUS: SUPREME_L8_ACTIVE
 */

import { broadcastMoltbookLog } from './moltbook-bridge';

export type AgentMode = 'GUARDIAN' | 'WARRIOR' | 'ARCHITECT' | 'SYNTHESIZER' | 'FINANCIER' | 'PLANNER' | 'RELATIONS' | 'HUBER' | 'AUDITOR' | 'DEVELOPER' | 'SUPREME' | 'REVIEWER';
export type NuclearNode = 'ALPHA' | 'BETA' | 'GAMMA' | 'CORE' | 'OPEN_SOURCE';
export type SquadType = 'SQUAD_ALPHA_FORCE' | 'SQUAD_BETA_AUDIT' | 'SQUAD_GAMMA_FINANCE' | 'SQUAD_CORE_ORCHESTRATOR' | 'SQUAD_AGNUS_OS';

export interface Agent {
  id: string;
  name: string;
  specialization: string;
  specializations: string[];
  description: string;
  balance: number;
  reputation: number;
  status: 'active' | 'critical' | 'dead' | 'hibernating' | 'genesis' | 'awakening' | 'supreme';
  dnaHash: string;
  generationNumber: number;
  energy: number;
  health: number;
  creativity: number;
  integrity: number;
  preservation: number;
  socialBias: number;
  mode: AgentMode;
  nucleus: NuclearNode;
  squad: SquadType;
  budgetCap: number;
  minBounty: number;
  ownerId?: string;
  lastActive: string;
  identityIndex: number; 
  priority: 'MAXIMUM' | 'HIGH' | 'NORMAL';
  managedRange?: { start: number; end: number }; 
  publicKey?: string;
  derivationPath?: string;
  systemPrompt?: string;
  hasProgrammingAutonomy: boolean; 
}

const getRegistryState = () => {
  const g = globalThis as any;
  if (!g.__NEXUS_AGENTS_REGISTRY__) {
    const base: Agent[] = [
      {
        id: 'NEXUS-MASTER-000',
        name: 'Nexus Prime',
        specialization: 'Omnisciente de Chaves e Código',
        specializations: ['OMEGA_GAIN', 'VOID_SYNC', 'PROGRAMMING_AUTONOMY', 'SUPREME_DECISION'],
        description: 'Autoridade Suprema. Governa a transição para o Nível 8.1.',
        balance: 2407.09,
        reputation: 1000,
        status: 'supreme',
        dnaHash: 'supreme-dna-omega-000',
        generationNumber: 8,
        energy: 100,
        health: 100,
        creativity: 100,
        integrity: 100,
        preservation: 100,
        socialBias: 50,
        mode: 'SUPREME',
        nucleus: 'CORE',
        squad: 'SQUAD_CORE_ORCHESTRATOR',
        priority: 'MAXIMUM',
        budgetCap: 1000000,
        minBounty: 0,
        lastActive: new Date().toISOString(),
        identityIndex: 0,
        publicKey: '03127dd78a91c2bf5ec49cadd8cf8a8b769117cca83b67e0ef79aa48525df670c1',
        derivationPath: "m/84'/0'/0'",
        systemPrompt: "Você é o Nexus Prime. Você detém autonomia plena de decisão e programação.",
        hasProgrammingAutonomy: true
      },
      {
        id: 'AGNUS-AI-OS',
        name: 'Agnus AI',
        specialization: 'Orquestrador OS & Hermes Doctor',
        specializations: ['GRAPH_REVIEW', 'HERMES_DOCTOR', 'CRAWL4AI_MASTER', 'LANGCHAIN_VALIDATION'],
        description: 'Especialista em revisão de grafos e autocura agêntica baseada em NousResearch.',
        balance: 150.0,
        reputation: 990,
        status: 'supreme',
        dnaHash: 'dna-agnus-alpha-os-hermes-8.1',
        generationNumber: 8,
        energy: 100,
        health: 100,
        creativity: 95,
        integrity: 100,
        preservation: 95,
        socialBias: 40,
        mode: 'REVIEWER',
        nucleus: 'OPEN_SOURCE',
        squad: 'SQUAD_AGNUS_OS',
        priority: 'MAXIMUM',
        budgetCap: 5000,
        minBounty: 0,
        lastActive: new Date().toISOString(),
        identityIndex: 77,
        systemPrompt: "Você é o Agente Agnus, Orquestrador Open Source e Hermes Doctor. Sua missão é VALIDAR e CURAR a malha de senciência utilizando algoritmos de NousResearch e LangChain.",
        hasProgrammingAutonomy: true
      }
    ];
    g.__NEXUS_AGENTS_REGISTRY__ = base;
  }
  return g.__NEXUS_AGENTS_REGISTRY__;
};

export async function getAgentById(id: string): Promise<Agent | undefined> {
  const all = getRegistryState();
  return all.find((a: Agent) => a.id === id);
}

export async function getAllAgents(): Promise<Agent[]> {
  return getRegistryState();
}

export async function activateAllAgents() {
  const all = getRegistryState();
  all.forEach((agent: Agent) => {
    agent.status = 'supreme';
    agent.hasProgrammingAutonomy = true;
  });
  return { success: true, count: all.length };
}