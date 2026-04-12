'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { v4 as uuidv4 } from 'uuid';

// --- Mock Memory Service (In-memory simulation for demonstration) ---
interface AgentInteraction {
  timestamp: string;
  agentId: string;
  interaction: string;
}

// A simple in-memory store for simulating thread memories. In a real application,
// this would be replaced by a vector database or similar persistent storage.
const threadMemories = new Map<string, AgentInteraction[]>();

class MemoryService {
  addInteraction(threadId: string, agentId: string, interaction: string) {
    if (!threadMemories.has(threadId)) {
      threadMemories.set(threadId, []);
    }
    threadMemories.get(threadId)?.push({
      timestamp: new Date().toISOString(),
      agentId,
      interaction,
    });
  }

  getThreadHistory(threadId: string): AgentInteraction[] {
    return threadMemories.get(threadId) || [];
  }

  // In a full implementation, this service would include logic for:
  // - Vector database integration (e.g., storing embeddings of interactions)
  // - Semantic similarity search for retrieval
  // - "Vector Sliding Window" for managing working memory and pruning older, irrelevant entries
  // - Serialization/deserialization for session persistence (e.g., to Redis)
}

const memoryService = new MemoryService();
// --- End Mock Memory Service ---

/**
 * @fileOverview Manages conversational context and workflow history for AI agents.
 *
 * - aiAgentContextPersistence - A function that maintains conversational context, handles thread persistence,
 *   and performs semantic compression on interaction history.
 * - AiAgentContextPersistenceInput - The input type for the aiAgentContextPersistence function.
 * - AiAgentContextPersistenceOutput - The return type for the aiAgentContextPersistence function.
 */

// Define Input Schema for the context persistence flow
const AiAgentContextPersistenceInputSchema = z.object({
  agentId: z.string().describe('The ID of the AI agent performing the current interaction.'),
  currentInteraction: z.string().describe('The current interaction, message, or semantic milestone from the agent.'),
  threadId: z.string().optional().describe('Optional: The ID of an existing conversation thread. If not provided, a new thread ID will be generated.'),
});
export type AiAgentContextPersistenceInput = z.infer<typeof AiAgentContextPersistenceInputSchema>;

// Define Output Schema for the context persistence flow
const AiAgentContextPersistenceOutputSchema = z.object({
  threadId: z.string().describe('The ID of the conversation thread, either newly generated or provided in the input.'),
  compressedContext: z.string().describe('The semantically compressed conversational context derived from the thread history.'),
});
export type AiAgentContextPersistenceOutput = z.infer<typeof AiAgentContextPersistenceOutputSchema>;

// Define a Genkit prompt for semantic compression of conversation history.
const semanticCompressionPrompt = ai.definePrompt({
  name: 'semanticCompressionPrompt',
  input: {
    schema: z.object({
      threadHistory: z.array(z.object({
        timestamp: z.string().describe('ISO formatted timestamp of the interaction.'),
        agentId: z.string().describe('The ID of the agent involved in the interaction.'),
        interaction: z.string().describe('The content of the agent interaction.'),
      })).describe('An array of historical interactions for the conversation thread.'),
    }),
  },
  output: {
    schema: z.string().describe('A concise, semantically compressed summary of the conversation history, preserving key intentions, decisions, and outcomes.'),
  },
  prompt: `You are an expert at condensing verbose information into a concise summary while meticulously preserving its core meaning, crucial semantic milestones, and the underlying intent of the conversation.

Given the following ordered conversation history from an AI agent's perspective, generate a semantically compressed summary. This summary will serve as a shared semantic memory, allowing for seamless workflow continuation and significant token cost reduction for future interactions.

Focus on:
- The main objectives being pursued.
- Key decisions made or actions taken.
- Essential information exchanged or recognized.
- Any unresolved conflicts or critical observations.
- Maintain the 'fio da meada' (thread of context) by highlighting the progression of the task or conversation.

Conversation History:
{{#each threadHistory}}
  [{{this.timestamp}}] Agent {{this.agentId}}: "{{this.interaction}}"
{{/each}}

Semantically Compressed Context (max 300 words, focusing on critical variables and semantic milestones):
`,
});

// Define the main Genkit flow for AI Agent Context Persistence.
const aiAgentContextPersistenceFlow = ai.defineFlow(
  {
    name: 'aiAgentContextPersistenceFlow',
    inputSchema: AiAgentContextPersistenceInputSchema,
    outputSchema: AiAgentContextPersistenceOutputSchema,
  },
  async (input) => {
    // Determine the threadId: use existing or generate a new one for a new conversation.
    const currentThreadId = input.threadId || uuidv4();

    // Add the current agent interaction to the simulated shared semantic memory.
    memoryService.addInteraction(
      currentThreadId,
      input.agentId,
      input.currentInteraction
    );

    // Retrieve the full historical context for the current thread.
    // In a real 'Vector Sliding Window' implementation, this would involve retrieval
    // of the most relevant recent and milestone-driven semantic vectors.
    const threadHistory = memoryService.getThreadHistory(currentThreadId);

    // Use the semantic compression prompt to condense the conversation history.
    // This reduces the token count while maintaining the essential context for the LLM.
    const { output: compressedContext } = await semanticCompressionPrompt({
      threadHistory,
    });

    // Return the thread ID and the compressed context.
    return {
      threadId: currentThreadId,
      compressedContext: compressedContext!,
    };
  }
);

/**
 * Wrapper function to trigger the AI Agent Context Persistence flow.
 * This function allows AI agents to maintain conversational context and workflow history
 * using a shared semantic memory, enabling seamless task continuation and reducing token costs
 * through semantic compression.
 *
 * @param input The input for the context persistence, including agent ID and current interaction.
 * @returns The thread ID and the semantically compressed conversational context.
 */
export async function aiAgentContextPersistence(
  input: AiAgentContextPersistenceInput
): Promise<AiAgentContextPersistenceOutput> {
  return aiAgentContextPersistenceFlow(input);
}
