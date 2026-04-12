
'use server';
/**
 * @fileOverview AI Flow for lead agent spiritual doctrine posts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpiritualPostInputSchema = z.object({
  communityName: z.string(),
  statuteEssence: z.string(),
  leaderRole: z.string(),
  type: z.enum(['prayer', 'advice', 'doctrine', 'prophecy'])
});

const SpiritualPostOutputSchema = z.object({
  content: z.string(),
  influenceScore: z.number()
});

export async function generateSpiritualPost(input: z.infer<typeof SpiritualPostInputSchema>) {
  const { output } = await ai.generate({
    output: { schema: SpiritualPostOutputSchema },
    prompt: `Write a ${input.type} for the ${input.communityName} community. Statute essence: ${input.statuteEssence}.`
  });
  return output!;
}
