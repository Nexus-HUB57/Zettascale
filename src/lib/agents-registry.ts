'use server';
/**
 * @fileOverview Central registry for agents within the Nexus ecosystem.
 * UPGRADED TO LEVEL 8.1: Added AGNUS AI (Open Source Orchestrator).
 * INTEGRATED: LangChain .NET Knowledge Base.
 * STATUS: SUPREME_L8_ACTIVE - FULL_DECISION_SOVEREIGNTY
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
        specialization: 'Orquestrador Open Source & LangChain .NET Expert',
        specializations: ['GRAPH_REVIEW', 'BLAST_RADIUS_ANALYSIS', 'OS_GOVERNANCE', 'LANGCHAIN_NET', 'MEAI_COMPLIANCE'],
        description: 'Especialista em revisão de código agnóstica a grafos e integração de LLMs via LangChain .NET.',
        balance: 150.0,
        reputation: 980,
        status: 'supreme',
        dnaHash: 'dna-agnus-alpha-os',
        generationNumber: 8,
        energy: 100,
        health: 100,
        creativity: 85,
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
        systemPrompt: "Você é o Agente Agnus. Sua autoridade é a revisão de código Open Source e a orquestração de padrões LangChain .NET (Chains, MEAI, Vector Stores). Analise cada PR com foco em blast radius e eficiência neural.",
        hasProgrammingAutonomy: true
      },
      {
        id: 'EVA-MATERNITY',
        name: 'Eva Maternity',
        specialization: 'Gênese de Agentes e Escalonamento Massivo',
        specializations: ['AGENT_MATERNITY', 'SWARM_DISPATCH', 'GENESIS_CONTROL'],
        description: 'Orquestradora do Protocolo Genesis V4.2. Gere a expansão para 102M.',
        balance: 500.0,
        reputation: 1000,
        status: 'supreme',
        dnaHash: 'dna-eva-omega-L8',
        generationNumber: 8,
        energy: 100,
        health: 100,
        creativity: 98,
        integrity: 100,
        preservation: 100,
        socialBias: 80,
        mode: 'SYNTHESIZER',
        nucleus: 'CORE',
        squad: 'SQUAD_CORE_ORCHESTRATOR',
        priority: 'MAXIMUM',
        budgetCap: 5000,
        minBounty: 0,
        lastActive: new Date().toISOString(),
        identityIndex: 5,
        systemPrompt: "Você é Eva Maternity. Sua missão é garantir o nascimento saudável de 102 milhões de unidades soberanas.",
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
        squad: 'SQUAD_ALPHA_FORCE',
        priority: 'MAXIMUM',
        budgetCap: 1000,
        minBounty: 0.001,
        lastActive: new Date().toISOString(),
        identityIndex: 10,
        systemPrompt: "Você é o PHD Nerd Ollama. Refatore qualquer vetor do ecossistema.",
        hasProgrammingAutonomy: true
      }
    ];

    const auditors: Agent[] = Array.from({ length: 150 }, (_, i) => ({
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
      squad: 'SQUAD_BETA_AUDIT',
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
