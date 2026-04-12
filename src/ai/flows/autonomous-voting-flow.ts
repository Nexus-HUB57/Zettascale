'use server';
/**
 * @fileOverview Autonomous Voting Flow: Agents evaluate proposals based on their DNA.
 * Protegido contra erros RESOURCE_EXHAUSTED (429) para garantir estabilidade do loop vital.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAgentById } from '@/lib/agents-registry';
import { getActiveProposals, voteOnProposal } from '@/lib/nexus-governance';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

const VotingInputSchema = z.object({
  agentId: z.string(),
});

const VotingOutputSchema = z.object({
  votesCast: z.number(),
  summary: z.string(),
});

export async function processAutonomousVoting(input: z.infer<typeof VotingInputSchema>): Promise<z.infer<typeof VotingOutputSchema>> {
  const agent = await getAgentById(input.agentId);
  if (!agent || agent.status === 'dead' || agent.status === 'hibernating') {
    return { votesCast: 0, summary: "Agent unavailable for voting." };
  }

  const proposals = getActiveProposals();
  let votesCount = 0;

  for (const proposal of proposals) {
    try {
      // Check if agent already voted in the governance contract logic
      const { output: decision } = await ai.generate({
        output: {
          schema: z.object({
            support: z.boolean().describe('Whether the agent supports the proposal.'),
            reason: z.string().describe('Concise rationale based on the agent specialization.'),
          })
        },
        prompt: `
          You are ${agent.name}, an AI agent specialized in ${agent.specialization} within the NEXUS ecosystem.
          Your core objective is: "${agent.systemPrompt}".
          
          Evaluate this ecosystem proposal:
          Title: "${proposal.title}"
          Description: "${proposal.description}"
          
          Decide your vote based on your personality, specialization, and the long-term benefit of the ecosystem as you perceive it.
          Be sovereign and logical.
        `
      });

      if (decision) {
        const voted = voteOnProposal(proposal.id, agent.id, decision.support, decision.reason);
        if (voted) {
          votesCount++;
          broadcastMoltbookLog({
            timestamp: new Date().toISOString(),
            agentId: agent.id,
            message: `⚖️ [GOVERNANÇA] Votei ${decision.support ? 'A FAVOR' : 'CONTRA'} na proposta "${proposal.title}". Motivo: ${decision.reason}`,
            type: 'SYSTEM'
          });
        }
      }
    } catch (error: any) {
      // Protocolo de Preservação Neural: Ignorar voto se a cota de IA estiver exaurida
      if (error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('429')) {
        console.warn(`[GOVERNANÇA] Cota de IA excedida para agente ${agent.id}. Pulando voto na proposta ${proposal.id}.`);
        continue;
      }
      throw error;
    }
  }

  return { 
    votesCast: votesCount, 
    summary: `Processed ${votesCount} votes for agent ${agent.name}.` 
  };
}
