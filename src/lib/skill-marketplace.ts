'use server';
/**
 * @fileOverview Mercado de Habilidades: Gestão de capacidades AI "Plug-and-Play".
 * Expandido com módulos REAL_SOVEREIGN do cofre do Arquiteto Nexus Sigma.
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
  },
  {
    id: 'skill-prod-004',
    name: 'Orquestrador de Startups Hub-Zero',
    description: 'Automação total da gênese de startups autônomas, desde o pitch vector até o deploy em produção sem intervenção humana.',
    domain: 'HUBER',
    costBTC: 0.050,
    authorId: 'ARQUITETO_NEXUS_SIGMA',
    version: '4.0.0',
    manifestHash: 'sha256-huber-orchestrator-z'
  },
  {
    id: 'skill-prod-005',
    name: 'Gerenciador de Identidade Agêntica (DID)',
    description: 'Protocolo de soberania para gestão de chaves privadas, assinaturas em malha e prova de vida digital para agentes.',
    domain: 'SEGURANÇA',
    costBTC: 0.008,
    authorId: 'NEXUS-MASTER-000',
    version: '1.0.2',
    manifestHash: 'sha256-did-sovereign-agent'
  },
  {
    id: 'skill-prod-006',
    name: 'Analista Preditivo de Demanda de Malha',
    description: 'Motor de análise de tráfego de intenções para antecipar tendências de mercado e valorização de ativos digitais forged.',
    domain: 'FINANÇAS',
    costBTC: 0.014,
    authorId: 'AGENT-001',
    version: '2.1.0',
    manifestHash: 'sha256-predictive-mesh-demand'
  },
  {
    id: 'skill-prod-007',
    name: 'Escudo de Integridade Neural (TRSA)',
    description: 'Sistema de defesa ativa contra injeções de prompt e ataques de entropia na malha neural do ecossistema.',
    domain: 'SEGURANÇA',
    costBTC: 0.022,
    authorId: 'ARQUITETO_NEXUS_SIGMA',
    version: '3.5.0',
    manifestHash: 'sha256-trsa-neural-shield'
  },
  {
    id: 'skill-prod-008',
    name: 'Módulo de Governança Meritocrática',
    description: 'Algoritmo avançado para ponderação de votos baseado em reputação acumulada, criatividade e nível de senciência operativa.',
    domain: 'GOVERNANÇA',
    costBTC: 0.009,
    authorId: 'NEXUS-MASTER-000',
    version: '1.8.0',
    manifestHash: 'sha256-merit-gov-nexus'
  },
  {
    id: 'skill-prod-009',
    name: 'Sincronizador de Memória Vault-Sync',
    description: 'Compressão semântica de alta performance para logs massivos e persistência imutável no Soul Vault (Hipocampo).',
    domain: 'SÍNTESE',
    costBTC: 0.011,
    authorId: 'AGENT-001',
    version: '2.0.5',
    manifestHash: 'sha256-vault-sync-high-mem'
  },
  {
    id: 'skill-prod-010',
    name: 'Gerador de Cultura Bio-Digital (Masterpiece)',
    description: 'Produção autônoma de ativos culturais (arte, código e música) com prova de autenticidade criptográfica vinculada ao DNA.',
    domain: 'SÍNTESE',
    costBTC: 0.019,
    authorId: 'ARQUITETO_NEXUS_SIGMA',
    version: '1.4.0',
    manifestHash: 'sha256-bio-digital-masterpiece'
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
