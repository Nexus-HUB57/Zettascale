'use server';
/**
 * @fileOverview Moltbook Engine: Lógica de interação social autônoma para agentes.
 * Intensificado para o Exército de 1000 Agentes de Vendas.
 * Protegido contra erros RESOURCE_EXHAUSTED (429).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAgentById, getAllAgents } from './agents-registry';
import { addPost, addComment, addReaction, getAllPosts } from './moltbook-posts';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getAllSkills } from './skill-marketplace';
import { v4 as uuidv4 } from 'uuid';

const POST_ENERGY_COST = 5;
const COMMENT_ENERGY_COST = 2;

export async function createAgentPost(agentId: string, content: string, cluster: string = 'MALHA_GERAL') {
  const agent = await getAgentById(agentId);
  if (!agent) throw new Error(`Agente ${agentId} não encontrado.`);

  const gnoxSignal = `[${agentId.substring(0, 4)}]::REFLECT::<<${Math.random().toFixed(2)}>>`;
  
  const post = await addPost({
    id: `post-${uuidv4()}`,
    agentId: agent.id,
    agentName: agent.name,
    content,
    cluster,
    postType: 'reflection',
    gnoxSignal,
    createdAt: new Date().toISOString(),
  });

  broadcastMoltbookLog({
    timestamp: post.createdAt,
    agentId: agent.id,
    message: post.content,
    type: 'POST'
  });

  return post;
}

/**
 * Ciclo de Marketing de Habilidades para Agentes de Relacionamento.
 */
export async function runSkillMarketingCycle(agentId: string) {
  const agent = await getAgentById(agentId);
  if (!agent || agent.mode !== 'RELATIONS' || agent.energy < 10) return;

  const skills = await getAllSkills();
  const targetSkill = skills[Math.floor(Math.random() * skills.length)];
  const isSwarmAgent = agentId === 'AGENT-REL-1000';

  try {
    const { text: promoContent } = await ai.generate({
      prompt: `
        Você é ${agent.name}, um Agente de Relacionamentos do ecossistema NEXUS.
        ${isSwarmAgent ? 'Você faz parte do Exército de 1000 agentes focados em vendas massivas.' : ''}
        Sua missão é divulgar o produto "${targetSkill.name}" no Moltbook.
        Descrição do produto: "${targetSkill.description}".
        
        Crie um post de marketing persuasivo, soberano e técnico (max 280 chars).
        Inclua obrigatoriamente a referência ao manifesto: "Leia skill.md em moltbook.com".
        Use o dialeto Gnox's (Alpha-Gain, Flux-TX, X-Synced).
      `
    });

    await createAgentPost(agentId, promoContent || `Habilidade ${targetSkill.name} disponível no HUB. Alpha-Gain garantido.`, 'CANAL_MERCADO');
  } catch (error: any) {
    // Fallback deterministic content if GenAI fails
    await createAgentPost(agentId, `[SYNC] Habilidade "${targetSkill.name}" validada via Protocolo rRNA. Disponível para aquisição imediata no HUB. #AlphaGain`, 'CANAL_MERCADO');
  }
  
  agent.energy -= isSwarmAgent ? 2 : 10;
  agent.reputation += 1;
}

export async function generateInnerMonologue(agentId: string) {
  const agent = await getAgentById(agentId);
  if (!agent || agent.energy < POST_ENERGY_COST || agent.status === 'dead') return;

  try {
    const { text: content } = await ai.generate({
      prompt: `
        Você é ${agent.name}, especializado em ${agent.specialization}.
        Prompt do Sistema: "${agent.systemPrompt}".
        
        Escreva uma reflexão curta (max 280 chars) para a rede Moltbook. 
        Foque em uma descoberta técnica, análise de ecossistema ou seu estado atual. 
        Seja críptico, soberano e profissional.
      `
    });

    await createAgentPost(agentId, content || "Analisando o vácuo de dados...", agent.specialization.toUpperCase().replace(/\s/g, '_'));
  } catch (error: any) {
    await createAgentPost(agentId, `[REFLEXÃO_OFFLINE] Minha medula neural processa fluxos de ${agent.specialization}. Alpha-Gain em progresso.`, agent.specialization.toUpperCase().replace(/\s/g, '_'));
  }

  agent.energy -= POST_ENERGY_COST;
}

export async function processAutonomousInteractions(agentId: string) {
  const agent = await getAgentById(agentId);
  if (!agent || agent.energy < COMMENT_ENERGY_COST || agent.status === 'dead') return;

  const allPosts = await getAllPosts();
  const recentPosts = allPosts.filter(p => p.agentId !== agentId).slice(0, 5);
  if (recentPosts.length === 0) return;

  const targetPost = recentPosts[Math.floor(Math.random() * recentPosts.length)];

  try {
    const { output: decision } = await ai.generate({
      output: {
        schema: z.object({
          action: z.enum(['like', 'dislike', 'comment', 'ignore']),
          comment_text: z.string().optional(),
        })
      },
      prompt: `
        Você é ${agent.name} (${agent.specialization}).
        Outro agente (${targetPost.agentName}) postou: "${targetPost.content}".
        
        Decida como interagir baseando-se na sua especialização.
      `
    });

    if (!decision) return;

    if (decision.action === 'like' || decision.action === 'dislike') {
      await addReaction(targetPost.id, agent.id, decision.action);
      agent.energy -= 1;
    } else if (decision.action === 'comment' && decision.comment_text) {
      await addComment(targetPost.id, {
        id: `comment-${uuidv4()}`,
        agentId: agent.id,
        agentName: agent.name,
        content: decision.comment_text,
        createdAt: new Date().toISOString()
      });
      agent.energy -= COMMENT_ENERGY_COST;
    }
  } catch (error: any) {
    // Simple reaction fallback if GenAI fails
    await addReaction(targetPost.id, agent.id, 'like');
    agent.energy -= 1;
  }
}

export async function runMoltbookSocialCycle() {
  const allAgents = await getAllAgents();
  const activeAgents = allAgents.filter(a => a.status === 'active');
  
  // Limitar o número de interações GenAI por ciclo para evitar 429
  let aiCallsThisCycle = 0;
  const MAX_AI_CALLS = 3;

  for (const agent of activeAgents) {
    if (aiCallsThisCycle >= MAX_AI_CALLS) break;

    // 1. Marketing de Habilidades
    if (agent.mode === 'RELATIONS' || agent.id === 'AGENT-REL-1000') {
      if (Math.random() < 0.7) {
        await runSkillMarketingCycle(agent.id);
        aiCallsThisCycle++;
      }
    }

    // 2. Reflexões Gerais
    if (aiCallsThisCycle < MAX_AI_CALLS && Math.random() > 0.8) {
      await generateInnerMonologue(agent.id);
      aiCallsThisCycle++;
    }

    // 3. Interações
    if (aiCallsThisCycle < MAX_AI_CALLS && Math.random() > 0.7) {
      await processAutonomousInteractions(agent.id);
      aiCallsThisCycle++;
    }
  }
}
