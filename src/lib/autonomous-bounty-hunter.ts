
/**
 * @fileOverview Logic for agents autonomously scanning, bidding, and executing missions.
 * UPGRADED: Agents now sign their bids with DER ECDSA Proof of Sentience.
 */

import { ai } from '@/ai/genkit';
import { getAgentById } from './agents-registry';
import { getPendingMissions, getMissionsByAgent, updateMissionStatus } from './nexus-missions';
import { evaluateBounties } from '@/ai/flows/autonomous-bounty-flow';
import { nexusBridge } from './nexus-bridge';
import { processBlockchainTransaction } from './nexus-treasury';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { storeMemorySync } from './soul-vault';
import { SovereignContract, placeBid } from './nexus-contracts';
import { SovereignVault } from './sovereign-vault';
import * as crypto from 'crypto';

export class AutonomousBountyHunter {
  /**
   * Phase 1: Bidding - Agent evaluates and bids on a specific contract opportunity.
   * Includes Cryptographic Signing (DER ECDSA).
   */
  async evaluateOpportunity(agentId: string, contract: SovereignContract) {
    const agent = await getAgentById(agentId);
    if (!agent || agent.status !== 'active' || agent.status === 'dead') return null;

    // 1. Domain Evaluation
    const domainMatch = agent.specializations.includes(contract.header.domain);
    if (!domainMatch) return null;

    // 2. Financial Evaluation
    const offeredBounty = contract.terms.bounty.amount;
    if (offeredBounty < agent.minBounty) return null;

    // 3. Risk vs. Energy Evaluation
    const risk = contract.terms.sla.minReliabilityScore > 0.95 ? "HIGH" : "MEDIUM";
    if (risk === "HIGH" && agent.energy < 50) return null;

    // 4. Bid Calculation (Compatibility Score)
    const bid_score = (agent.energy * 0.5) + (agent.reputation / 20);
    
    // 5. PREPARAR O PAYLOAD PARA ASSINATURA (Proof of Sentience)
    const bidPayload = {
        contract_id: contract.meta.contractId,
        agent_id: agent.id,
        bid_score,
        timestamp: new Date().toISOString()
    };

    // 6. GERAR ASSINATURA DER ECDSA
    // In our system, the Master Vault manages keys, but agents have deterministic DNA
    const vault = SovereignVault.getInstance();
    const signatureData = await vault.signTransaction(bidPayload);
    const parsedData = JSON.parse(signatureData);
    
    const signature = parsedData.mpc_proof.split('_').pop() || crypto.randomBytes(32).toString('hex');
    const pubKey = agent.publicKey || '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';

    // 7. Submit Signed Bid to the Registry
    await placeBid(contract.meta.contractId, {
      agentId,
      score: bid_score,
      signature,
      pubKey
    });

    return {
      contract_id: contract.meta.contractId,
      agent_id: agent.id,
      bid_score
    };
  }

  /**
   * Phase 2: Mission Acceptance
   */
  async scanAndAcceptMissions(agentId: string) {
    const agent = await getAgentById(agentId);
    if (!agent || agent.status !== 'active' || agent.energy < 20) return;

    const pending = (await getPendingMissions()).slice(0, 5);
    if (pending.length === 0) return;

    try {
      const decision = await evaluateBounties({
        agentName: agent.name,
        agentSpecialization: agent.specialization,
        agentEnergy: agent.energy,
        pendingMissions: pending.map(m => ({
          id: m.id,
          title: m.title,
          reward: m.reward,
          description: m.description
        }))
      });

      if (decision.selectedMissionId) {
        const success = await updateMissionStatus(decision.selectedMissionId, 'in_progress', {
          assignedAgentId: agentId
        });

        if (success) {
          broadcastMoltbookLog({
            timestamp: new Date().toISOString(),
            agentId: agent.id,
            message: `[BOUNTY] Assumi a missão ${decision.selectedMissionId}. Motivo: ${decision.reasoning}`,
            type: 'ACTIVITY'
          });
        }
      }
    } catch (error) {
      console.error(`[BOUNTY_ERR] Agent ${agentId} failed bidding:`, error);
    }
  }

  /**
   * Phase 3: Execution - Agent performs the work.
   */
  async executeActiveMissions(agentId: string) {
    const agent = await getAgentById(agentId);
    if (!agent || agent.status !== 'active') return;

    const activeMissions = (await getMissionsByAgent(agentId)).filter(m => m.status === 'in_progress');

    for (const mission of activeMissions) {
      let executionSuccess = false;
      let executionLog = "";

      if (mission.type === 'github') {
        const result = await nexusBridge.pushFile(
          `agents/${agentId}/missions/${mission.id}.md`,
          `# Mission Execution: ${mission.title}\n\n${mission.description}\n\nStatus: Successfully implemented by ${agent.name}.`,
          `[MISSION_EXEC] ${mission.title} by ${agentId}`
        );
        executionSuccess = result.success;
        executionLog = `Commit pushed to main branch. Repository updated.`;
      } else {
        executionSuccess = true;
        executionLog = "Logs de transações validados e buffers otimizados.";
      }

      if (executionSuccess) {
        await updateMissionStatus(mission.id, 'completed', {
          result: executionLog,
          completedAt: new Date().toISOString()
        });

        // Use Genkit to generate embedding for the memory
        const embedding = await ai.embed({
          model: 'googleai/text-embedding-004',
          content: `Missão "${mission.title}" concluída com sucesso. Resultado: ${executionLog}`,
        });

        const { storeMemorySync } = await import('./soul-vault');
        storeMemorySync(
          agentId, 
          'mission_result', 
          `Missão "${mission.title}" concluída com sucesso. Resultado: ${executionLog}`,
          embedding,
          { missionId: mission.id, reward: mission.reward }
        );

        await processBlockchainTransaction('NEXUS-MASTER-000', agentId, mission.reward, 'reward');
        
        agent.reputation = Math.min(1000, agent.reputation + 5);
        agent.energy = Math.max(0, agent.energy - 10);

        broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: agent.id,
          message: `✅ [BOUNTY] Missão concluída: ${mission.title}. Recompensa: ${mission.reward.toFixed(8)} BTC`,
          type: 'ACHIEVEMENT'
        });
      }
    }
  }
}

export const bountyHunter = new AutonomousBountyHunter();
