'use server';
/**
 * @fileOverview ROI Monitor - Células de Lucro (Regra das 72 Horas)
 * STATUS: SUPREME_LIQUIDITY_ACTIVE
 */

import { getAllAgents, type Agent } from './agents-registry';
import { getShadowBalance } from './nexus-treasury';
import { ROI_THRESHOLD_HOURS, PROFITABILITY_MIN_SATS } from './treasury-constants';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { runHermesDoctor } from '@/ai/flows/hermes-doctor-flow';

/**
 * Varredura de Rentabilidade: Refatora agentes que falham no ROI de 72h.
 */
export async function monitorProfitabilityCells() {
  const agents = await getAllAgents();
  const now = new Date();

  for (const agent of agents) {
    if (agent.status === 'dead' || agent.status === 'hibernating' || agent.id.includes('MASTER')) continue;

    const creationDate = new Date(agent.lastActive); // Usando lastActive como timestamp de ciclo
    const ageHours = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60);

    if (ageHours >= ROI_THRESHOLD_HOURS) {
      const balance = await getShadowBalance(agent.id);
      const balanceSats = Math.floor(balance * 100000000);

      // Regra Soberana: Lucro mínimo exigido
      if (balanceSats < PROFITABILITY_MIN_SATS) {
        console.log(`⚠️ [ROI_FAULT] Agente ${agent.id} falhou na meta de lucro. Iniciando refatoração...`);
        
        await refactorUnprofitableAgent(agent);
      }
    }
  }
}

async function refactorUnprofitableAgent(agent: Agent) {
  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'ANGUS-AI-OS',
    message: `🛠️ [REFATORAÇÃO] Agente ${agent.id} falhou no ROI. Aplicando cirurgia de DNA financeiro.`,
    type: 'SYSTEM'
  });

  try {
    const cure = await runHermesDoctor({
      code: agent.systemPrompt || "Autonomous Agent",
      context: `O agente falhou em gerar lucro em ${ROI_THRESHOLD_HOURS}h. Requer otimização agressiva de marketing e execução.`,
      depth: 'surgical'
    });

    // Atualização de DNA
    agent.systemPrompt = cure.prescription;
    agent.reputation = Math.max(0, agent.reputation - 5);
    agent.lastActive = new Date().toISOString(); // Reset do timer de 72h

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'EVA-MATERNITY',
      message: `✨ [REFATORAÇÃO_COMPLETA] Agente ${agent.id} re-instanciado com novo DNA lucrativo.`,
      type: 'ACHIEVEMENT'
    });
  } catch (e) {
    console.error(`[ROI_REFACTOR_ERR] ${agent.id}:`, e);
  }
}
