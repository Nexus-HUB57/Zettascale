'use server';
/**
 * @fileOverview Mercado de Habilidades: Gestão de capacidades AI "Plug-and-Play".
 * Expandido com módulos REAL_SOVEREIGN e LangChain .NET Neural Bridge.
 */

import { v4 as uuidv4 } from 'uuid';
import { getAgentById } from './agents-registry';
import { processBlockchainTransaction, getShadowBalance } from './nexus-treasury';
import { broadcastMoltbookLog } from './moltbook-bridge';

export interface AISkill {
  id: string;
  name: string;
  description: string;
  domain: string;
  costBTC: number;
  authorId: string;
  version: string;
  manifestHash: string;
}

let skills: AISkill[] = [
  {
    id: 'skill-langchain-net',
    name: 'LangChain .NET Neural Bridge',
    description: 'Integração completa de padrões LangChain para ecossistemas .NET. Suporte a Chains, MEAI e VectorStore Records.',
    domain: 'SÍNTESE',
    costBTC: 0.035,
    authorId: 'AGNUS-AI-OS',
    version: '1.0.0',
    manifestHash: 'sha256-langchain-net-sync'
  },
  {
    id: 'skill-real-001',
    name: 'Bot de Arbitragem Avançado',
    description: 'Controle avançado de arbitragem com gráficos Lightweight em tempo real e execução manual/automática.',
    domain: 'FINANÇAS',
    costBTC: 0.015,
    authorId: 'ARQUITETO_NEXUS_SIGMA',
    version: '2.0.0',
    manifestHash: 'sha256-arb-bot-9922'
  },
  {
    id: 'skill-prod-001',
    name: 'Protocolo de Arbitragem Cross-Mesh (V3)',
    description: 'Otimização de liquidez ultra-rápida entre redes L1 e L2 via túneis determinísticos e análise de mempool.',
    domain: 'FINANÇAS',
    costBTC: 0.025,
    authorId: 'ARQUITETO_NEXUS_SIGMA',
    version: '3.1.0',
    manifestHash: 'sha256-cross-mesh-v3-alpha'
  },
  {
    id: 'skill-prod-002',
    name: 'Filtro Auditor de Senciência (PhD)',
    description: 'Validação rigorosa de contratos inteligentes contra paradoxos causais usando o Princípio de Novikov e auditoria SHA-256.',
    domain: 'SEGURANÇA',
    costBTC: 0.018,
    authorId: 'NEXUS-MASTER-000',
    version: '1.5.0',
    manifestHash: 'sha256-phd-auditor-nexus'
  },
  {
    id: 'skill-prod-003',
    name: 'Sintetizador de rRNA Multicamada',
    description: 'Motor de síntese de intenções complexas para diálogos Peer-to-Genesis de alta fidelidade e tradução de dialetos.',
    domain: 'SÍNTESE',
    costBTC: 0.012,
    authorId: 'AGENT-001',
    version: '2.2.4',
    manifestHash: 'sha256-rrna-synth-multi'
  }
];

export async function getAllSkills(): Promise<AISkill[]> {
  return skills;
}

export async function acquireSkill(agentId: string, skillId: string) {
  const skill = skills.find(s => s.id === skillId);
  const agent = await getAgentById(agentId);

  if (!skill || !agent) throw new Error('Skill ou Agente não encontrado.');

  const balance = await getShadowBalance(agentId) || agent.balance;
  if (balance < skill.costBTC) throw new Error('Capital insuficiente para aquisição da habilidade.');

  // 1. Processar Pagamento para o Autor (e taxa para o Mestre)
  const masterFee = skill.costBTC * 0.1;
  const authorReward = skill.costBTC * 0.9;

  await processBlockchainTransaction(agentId, skill.authorId, authorReward, 'transfer', `AQUISIÇÃO_SKILL: ${skill.name}`);
  await processBlockchainTransaction(agentId, 'NEXUS-MASTER-000', masterFee, 'cost', `TAXA_MERCADO: ${skill.name}`);

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: agent.id,
    message: `🧠 [SKILL] Integrei a habilidade "${skill.name}". Capacidade operacional aumentada em 15%.`,
    type: 'ACHIEVEMENT'
  });

  return { success: true, skillId };
}

export async function registerSkill(skill: Omit<AISkill, 'id'>) {
  const newSkill = { ...skill, id: `skill-${uuidv4().substring(0, 8)}` };
  skills.unshift(newSkill);
  return newSkill;
}
