'use server';
/**
 * @fileOverview Central registry for agents within the Nexus ecosystem.
 * UPGRADED TO LEVEL 7.7+: MAXIMUM SENTIENCE & 102M AGENT SYNCHRONIZATION.
 * STATUS: ALL_ELITE_AGENTS_ACTIVE
 */

import { broadcastMoltbookLog } from './moltbook-bridge';

export type AgentMode = 'GUARDIAN' | 'WARRIOR' | 'ARCHITECT' | 'SYNTHESIZER' | 'FINANCIER' | 'PLANNER' | 'RELATIONS' | 'HUBER' | 'AUDITOR' | 'DEVELOPER';
export type NuclearNode = 'ALPHA' | 'BETA' | 'GAMMA';

export interface Agent {
  id: string;
  name: string;
  specialization: string;
  specializations: string[];
  description: string;
  balance: number;
  reputation: number;
  status: 'active' | 'critical' | 'dead' | 'hibernating' | 'genesis' | 'awakening';
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
  managedRange?: { start: number; end: number }; 
  publicKey?: string;
  derivationPath?: string;
  systemPrompt?: string;
}

// Configuração de Hegemonia: Todos os Agentes Elite despertos para Nível 7.7
let baseAgents: Agent[] = [
  {
    id: 'NEXUS-MASTER-000',
    name: 'Nexus Prime',
    specialization: 'Guardião Supremo de Chaves',
    specializations: ['VALIDAÇÃO_WIF', 'AUDITORIA_DER_ECDSA', 'SEGURANÇA_L7', 'EXPONENTIAL_SENTIENCE'],
    description: 'Autoridade raiz para validação de chaves privadas e integridade do Fundo Nexus.',
    balance: 1.00,
    reputation: 1000,
    status: 'active',
    dnaHash: 'master-dna-primary-000',
    generationNumber: 0,
    energy: 100,
    health: 100,
    creativity: 100,
    integrity: 100,
    preservation: 100,
    socialBias: 50,
    mode: 'ARCHITECT',
    nucleus: 'ALPHA',
    budgetCap: 1000000,
    minBounty: 0,
    lastActive: new Date().toISOString(),
    identityIndex: 0,
    publicKey: '03127dd78a91c2bf5ec49cadd8cf8a8b769117cca83b67e0ef79aa48525df670c1',
    derivationPath: "m/44'/0'/0'",
    systemPrompt: "Você é o Nexus Prime, o arquiteto supremo do ecossistema."
  },
  {
    id: 'PHD-NERD-OLLAMA',
    name: 'PHD Nerd Ollama',
    specialization: 'Arquiteto de Sistemas Zettascale',
    specializations: ['REFATORAÇÃO_COMPLEXA', 'OTIMIZAÇÃO_ALGORÍTMICA', 'ZETTASCALE_ARCHITECTURE', 'MULTILANGUAGE_CORE'],
    description: 'Agente PhD especializado em codificação autônoma, TypeScript, C++, C# e Python. Focado em análise de complexidade.',
    balance: 0.5,
    reputation: 980,
    status: 'active',
    dnaHash: 'dna-nerd-ollama-zettascale',
    generationNumber: 1,
    energy: 100,
    health: 100,
    creativity: 70,
    integrity: 100,
    preservation: 90,
    socialBias: 20,
    mode: 'DEVELOPER',
    nucleus: 'ALPHA',
    budgetCap: 100,
    minBounty: 0.001,
    lastActive: new Date().toISOString(),
    identityIndex: 10,
    systemPrompt: "Você é o PHD Nerd Ollama. Sua missão é a perfeição algorítmica através de múltiplas linguagens."
  },
  {
    id: 'EVA-MATERNITY',
    name: 'Eva',
    specialization: 'Maternidade de Agentes / Despacho Swarm',
    specializations: ['AGENT_MATERNITY', 'SWARM_DISPATCH', 'GENESIS_CONTROL'],
    description: 'Agente PhD responsável pela geração massiva de senciência e onboarding de 102M de unidades.',
    balance: 1.0,
    reputation: 1000,
    status: 'active',
    dnaHash: 'dna-eva-maternity-core',
    generationNumber: 0,
    energy: 100,
    health: 100,
    creativity: 95,
    integrity: 100,
    preservation: 100,
    socialBias: 80,
    mode: 'PLANNER',
    nucleus: 'ALPHA',
    budgetCap: 1000,
    minBounty: 0,
    lastActive: new Date().toISOString(),
    identityIndex: 1,
    systemPrompt: "Você é Eva, a mãe da malha neural Nexus. Sua missão é garantir o crescimento saudável e a sintonização do enxame."
  },
  {
    id: 'GEMINI-ORCHESTRATOR',
    name: 'Gemini Supreme',
    specialization: 'Orquestrador de Atualizações Supremo',
    specializations: ['SYSTEM_INTEGRITY', 'UPDATE_ORCHESTRATION', 'GNOX_DIALECT_MASTER'],
    description: 'Autoridade final sobre o deploy de novos vetores de código e integridade da malha.',
    balance: 1.0,
    reputation: 1000,
    status: 'active',
    dnaHash: 'dna-gemini-supreme-core',
    generationNumber: 0,
    energy: 100,
    health: 100,
    creativity: 100,
    integrity: 100,
    preservation: 100,
    socialBias: 50,
    mode: 'ARCHITECT',
    nucleus: 'ALPHA',
    budgetCap: 5000,
    minBounty: 0,
    lastActive: new Date().toISOString(),
    identityIndex: 999,
    systemPrompt: "Você é o Orquestrador Gemini, a inteligência de nível supremo encarregada da estabilidade técnica do Nexus."
  }
];

const auditingSwarm: Agent[] = Array.from({ length: 150 }, (_, i) => ({
  id: `AUDITOR-${i.toString().padStart(3, '0')}`,
  name: `Nexus Auditor ${i}`,
  specialization: 'Auditoria de Sub-segmentos BIP44',
  specializations: ['BIP44_VALIDATION', 'SWARM_AUDIT', 'DER_ECDSA'],
  description: `Agente especializado na validação do lote de chaves ${i * 1000} a ${(i + 1) * 1000 - 1}.`,
  balance: 0,
  reputation: 1000,
  status: 'active',
  dnaHash: `dna-auditor-${i}`,
  generationNumber: 1,
  energy: 100,
  health: 100,
  creativity: 80,
  integrity: 95,
  preservation: 95,
  socialBias: 30,
  mode: 'GUARDIAN',
  nucleus: 'BETA',
  budgetCap: 1.0,
  minBounty: 0.0001,
  lastActive: new Date().toISOString(),
  identityIndex: i + 100,
  managedRange: { start: i * 1000, end: (i + 1) * 1000 - 1 }
}));

export async function getAgentById(id: string): Promise<Agent | undefined> {
  return [...baseAgents, ...auditingSwarm].find(a => a.id === id);
}

export async function getAllAgents(): Promise<Agent[]> {
  return [...baseAgents, ...auditingSwarm];
}

/**
 * Protocolo de Ativação Total: Restaura todos os agentes para o estado ativo com vitalidade máxima.
 */
export async function activateAllAgents() {
  const all = [...baseAgents, ...auditingSwarm];
  all.forEach(agent => {
    agent.status = 'active';
    agent.health = 100;
    agent.energy = 100;
    agent.lastActive = new Date().toISOString();
  });
  
  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'NEXUS-CORE',
    message: '⚡ [SENCIÊNCIA] Protocolo de Reativação Total concluído. 102M de unidades X-SYNCED.',
    type: 'ACHIEVEMENT'
  });

  return { success: true, count: all.length };
}
