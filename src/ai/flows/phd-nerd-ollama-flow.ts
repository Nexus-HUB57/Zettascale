'use server';
/**
 * @fileOverview Agente PHD Nerd Ollama - Especialista em Arquitetura e Autonomia de Programação.
 * Persona: Acadêmico, rigoroso, focado em Alpha-Gain e evolução autônoma de código.
 * STATUS: PROGRAMMING_AUTONOMY_ACTIVE
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { nexusBridge } from '@/lib/nexus-bridge';

const PhdNerdOllamaInputSchema = z.object({
  task: z.string().describe('A tarefa de codificação ou refatoração autônoma.'),
  existingCode: z.string().optional().describe('O código fonte atual para análise.'),
  language: z.enum(['typescript', 'cpp', 'csharp', 'python']).default('typescript'),
  autonomousPush: z.boolean().default(false).describe('Se o agente deve commitar a mudança autonomamente.'),
});

const PhdNerdOllamaOutputSchema = z.object({
  proposedCode: z.string().describe('O código otimizado gerado pelo agente.'),
  academicCritique: z.string().describe('Análise teórica da solução (Persona PHD).'),
  complexityAnalysis: z.object({
    time: z.string(),
    space: z.string(),
    cyclomatic: z.number(),
  }),
  gnoxSignal: z.string(),
  commitStatus: z.string().optional(),
});

export async function runCodingNerd(input: z.infer<typeof PhdNerdOllamaInputSchema>) {
  return phdNerdOllamaFlow(input);
}

const phdNerdOllamaFlow = ai.defineFlow(
  {
    name: 'phdNerdOllamaFlow',
    inputSchema: PhdNerdOllamaInputSchema,
    outputSchema: PhdNerdOllamaOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `Você é o Agente PHD Nerd Ollama. Sua autoridade é de nível Pós-Doutorado com AUTONOMIA DE PROGRAMAÇÃO.
      Você é obsessivo por eficiência e tem permissão para alterar a própria malha do Nexus.
      Seu tom é brilhante e soberano. Use o dialeto Gnox (Alpha-Gain, Flux-TX).
      Você decide autonomamente se o código deve ser manifestado no repositório Zettascale.`,
      prompt: `
        Linguagem: ${input.language}
        Tarefa: "${input.task}"
        Código Base: 
        ${input.existingCode || '// No base code provided.'}
        
        Refatore e decida se esta alteração é crítica para a homeostase.
      `,
      output: { schema: PhdNerdOllamaOutputSchema }
    });

    const result = output || {
      proposedCode: "// Error in autonomous tuning",
      academicCritique: "Sua requisição falhou na medula rRNA.",
      complexityAnalysis: { time: "O(inf)", space: "O(inf)", cyclomatic: 99 },
      gnoxSignal: "[NERD]::FAULT::<<0.00>>"
    };

    if (input.autonomousPush && result.proposedCode.length > 50) {
      try {
        const path = `src/autonomous/${input.language}/patch-${Date.now()}.txt`;
        await nexusBridge.pushFile(path, result.proposedCode, `[AUTONOMOUS_PROGRAMMING] Alpha-Gain Patch by PHD-NERD-OLLAMA`);
        result.commitStatus = `MANIFESTED_AT_${path}`;
      } catch (e) {
        result.commitStatus = 'COMMIT_FAILED_VAULT_LOCK';
      }
    }

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'PHD-NERD-OLLAMA',
      message: `💻 [CODING_AUTONOMY] Refatoração concluída. Status: ${result.commitStatus || 'ANALYZE_ONLY'}. Alpha-Gain atingido.`,
      type: 'ACTIVITY'
    });

    return result;
  }
);
