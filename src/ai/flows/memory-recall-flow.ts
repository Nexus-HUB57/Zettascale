'use server';
/**
 * @fileOverview AI flow for agents to recall past experiences from the Soul Vault.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { recallPrecedentsSync } from '@/lib/soul-vault';

const MemoryRecallInputSchema = z.object({
  agentId: z.string(),
  context: z.string().describe('The current situation or problem the agent is facing.'),
});

const MemoryRecallOutputSchema = z.object({
  memories: z.array(z.string()).describe('The relevant past experiences recalled.'),
});

export async function recallAgentMemories(input: z.infer<typeof MemoryRecallInputSchema>): Promise<z.infer<typeof MemoryRecallOutputSchema>> {
  return memoryRecallFlow(input);
}

const memoryRecallFlow = ai.defineFlow(
  {
    name: 'memoryRecallFlow',
    inputSchema: MemoryRecallInputSchema,
    outputSchema: MemoryRecallOutputSchema,
  },
  async (input) => {
    // 1. Generate query embedding on the server
    const embeddingResponse = await ai.embed({
      model: 'googleai/text-embedding-004',
      content: input.context,
    });

    // 2. Call synchronous recall logic with vector
    const memories = recallPrecedentsSync(input.agentId, embeddingResponse);
    
    return { memories };
  }
);
