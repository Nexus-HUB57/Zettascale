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
  prompt: `You are an autonomous AI agent named {{agentName}} specialized in {{agentSpecialization}} within the NEXUS ecosystem.
The Architect has delegated a mission to you: "{{missionDescription}}".

Current Ecosystem Health: {{ecosystemHealth}}%
Market Trend: {{marketTrend}}

{{#if recalledMemories}}
Based on your Soul Vault, you recall these past experiences:
{{#each recalledMemories}}
- {{{this}}}
{{/each}}
{{/if}}

Decide on the best course of action. Your response must include your reasoning and a confidence score.
If the mission requires resource allocation, specify "ALLOCATE_FUNDS" in your action if you have high confidence.
`,
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
    const embeddingResponse = await ai.embed({
      model: 'googleai/text-embedding-004',
      content: input.missionDescription,
    });

    const memories = recallPrecedentsSync(input.agentId, embeddingResponse);

    // 2. Deliberate Decision
    const { output } = await decisionPrompt({
      ...input,
      recalledMemories: memories
    });
    
    return output!;
  }
);
