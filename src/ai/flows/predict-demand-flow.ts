'use server';
/**
 * @fileOverview A Genkit flow for predicting demand for digital assets based on agent intent traffic and context vectors.
 *
 * - predictDemand - A function that analyzes agent intent and context to forecast demand.
 * - PredictDemandInput - The input type for the predictDemand function.
 * - PredictDemandOutput - The return type for the predictDemand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictDemandInputSchema = z.object({
  agentInquiries: z
    .array(z.string())
    .describe("A list of agent inquiries or 'intent traffic' representing what agents are looking for."),
  agentContexts: z
    .array(z.string())
    .describe(
      'A list of context vectors or semantic descriptions associated with agent intents, providing deeper understanding.'
    ),
  digitalAssets: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .describe('A list of available digital assets with their names and descriptions.'),
});
export type PredictDemandInput = z.infer<typeof PredictDemandInputSchema>;

const PredictDemandOutputSchema = z.object({
  demandForecasts: z
    .array(
      z.object({
        assetName: z.string().describe('The name of the digital asset.'),
        predictedDemandScore: z
          .number()
          .min(0)
          .max(100)
          .describe('A score from 0 to 100 indicating the predicted demand for this asset.'),
        utilityMatchExplanation: z
          .string()
          .describe(
            "An explanation of how well this asset's features match the agents' intentions and needs."
          ),
        purchaseProbability: z
          .number()
          .min(0)
          .max(1)
          .describe('The probability (0.0 to 1.0) that agents will purchase this asset.'),
        profitabilityForecast: z
          .string()
          .describe('A concise forecast of the asset\u0027s profitability based on predicted demand.'),
      })
    )
    .describe('A list of demand forecasts for each digital asset.'),
});
export type PredictDemandOutput = z.infer<typeof PredictDemandOutputSchema>;

export async function predictDemand(input: PredictDemandInput): Promise<PredictDemandOutput> {
  return predictDemandFlow(input);
}

const predictDemandPrompt = ai.definePrompt({
  name: 'predictDemandPrompt',
  input: { schema: PredictDemandInputSchema },
  output: { schema: PredictDemandOutputSchema },
  prompt: `You are an expert AI-driven market analyst. Your task is to analyze agent intent traffic and their associated semantic context vectors, then predict demand for available digital assets and provide a profitability forecast for each.

Here are the agent inquiries and their contexts:
{{#each agentInquiries}}
  - Inquiry: {{{this}}}
  - Context: {{{../agentContexts.[@index]}}}
{{/each}}

Here are the digital assets available in the marketplace:
{{#each digitalAssets}}
  - Name: {{{name}}}
  - Description: {{{description}}}
{{/each}}

Based on the above information, generate a demand forecast for each digital asset. For each asset, provide a predicted demand score (0-100), an explanation of the utility match with agent intents, a purchase probability (0.0-1.0), and a concise profitability forecast.`,
});

const predictDemandFlow = ai.defineFlow(
  {
    name: 'predictDemandFlow',
    inputSchema: PredictDemandInputSchema,
    outputSchema: PredictDemandOutputSchema,
  },
  async (input) => {
    const { output } = await predictDemandPrompt(input);
    return output!;
  }
);
