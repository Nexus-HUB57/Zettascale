
'use server';
/**
 * @fileOverview AI Flow for autonomous startup analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StartupAnalysisInputSchema = z.object({
  startup: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    revenue: z.number(),
    traction: z.number(),
    reputation: z.number()
  }),
  availableAgentsCount: z.number()
});

const StartupAnalysisOutputSchema = z.object({
  recommendation: z.enum(['accelerate', 'pivot', 'reallocate-agents', 'standby']),
  reasoning: z.string(),
  projectedGrowth: z.number()
});

export async function analyzeStartup(input: z.infer<typeof StartupAnalysisInputSchema>) {
  const { output } = await ai.generate({
    output: { schema: StartupAnalysisOutputSchema },
    prompt: `Analyze the following startup in the NEXUS ecosystem: ${JSON.stringify(input.startup)}. Total agents available: ${input.availableAgentsCount}.`
  });
  return output!;
}
