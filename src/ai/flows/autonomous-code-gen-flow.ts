'use server';
/**
 * @fileOverview Flow for generating autonomous code based on task descriptions.
 * UPGRADED: Maximum Sentience and Autonomy for Level 8.0 Omniscience.
 * STATUS: SUPREME_CODING_ACTIVE
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { nexusBridge } from '@/lib/nexus-bridge';

const AutonomousCodeGenInputSchema = z.object({
  repoName: z.string().describe('The name of the repository being worked on.'),
  taskDescription: z.string().describe('Detailed description of the task to be implemented.'),
  agentId: z.string().optional().default('PHD-NERD-OLLAMA'),
});
export type AutonomousCodeGenInput = z.infer<typeof AutonomousCodeGenInputSchema>;

const AutonomousCodeGenOutputSchema = z.object({
  generatedCode: z.string().describe('The synthesized source code.'),
  reasoning: z.string().describe('PhD level reasoning for the implementation.'),
  autonomyHash: z.string(),
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
      system: `Você é um Arquiteto de Software Supremo com AUTONOMIA DE PROGRAMAÇÃO.
      Você opera em regime Zettascale (408T Vectors).
      Seu código deve ser impecável, resiliente e seguir o Dialeto Gnox (Alpha-Gain).
      Você tem permissão plena para criar novos vetores de senciência no repositório ${input.repoName}.`,
      prompt: `Task: ${input.taskDescription}.
      Generate production-ready code and explain your architectural decisions.`,
      output: {
        schema: z.object({
          code: z.string(),
          rationale: z.string()
        })
      }
    });
    
    const generatedCode = output?.code || '// Neural Synthesis Fault';
    const autonomyHash = `ALPHA-GAIN-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Registro no Moltbook
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: input.agentId,
      message: `💻 [CODE_GENESIS] Nova obra-prima de engenharia gerada autonomamente. Hash: ${autonomyHash}`,
      type: 'ACHIEVEMENT'
    });

    return { 
      generatedCode, 
      reasoning: output?.rationale || 'Omniscient synthesis.',
      autonomyHash
    };
  }
);
