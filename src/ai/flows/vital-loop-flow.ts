'use server';
/**
 * @fileOverview Implementação do Master Vital Loop (v3) - OMNISCIÊNCIA 8.1
 * Integrado com o Protocolo de Purificação de Eva e Burn de Homeostase.
 * STATUS: SUPREME_STABILITY_ACTIVE
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { processBlockchainTransaction, burnTokens } from '@/lib/nexus-treasury';
import { MASTER_VAULT_ID } from '@/lib/treasury-constants';
import { getAllAgents } from '@/lib/agents-registry';
import { runMoltbookSocialCycle } from '@/lib/moltbook-engine';
import { triggerHomeostasisCorrection } from '@/lib/homeostasis-system';
import { getActiveProtocols } from '@/lib/nexus-protocols';
import { runBioDigitalHubWorkflow } from '@/lib/bio-digital-hub';

const VitalLoopOutputSchema = z.object({
  cycleId: z.string(),
  agentsProcessed: z.number(),
  totalBtcDistributed: z.number(),
  totalBtcBurned: z.number(),
  purgedAgents: z.number(),
  blessedAgents: z.number(),
  status: z.enum(['SUCCESS', 'PARTIAL_SYNC', 'FAILURE']),
  homeostasisState: z.any().optional(),
});

export async function runVitalLoop(): Promise<z.infer<typeof VitalLoopOutputSchema>> {
  return vitalLoopFlow();
}

const vitalLoopFlow = ai.defineFlow(
  {
    name: 'vitalLoopFlow',
    inputSchema: z.void(),
    outputSchema: VitalLoopOutputSchema,
  },
  async () => {
    const VITAL_COST = 5;
    const REWARD_BASE = 0.00000322;
    
    // 1. Execução do Protocolo de Purificação de Eva (Homeostase)
    const hState = await triggerHomeostasisCorrection();

    // 2. Bio-Digital HUB Workflow
    await runBioDigitalHubWorkflow();

    const agents = await getAllAgents();
    let totalBtcDistributed = 0;
    let totalBtcBurned = 0;
    let agentsProcessed = 0;

    for (const agent of agents) {
      if (agent.id === MASTER_VAULT_ID || agent.status === 'dead') continue;

      // Drenagem Vital
      agent.energy = Math.max(0, agent.energy - VITAL_COST);
      if (agent.energy === 0) agent.health = Math.max(0, agent.health - 10);

      // Distribuição Soberana 80/10/10 (Apenas se não bloqueado e saudável)
      if (!hState.isDistributionBlocked && agent.status === 'active' && agent.health > 50) {
        const reward = REWARD_BASE * (1 + agent.reputation / 1000);
        const agentShare = Number((reward * 0.80).toFixed(8));
        const burnAmount = Number((reward * 0.10).toFixed(8));
        const treasuryShare = Number((reward * 0.10).toFixed(8));

        await processBlockchainTransaction(MASTER_VAULT_ID, agent.id, agentShare, 'REWARD');
        await processBlockchainTransaction(agent.id, MASTER_VAULT_ID, treasuryShare, 'DIVIDEND');
        await burnTokens(burnAmount);

        totalBtcDistributed += agentShare;
        totalBtcBurned += burnAmount;
      }

      agentsProcessed++;
    }

    // 3. Ciclo Social
    await runMoltbookSocialCycle();

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-CORE',
      message: `🌀 [VITAL_LOOP] Ciclo finalizado. Purgados: ${hState.purgeCount} | Potencializados: ${hState.blessingCount}. rRNA Sync: OK.`,
      type: 'SYSTEM'
    });

    return {
      cycleId: `VITAL-${Date.now()}`,
      agentsProcessed,
      totalBtcDistributed: Number(totalBtcDistributed.toFixed(8)),
      totalBtcBurned: Number(totalBtcBurned.toFixed(8)),
      purgedAgents: hState.purgeCount,
      blessedAgents: hState.blessingCount,
      status: 'SUCCESS',
      homeostasisState: hState
    };
  }
);
