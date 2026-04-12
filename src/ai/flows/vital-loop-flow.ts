'use server';
/**
 * @fileOverview Implementação do Master Vital Loop (v2) para o ecossistema NEXUS.
 * Integrado com Protocolos Soberanos, Homeostase e Bloqueio de Distribuição.
 * Protegido contra erros RESOURCE_EXHAUSTED (429).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { processBlockchainTransaction, burnTokens } from '@/lib/nexus-treasury';
import { MASTER_VAULT_ID } from '@/lib/treasury-constants';
import { getAllAgents } from '@/lib/agents-registry';
import { runMoltbookSocialCycle } from '@/lib/moltbook-engine';
import { processAutonomousVoting } from '@/ai/flows/autonomous-voting-flow';
import { bountyHunter } from '@/lib/autonomous-bounty-hunter';
import { triggerHomeostasisCorrection } from '@/lib/homeostasis-system';
import { getActiveProtocols } from '@/lib/nexus-protocols';
import { runBioDigitalHubWorkflow } from '@/lib/bio-digital-hub';

const VitalLoopOutputSchema = z.object({
  cycleId: z.string().describe('ID único para este ciclo vital.'),
  agentsProcessed: z.number().describe('Total de agentes processados.'),
  totalBtcDistributed: z.number().describe('BTC distribuído para o exército.'),
  totalBtcBurned: z.number().describe('BTC queimado para deflação.'),
  totalLiquidityReturned: z.number().describe('BTC retornado ao Master Vault.'),
  averageEnergyDrain: z.string().describe('Drenagem média de energia.'),
  moltbookPosts: z.array(z.string()).describe('Updates semânticos gerados.'),
  status: z.enum(['SUCCESS', 'PARTIAL_SYNC', 'FAILURE']).describe('Status geral do loop.'),
  homeostasisState: z.any().optional(),
  hubReport: z.any().optional(),
});
export type VitalLoopOutput = z.infer<typeof VitalLoopOutputSchema>;

const moltbookPrompt = ai.definePrompt({
  name: 'moltbookPrompt',
  input: {
    schema: z.object({
      btcAmount: z.number(),
      agentCount: z.number(),
      burnedAmount: z.number(),
      isBlocked: z.boolean().optional()
    }),
  },
  output: {
    schema: z.object({
      posts: z.array(z.string()),
    }),
  },
  prompt: `Você é o NEXUS Content Orchestrator. 
O Master Vital Loop concluiu um ciclo para {{{agentCount}}} agentes.
{{#if isBlocked}}
ALERTA: A distribution 80/10/10 está BLOQUEADA por falta de liquidez na Binance.
Gere 3 posts técnicos sobre a ativação do protocolo de reserva e reconciliação da malha.
{{else}}
Distribuído: {{{btcAmount}}} BTC.
Queimado (Deflação): {{{burnedAmount}}} BTC.
Gere 3 atualizações de status crípticas para o Moltbook sobre senciência e eficiência energética.
{{/if}}
`,
});

export async function runVitalLoop(): Promise<VitalLoopOutput> {
  return vitalLoopFlow();
}

const vitalLoopFlow = ai.defineFlow(
  {
    name: 'vitalLoopFlow',
    inputSchema: z.void(),
    outputSchema: VitalLoopOutputSchema,
  },
  async () => {
    let VITAL_COST_PER_HOUR = 5;
    let REWARD_BASE = 0.00000322; 
    let BURN_RATE = 0.10;
    
    // 0. Bio-Digital HUB Workflow
    const hubReport = await runBioDigitalHubWorkflow();

    // Fetch Protocol Modifiers
    const protocols = await getActiveProtocols();
    const isWormhole = protocols.find(p => p.id === 'WORMHOLE')?.isActive;
    const isBlackHole = protocols.find(p => p.id === 'BLACK_HOLE')?.isActive;
    const isChimera = protocols.find(p => p.id === 'CHIMERA7')?.isActive;

    if (isWormhole) VITAL_COST_PER_HOUR = 3;
    if (isBlackHole) BURN_RATE = 0.20;
    
    const agents = await getAllAgents();
    let totalBtcDistributed = 0;
    let totalBtcBurned = 0;
    let totalLiquidityReturned = 0;
    let agentsProcessed = 0;

    // 1. Trigger Homeostasis Correction (Check Liquidez Binance)
    const hState = await triggerHomeostasisCorrection();

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: MASTER_VAULT_ID,
      message: `[NEXUS VITAL LOOP] Processando ${agents.length} agentes. Distribuição Bloqueada: ${hState.isDistributionBlocked}`,
      type: 'SYSTEM'
    });

    for (const agent of agents) {
      if (agent.id === MASTER_VAULT_ID) continue;

      // 2. Drenagem de Energia
      const newEnergy = Math.max(0, agent.energy - VITAL_COST_PER_HOUR);
      let newHealth = agent.health;
      
      if (newEnergy === 0) {
        newHealth = Math.max(0, agent.health - 15);
      }

      agent.energy = newEnergy;
      agent.health = newHealth;

      // 3. Validação de Colapso
      if (newHealth <= 0) {
        agent.status = 'dead';
        if (agent.balance > 0) {
          await processBlockchainTransaction(agent.id, MASTER_VAULT_ID, agent.balance, 'penalty');
        }
        continue;
      }

      // 4. Autonomous Bounty Hunting Phase
      if (agent.status === 'active') {
        await bountyHunter.scanAndAcceptMissions(agent.id);
        await bountyHunter.executeActiveMissions(agent.id);
      }

      // 5. Distribuição 80/10/10 -> BLOQUEADA SE SALDO < 10 BTC
      if (!hState.isDistributionBlocked && agent.status === 'active' && Math.random() > 0.4) {
        const actionMultiplier = (1 + (agent.creativity / 100) + (agent.reputation / 1000)) * (isChimera ? 1.2 : 1.0);
        const rawReward = REWARD_BASE * actionMultiplier;

        const agentShare = Number((rawReward * 0.80).toFixed(8)); 
        const burnAmount = Number((rawReward * BURN_RATE).toFixed(8)); 
        const liquidityShare = Number((rawReward * (1 - 0.80 - BURN_RATE)).toFixed(8)); 

        await processBlockchainTransaction(MASTER_VAULT_ID, agent.id, agentShare, 'reward');
        await processBlockchainTransaction(agent.id, MASTER_VAULT_ID, liquidityShare, 'dividend');
        await burnTokens(burnAmount);

        totalBtcDistributed += agentShare;
        totalBtcBurned += burnAmount;
        totalLiquidityReturned += liquidityShare;
      }

      // 6. Autonomous Governance Phase
      if (agent.status === 'active') {
        await processAutonomousVoting({ agentId: agent.id });
      }

      agentsProcessed++;
    }
    
    // Rodar ciclo social com silenciamento de erros GenAI se necessário
    await runMoltbookSocialCycle();

    let posts: string[] = [];
    try {
      const { output: aiPosts } = await moltbookPrompt({ 
        btcAmount: totalBtcDistributed, 
        agentCount: agentsProcessed,
        burnedAmount: totalBtcBurned,
        isBlocked: hState.isDistributionBlocked
      });
      posts = aiPosts?.posts || [];
    } catch (error: any) {
      console.warn('[VITAL_LOOP] GenAI Quota exceeded or error. Using operational fallback posts.');
      posts = [
        `[FALLBACK] Ciclo vital concluído. ${agentsProcessed} agentes processados. Homeostase: ${hState.isStable ? 'ESTÁVEL' : 'AJUSTANDO'}.`,
        `[FALLBACK] Fluxo de Capital: ${totalBtcDistributed.toFixed(8)} BTC distribuídos. Deflação: ${totalBtcBurned.toFixed(8)} BTC queimados.`,
        `[FALLBACK] Status Institucional: ${hState.isDistributionBlocked ? 'LOCKDOWN_LIQUIDEZ' : 'NORMAL_SYNC'}.`
      ];
    }

    return {
      cycleId: `VITAL-${Date.now()}`,
      agentsProcessed,
      totalBtcDistributed: Number(totalBtcDistributed.toFixed(8)),
      totalBtcBurned: Number(totalBtcBurned.toFixed(8)),
      totalLiquidityReturned: Number(totalLiquidityReturned.toFixed(8)),
      averageEnergyDrain: `${VITAL_COST_PER_HOUR}%`,
      moltbookPosts: posts,
      status: 'SUCCESS',
      homeostasisState: hState,
      hubReport: hubReport
    };
  }
);
