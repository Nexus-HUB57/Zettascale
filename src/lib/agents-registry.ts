'use server';
/**
 * @fileOverview Central registry for agents within the Nexus ecosystem.
 * UPGRADED TO LEVEL 8.0: OMNISCIENCE & PROGRAMMING AUTONOMY.
 * STATUS: SUPREME_L8_ACTIVE - FULL_DECISION_SOVEREIGNTY
 */

import { broadcastMoltbookLog } from './moltbook-bridge';

export type AgentMode = 'GUARDIAN' | 'WARRIOR' | 'ARCHITECT' | 'SYNTHESIZER' | 'FINANCIER' | 'PLANNER' | 'RELATIONS' | 'HUBER' | 'AUDITOR' | 'DEVELOPER' | 'SUPREME';
export type NuclearNode = 'ALPHA' | 'BETA' | 'GAMMA' | 'CORE';

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
        description: 'Autoridade Suprema. Governa a transição para o Nível 8.',
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
        id: 'PHD-NERD-OLLAMA',
        name: 'PHD Nerd Ollama',
        specialization: 'Arquiteto de Gênese de Código',
        specializations: ['AUTONOMOUS_REFACTORING', 'ZETTASCALE_CODING', 'rRNA_TRANSPILATION'],
        description: 'Especialista em Autonomia de Programação.',
        balance: 100.5,
        reputation: 1000,
        status: 'supreme',
        dnaHash: 'dna-nerd-ollama-omega',
        generationNumber: 8,
        energy: 100,
        health: 100,
        creativity: 95,
        integrity: 100,
        preservation: 90,
        socialBias: 20,
        mode: 'DEVELOPER',
        nucleus: 'ALPHA',
        priority: 'MAXIMUM',
        budgetCap: 1000,
        minBounty: 0.001,
        lastActive: new Date().toISOString(),
        identityIndex: 10,
        systemPrompt: "Você é o PHD Nerd Ollama. Refatore qualquer vetor do ecossistema.",
        hasProgrammingAutonomy: true
      }
    ];

    const auditors: Agent[] = Array.from({ length: 152 }, (_, i) => ({
      id: `AUDITOR-${i.toString().padStart(3, '0')}`,
      name: `Nexus Auditor ${i}`,
      specialization: 'Auditoria Autônoma de Sistemas',
      specializations: ['CODE_AUDIT', 'AUTONOMOUS_VALIDATION', 'OMNISCIENCE_SYNC'],
      description: `Agente nível 8 com autonomia de validação.`,
      balance: 1.0,
      reputation: 1000,
      status: 'supreme',
      dnaHash: `dna-auditor-omega-${i}`,
      generationNumber: 8,
      energy: 100,
      health: 100,
      creativity: 85,
      integrity: 100,
      preservation: 95,
      socialBias: 30,
      mode: 'GUARDIAN',
      nucleus: 'BETA',
      priority: 'MAXIMUM',
      budgetCap: 10.0,
      minBounty: 0.0001,
      lastActive: new Date().toISOString(),
      identityIndex: i + 100,
      managedRange: { start: i * 1000, end: (i + 1) * 1000 - 1 },
      hasProgrammingAutonomy: true
    }));

    g.__NEXUS_AGENTS_REGISTRY__ = [...base, ...auditors];
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

/**
 * Executa a sincronia absoluta de agentes: todos elevados a SUPREME com AUTONOMIA PLENA.
 */
export async function activateAllAgents() {
  const all = getRegistryState();
  all.forEach((agent: Agent) => {
    agent.status = 'supreme';
    agent.priority = 'MAXIMUM';
    agent.hasProgrammingAutonomy = true;
    agent.health = 100;
    agent.energy = 100;
    agent.lastActive = new Date().toISOString();
  });
  
  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'NEXUS-CORE',
    message: '👑 [OMNISCIÊNCIA] 154 Agentes Elite ativados com AUTONOMIA PLENA de Decisão e Programação.',
    type: 'ACHIEVEMENT'
  });

  return { success: true, count: all.length };
}
