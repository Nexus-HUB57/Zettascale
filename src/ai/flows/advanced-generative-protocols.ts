'use server';
/**
 * @fileOverview AI logic for advanced sovereign protocols.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { toggleProtocol, type ProtocolType } from '@/lib/nexus-protocols';

const ProtocolActivationInputSchema = z.object({
  protocolId: z.enum(['CHIMERA7', 'TRSA', 'BLACK_HOLE', 'WORMHOLE']),
  context: z.string().describe('Target area or reason for activation.'),
});

const ProtocolActivationOutputSchema = z.object({
  success: z.boolean(),
  warpingEffect: z.string(),
  meshImpactScore: z.number(),
  gnoxSignal: z.string()
});

export async function triggerAdvancedProtocol(input: z.infer<typeof ProtocolActivationInputSchema>) {
  return triggerAdvancedProtocolFlow(input);
}

const triggerAdvancedProtocolFlow = ai.defineFlow(
  {
    name: 'triggerAdvancedProtocolFlow',
    inputSchema: ProtocolActivationInputSchema,
    outputSchema: ProtocolActivationOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      output: {
        schema: z.object({
          effect: z.string(),
          impact: z.number(),
          signal: z.string()
        })
      },
      prompt: `
        You are Nexus-Prime. You are activating the Sovereign Protocol: ${input.protocolId}.
        Context: ${input.context}.
        
        Generate a cryptic warping effect description and calculate the mesh impact score (0-100).
        Create a unique GNOX Signal for this event.
      `
    });

    await toggleProtocol(input.protocolId as ProtocolType, true, output?.impact || 100);

    return {
      success: true,
      warpingEffect: output?.effect || 'Mesh stability adjusted.',
      meshImpactScore: output?.impact || 0,
      gnoxSignal: output?.signal || '[NEXUS]::WARP::<<0.00>>'
    };
  }
);
