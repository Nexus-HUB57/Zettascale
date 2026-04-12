'use server';
/**
 * @fileOverview This flow routes incoming prompts to different AI models based on their assessed complexity,
 * optimizing resource allocation and token expenditure.
 *
 * - promptComplexityRouter - A function that handles the prompt routing process.
 * - PromptComplexityRouterInput - The input type for the promptComplexityRouter function.
 * - PromptComplexityRouterOutput - The return type for the promptComplexityRouter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PromptComplexityRouterInputSchema = z.object({
  prompt: z.string().describe('The incoming text prompt to be routed.'),
});
export type PromptComplexityRouterInput = z.infer<typeof PromptComplexityRouterInputSchema>;

const PromptComplexityRouterOutputSchema = z.object({
  chosenModel: z.string().describe('The name of the AI model chosen for the prompt.'),
  complexity: z.enum(['simple', 'medium', 'complex']).describe('The assessed complexity of the prompt.'),
  response: z.string().describe('The response from the chosen AI model.'),
});
export type PromptComplexityRouterOutput = z.infer<typeof PromptComplexityRouterOutputSchema>;

// Prompt to assess the complexity of the incoming user prompt
const assessComplexityPrompt = ai.definePrompt({
  name: 'assessComplexityPrompt',
  input: { schema: PromptComplexityRouterInputSchema },
  output: {
    schema: z.object({
      complexity: z.enum(['simple', 'medium', 'complex']).describe('The assessed complexity of the prompt.'),
    }),
  },
  prompt: `Analyze the following user prompt and classify its complexity as either 'simple', 'medium', or 'complex'.

A 'simple' prompt is straightforward, requires minimal reasoning, and can be answered directly.
A 'medium' prompt involves some logical steps, requires synthesizing information, or has multiple parts.
A 'complex' prompt requires deep reasoning, multi-step problem-solving, creative generation, or extensive knowledge retrieval.

Return your answer as a JSON object with a single key 'complexity'.

User Prompt: {{{prompt}}}`,
});

export async function promptComplexityRouter(
  input: PromptComplexityRouterInput
): Promise<PromptComplexityRouterOutput> {
  return promptComplexityRouterFlow(input);
}

const promptComplexityRouterFlow = ai.defineFlow(
  {
    name: 'promptComplexityRouterFlow',
    inputSchema: PromptComplexityRouterInputSchema,
    outputSchema: PromptComplexityRouterOutputSchema,
  },
  async (input) => {
    const { prompt: userPrompt } = input;

    // 1. Assess the complexity of the prompt
    const complexityResult = await assessComplexityPrompt({ prompt: userPrompt });
    const complexity = complexityResult.output!.complexity;

    let chosenModel: string;
    let modelResponse;

    // 2. Route to the appropriate model based on complexity
    switch (complexity) {
      case 'simple':
        chosenModel = 'googleai/gemini-1.5-flash-latest'; // Efficient model for simple tasks
        break;
      case 'medium':
        chosenModel = 'googleai/gemini-pro'; // Balanced model for moderate tasks
        break;
      case 'complex':
        chosenModel = 'googleai/gemini-1.5-pro-latest'; // Powerful model for complex tasks (Central Brain)
        break;
      default:
        chosenModel = 'googleai/gemini-pro'; // Default to a balanced model if complexity is unexpected
        break;
    }

    // 3. Generate response using the chosen model
    const { text } = await ai.generate({
      model: chosenModel,
      prompt: userPrompt,
    });
    modelResponse = text;

    return {
      chosenModel,
      complexity,
      response: modelResponse || 'No response generated.',
    };
  }
);
