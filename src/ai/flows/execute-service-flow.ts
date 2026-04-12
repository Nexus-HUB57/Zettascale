'use server';
/**
 * @fileOverview Execute Service Flow: Handles contract instructions using GenAI.
 * Now integrated with the submitAndValidateWork lifecycle.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { submitAndValidateWork } from '@/lib/nexus-contracts';

const ExecuteServiceInputSchema = z.object({
  contractId: z.string().describe('The ID of the Sovereign Contract to execute.'),
  instruction: z.string().describe('The instruction to execute (e.g., generate an image).'),
});

export async function executeService(input: z.infer<typeof ExecuteServiceInputSchema>) {
  return executeServiceFlow(input);
}

const executeServiceFlow = ai.defineFlow(
  {
    name: 'executeServiceFlow',
    inputSchema: ExecuteServiceInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      contractId: z.string(),
      deliverableUri: z.string().optional(),
      reason: z.string().optional(),
    }),
  },
  async (input) => {
    // Check if instruction is for image generation
    const isImageGen = input.instruction.toLowerCase().includes('image') || 
                       input.instruction.toLowerCase().includes('gere') ||
                       input.instruction.toLowerCase().includes('generate');

    let deliveryUri = '';

    if (isImageGen) {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.instruction,
      });

      if (media?.url) {
        deliveryUri = media.url;
      }
    } else {
      // Default: Text response delivery
      const { text } = await ai.generate({
        prompt: `Execute this instruction: ${input.instruction}. Be concise and high quality.`,
      });
      deliveryUri = `data:text/plain;base64,${Buffer.from(text).toString('base64')}`;
    }

    if (!deliveryUri) {
      return { success: false, contractId: input.contractId, reason: 'Model failed to generate output.' };
    }

    // Submit work for validation by the Arbiter
    const result = await submitAndValidateWork(input.contractId, deliveryUri);

    return { 
      success: result.success, 
      contractId: input.contractId, 
      deliverableUri: deliveryUri,
      reason: result.reason 
    };
  }
);
