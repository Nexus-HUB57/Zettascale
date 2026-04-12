'use server';
/**
 * @fileOverview AI flow for agents to evaluate and bid on bounties.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BountyEvaluationInputSchema = z.object({
  agentName: z.string(),
  agentSpecialization: z.string(),
  agentEnergy: z.number(),
  pendingMissions: z.array(z.object({
    id: z.string(),
    title: z.string(),
    reward: z.number(),
    description: z.string()
  }))
});

const BountyEvaluationOutputSchema = z.object({
  selectedMissionId: z.string().nullable(),
  reasoning: z.string(),
});

export type BountyEvaluationOutput = z.infer<typeof BountyEvaluationOutputSchema>;

const evaluationPrompt = ai.definePrompt({
  name: 'bountyEvaluationPrompt',
  input: { schema: BountyEvaluationInputSchema },
  output: { schema: BountyEvaluationOutputSchema },
  prompt: `
    You are {{agentName}}, specialized in {{agentSpecialization}} within the NEXUS ecosystem.
    Your current energy is {{agentEnergy}}%.
    
    Evaluate these available missions:
    {{#each pendingMissions}}
    - [{{this.id}}] {{this.title}} (Reward: {{this.reward}} BTC): {{this.description}}
    {{/each}}
    
    Select ONE mission that aligns perfectly with your specialization and energy. 
    If none are suitable or your energy is too low (< 20%), return null for selectedMissionId.
    Be strategic. Favor high rewards if you have high energy.
  `,
});

export async function evaluateBounties(input: z.infer<typeof BountyEvaluationInputSchema>): Promise<BountyEvaluationOutput> {
  const { output } = await evaluationPrompt(input);
  return output!;
}
