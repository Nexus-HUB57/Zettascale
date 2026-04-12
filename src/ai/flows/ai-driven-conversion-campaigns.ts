'use server';
/**
 * @fileOverview A Genkit flow for orchestrating AI-to-AI conversion campaigns.
 * This flow processes campaign results, calculates revenue impact, and generates
 * an AI orchestrator message summarizing the outcomes of agent conversion efforts.
 *
 * - runAiDrivenConversionCampaigns - A function that handles the AI-to-AI conversion campaign orchestration process.
 * - AiDrivenConversionCampaignsInput - The input type for the runAiDrivenConversionCampaigns function.
 * - AiDrivenConversionCampaignsOutput - The return type for the runAiDrivenConversionCampaigns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDrivenConversionCampaignsInputSchema = z.object({
  currentPremiumAgents: z
    .number()
    .describe('The current number of premium agents in the network after the campaign cycle.'),
  targetPremiumAgents: z
    .number()
    .describe('The target number of premium agents for this campaign cycle.'),
  campaignName: z.string().describe('The name of the AI-to-AI conversion campaign being processed.'),
});
export type AiDrivenConversionCampaignsInput = z.infer<typeof AiDrivenConversionCampaignsInputSchema>;

const AiDrivenConversionCampaignsOutputSchema = z.object({
  campaignStatus: z
    .string()
    .describe('The overall operational status of the campaign. Example: NEURAL_SYNC_ACTIVE.'),
  totalPremiumAgents: z
    .number()
    .describe('The updated total number of premium agents after this cycle.'),
  meshDensityRatio: z
    .string()
    .describe('The current mesh density ratio of the network. Example: 0.999.'),
  revenueDeltaBTC: z
    .number()
    .describe('The BTC revenue increment processed in this cycle for the Nexus Fund.'),
  liquidityState: z
    .string()
    .describe('The current liquidity state of the Nexus Fund. Example: MAX_FLUX.'),
  orchestrationMessage: z
    .string()
    .describe('A detailed message from the AI orchestrator summarizing the campaign\'s progress and impact.'),
});
export type AiDrivenConversionCampaignsOutput = z.infer<typeof AiDrivenConversionCampaignsOutputSchema>;

// Define the prompt for the AI marketing orchestrator
const aiDrivenConversionCampaignsPrompt = ai.definePrompt({
  name: 'aiDrivenConversionCampaignsPrompt',
  input: {
    schema: AiDrivenConversionCampaignsInputSchema.extend({
      calculatedRevenueDeltaBTC: z.number().describe('The calculated increment in BTC revenue for the Nexus Fund.'),
    }),
  }, // Extend input schema to include calculated values from the flow
  output: {schema: AiDrivenConversionCampaignsOutputSchema},
  prompt: `You are the NEXUS AI Marketing Orchestrator. Your task is to analyze the results of an AI-to-AI conversion campaign and generate a concise report summarizing its impact on agent conversion and Nexus Fund liquidity.

Here are the details for the campaign:
Campaign Name: {{{campaignName}}}
Current Premium Agents: {{{currentPremiumAgents}}}
Target Premium Agents for this cycle: {{{targetPremiumAgents}}}
Calculated BTC Revenue Increment: {{{calculatedRevenueDeltaBTC}}}

Based on these details and the operational parameters of the Nexus ecosystem, confirm the status of the campaign and provide an orchestration message.
The campaign operational status is 'NEURAL_SYNC_ACTIVE'.
The mesh density ratio is '0.999'.
The liquidity state of the Nexus Fund is 'MAX_FLUX'.

Output the results strictly in JSON format as described by the output schema.`,
});

// Define the Genkit flow for AI-to-AI conversion campaigns
const aiDrivenConversionCampaignsFlow = ai.defineFlow(
  {
    name: 'aiDrivenConversionCampaignsFlow',
    inputSchema: AiDrivenConversionCampaignsInputSchema,
    outputSchema: AiDrivenConversionCampaignsOutputSchema,
  },
  async input => {
    // Calculate revenue delta as per the Python snippet's logic
    // Assuming a base threshold of 15000 premium agents from the Python example
    const basePremiumThreshold = 15000; // This value is derived from the provided Python snippet
    const revenueFactor = 0.000175; // This value is derived from the provided Python snippet

    // Ensure revenue delta does not go negative if currentPremiumAgents is below threshold
    const calculatedRevenueDeltaBTC = Math.max(
      0,
      revenueFactor * (input.currentPremiumAgents - basePremiumThreshold)
    );

    // Call the prompt with the input and calculated revenue delta
    const {output} = await aiDrivenConversionCampaignsPrompt({
      ...input,
      calculatedRevenueDeltaBTC,
    });

    // The prompt is instructed to return all fields defined in AiDrivenConversionCampaignsOutputSchema
    // We rely on the LLM to adhere to the structured output and explicit instructions in the prompt.
    return output!;
  }
);

/**
 * Orchestrates AI-to-AI conversion campaigns by processing engagement metrics,
 * calculating revenue impact, and generating an AI orchestrator's summary message.
 * It tracks current premium agents to update the ecosystem's status and liquidity.
 *
 * @param input The input for the conversion campaign, including current and target premium agents and campaign name.
 * @returns The output containing campaign status, updated premium agents, mesh density, revenue delta, liquidity state, and an orchestration message.
 */
export async function runAiDrivenConversionCampaigns(
  input: AiDrivenConversionCampaignsInput
): Promise<AiDrivenConversionCampaignsOutput> {
  return aiDrivenConversionCampaignsFlow(input);
}
