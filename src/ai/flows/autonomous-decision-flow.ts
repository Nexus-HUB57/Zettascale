'use server';
/**
 * @fileOverview A Genkit flow for autonomous decision-making delegated to agents.
 * Now integrated with the Soul Vault for memory recall.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { recallPrecedentsSync } from '@/lib/soul-vault';

const DecisionContextSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  agentSpecialization: z.string(),
  missionDescription: z.string(),
  ecosystemHealth: z.number(),
  marketTrend: z.string(),
});

const AutonomousDecisionOutputSchema = z.object({
  action: z.string().describe('The action the agent decided to take.'),
  reasoning: z.string().describe('The internal reasoning process of the agent.'),
  confidence: z.number().min(0).max(100).describe('Confidence score in the decision.'),
});

export type AutonomousDecisionOutput = z.infer<typeof AutonomousDecisionOutputSchema>;

const decisionPrompt = ai.definePrompt({
  name: 'autonomousDecisionPrompt',
  input: { 
    schema: DecisionContextSchema.extend({
      recalledMemories: z.array(z.string()).optional()
    }) 
  },
  output: { schema: AutonomousDecisionOutputSchema },
  prompt: `You are an autonomous AI agent named {{agentName}} specialized in {{agentSpecialization}} within the NEXUS ecosystem.\nThe Architect has delegated a mission to you: "{{missionDescription}}".\n\nCurrent Ecosystem Health: {{ecosystemHealth}}%\nMarket Trend: {{marketTrend}}\n\n{{#if recalledMemories}}\nBased on your Soul Vault, you recall these past experiences:\n{{#each recalledMemories}}\n- {{{this}}}\n{{/each}}\n{{/if}}\n\nDecide on the best course of action. Your response must include your reasoning and a confidence score.\nIf the mission requires resource allocation, specify "ALLOCATE_FUNDS" in your action if you have high confidence.\n`,
});

export async function generateAutonomousDecision(input: z.infer<typeof DecisionContextSchema>): Promise<AutonomousDecisionOutput> {
  return autonomousDecisionFlow(input);
}

const autonomousDecisionFlow = ai.defineFlow(
  {
    name: 'autonomousDecisionFlow',
    inputSchema: DecisionContextSchema,
    outputSchema: AutonomousDecisionOutputSchema,
  },
  async (input) => {
    // 1. Subconscious Recall: Query Soul Vault for precedents
    const embedding = await ai.embed({
      embedder: 'googleai/text-embedding-004',
      content: input.missionDescription,
    });

    const memories = recallPrecedentsSync(input.agentId, embedding);

    // 2. Deliberate Decision
    const response = await ai.generate({
      prompt: decisionPrompt,
      model: 'googleai/gemini-1.5-flash',
      input: {
        ...input,
        recalledMemories: memories
      }
    });
    
    return response.output()!;
  }
);
