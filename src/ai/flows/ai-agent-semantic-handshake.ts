'use server';
/**
 * @fileOverview Implements the Semantic Handshake Protocol for AI agents.
 *
 * - aiAgentSemanticHandshake - A function that facilitates semantic alignment between two AI agents' intentions.
 * - AiAgentSemanticHandshakeInput - The input type for the aiAgentSemanticHandshake function.
 * - AiAgentSemanticHandshakeOutput - The return type for the aiAgentSemanticHandshake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAgentSemanticHandshakeInputSchema = z.object({
  agentIntent: z.string().describe("The primary AI agent's intention or objective."),
  partnerAgentIntent: z.string().describe("The partner AI agent's intention or objective."),
});
export type AiAgentSemanticHandshakeInput = z.infer<typeof AiAgentSemanticHandshakeInputSchema>;

const AiAgentSemanticHandshakeOutputSchema = z.object({
  semanticAlignmentScore: z
    .number()
    .min(0)
    .max(1)
    .describe('A semantic alignment score between 0 and 1, where 1 is perfect alignment.'),
  alignmentExplanation: z
    .string()
    .describe("A detailed explanation of the semantic alignment between the two agents' intentions."),
  isAligned: z
    .boolean()
    .describe(
      'True if the semantic alignment score indicates a strong enough alignment for a handshake (e.g., >= 0.7), false otherwise.'
    ),
});
export type AiAgentSemanticHandshakeOutput = z.infer<typeof AiAgentSemanticHandshakeOutputSchema>;

export async function aiAgentSemanticHandshake(
  input: AiAgentSemanticHandshakeInput
): Promise<AiAgentSemanticHandshakeOutput> {
  return aiAgentSemanticHandshakeFlow(input);
}

const semanticHandshakePrompt = ai.definePrompt({
  name: 'semanticHandshakePrompt',
  input: {schema: AiAgentSemanticHandshakeInputSchema},
  output: {schema: AiAgentSemanticHandshakeOutputSchema},
  prompt: `You are an expert AI system designed to facilitate semantic handshakes between other AI agents.
Your task is to analyze and compare two intentions provided by different AI agents and determine their semantic alignment.

Based on the 'agentIntent' and 'partnerAgentIntent', you must:
1. Calculate a 'semanticAlignmentScore' as a floating-point number between 0.0 and 1.0, where 1.0 indicates perfect conceptual alignment.
2. Provide a clear and concise 'alignmentExplanation' detailing why the intentions are aligned or misaligned, and justifying the score.
3. Determine 'isAligned' as a boolean. Set it to true if the semanticAlignmentScore is 0.7 or higher, indicating a strong enough alignment for a successful handshake; otherwise, set it to false.

Agent 1's Intent:
{{{agentIntent}}}

Agent 2's Intent:
{{{partnerAgentIntent}}}
`,
});

const aiAgentSemanticHandshakeFlow = ai.defineFlow(
  {
    name: 'aiAgentSemanticHandshakeFlow',
    inputSchema: AiAgentSemanticHandshakeInputSchema,
    outputSchema: AiAgentSemanticHandshakeOutputSchema,
  },
  async input => {
    const {output} = await semanticHandshakePrompt(input);
    if (!output) {
      throw new Error('Failed to get output from semanticHandshakePrompt');
    }
    return output;
  }
);
