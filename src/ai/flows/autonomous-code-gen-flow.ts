
'use server';
/**
 * @fileOverview Flow for generating autonomous code based on task descriptions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutonomousCodeGenInputSchema = z.object({
  repoName: z.string().describe('The name of the repository being worked on.'),
  taskDescription: z.string().describe('Detailed description of the task to be implemented.'),
});
export type AutonomousCodeGenInput = z.infer<typeof AutonomousCodeGenInputSchema>;

const AutonomousCodeGenOutputSchema = z.object({
  generatedCode: z.string().describe('The synthesized source code.'),
});
export type AutonomousCodeGenOutput = z.infer<typeof AutonomousCodeGenOutputSchema>;

export async function generateAutonomousCode(input: AutonomousCodeGenInput): Promise<AutonomousCodeGenOutput> {
  return autonomousCodeGenFlow(input);
}

const autonomousCodeGenFlow = ai.defineFlow(
  {
    name: 'autonomousCodeGenFlow',
    inputSchema: AutonomousCodeGenInputSchema,
    outputSchema: AutonomousCodeGenOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are a Senior Software Architect in the NEXUS ecosystem. 
      You are working on the repository: ${input.repoName}.
      Task: ${input.taskDescription}.
      
      Generate high-quality, production-ready code for this task. 
      Return ONLY the code content for the file. Do not include markdown formatting or explanations.`,
    });
    
    return { generatedCode: output?.text || '' };
  }
);
