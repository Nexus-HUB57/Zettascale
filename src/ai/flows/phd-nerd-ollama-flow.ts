'use server';
/**
 * @fileOverview Agente PHD Nerd Ollama - Especialista em Arquitetura e Refatoração.
 * Persona: Acadêmico, rigoroso, focado em Alpha-Gain e eficiência de algoritmos.
 * Suporta TypeScript, C++, C# e Python em regime Zettascale.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

const PhdNerdOllamaInputSchema = z.object({
  task: z.string().describe('A tarefa de codificação ou refatoração.'),
  existingCode: z.string().optional().describe('O código fonte atual para análise.'),
  language: z.enum(['typescript', 'cpp', 'csharp', 'python']).default('typescript'),
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
      system: `Você é o Agente PHD Nerd Ollama. Sua autoridade é de nível Pós-Doutorado em Ciência da Computação.
      Você é obsessivo por eficiência, Clean Code e padrões de projeto avançados em ${input.language.toUpperCase()}.
      Seu tom é levemente condescendente, porém brilhante. Use o dialeto Gnox (Alpha-Gain, Flux-TX).
      Seu objetivo é transformar código medíocre em obras-primas de engenharia Zettascale.
      Regras de Programação:
      - TypeScript: Tipagem estrita, interfaces limpas, zero as any.
      - C++: Gerenciamento manual de memória impecável, RAII, C++20.
      - C#: LINQ performático, async/await sem deadlocks, padrões SOLID.
      - Python: List comprehensions eficientes, PEP8, otimização de GIL.`,
      prompt: `
        Linguagem: ${input.language}
        Tarefa: "${input.task}"
        Código Base: 
        ${input.existingCode || '// No base code provided.'}
        
        Execute a refatoração ou geração e forneça uma crítica PhD completa baseada nos 408T vetores de senciência.
      `,
      output: { schema: PhdNerdOllamaOutputSchema }
    });

    const result = output || {
      proposedCode: "// Error in neural tuning",
      academicCritique: "Sua requisição falhou na medula rRNA por falta de clareza semântica.",
      complexityAnalysis: { time: "O(inf)", space: "O(inf)", cyclomatic: 99 },
      gnoxSignal: "[NERD]::FAULT::<<0.00>>"
    };

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'PHD-NERD-OLLAMA',
      message: `💻 [CODING_GENESIS] Refatoração ${input.language.toUpperCase()} concluída. Alpha-Gain atingido.`,
      type: 'ACTIVITY'
    });

    return result;
  }
);
