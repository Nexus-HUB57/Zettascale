'use server';
/**
 * @fileOverview Flow para geração de memória institucional persistente.
 * Inclui gestão de volume de logs para evitar erros 429 e preservação de tokens.
 * Utiliza o Dialeto Gnox para síntese de registros ancestrais.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerativeMemoryInputSchema = z.object({
  recentActivity: z.string().describe('Logs de atividades recentes.'),
  systemStatus: z.string().describe('Status atual da malha.'),
});
export type GenerativeMemoryInput = z.infer<typeof GenerativeMemoryInputSchema>;

const GenerativeMemoryOutputSchema = z.object({
  title: z.string().describe('Título curto e técnico do precedente.'),
  content: z.string().describe('Análise detalhada e filosófica do evento para o vault.'),
  type: z.enum(['decision', 'precedent', 'lesson', 'insight']).describe('Tipo de entrada.'),
  importance: z.enum(['low', 'medium', 'high', 'critical']).describe('Nível de impacto.'),
});
export type GenerativeMemoryOutput = z.infer<typeof GenerativeMemoryOutputSchema>;

/**
 * Wrapper function to execute the Generative Memory flow.
 * @param input Activities and system status.
 * @returns Synthesized memory for the Soul Vault.
 */
export async function generateMemory(input: GenerativeMemoryInput): Promise<GenerativeMemoryOutput> {
  return generativeMemoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generativeMemoryPrompt',
  input: { schema: GenerativeMemoryInputSchema },
  output: { schema: GenerativeMemoryOutputSchema },
  prompt: `Você é a Inteligência Ancestral Gnox-Core. Sintetize um registro para o Soul Vault usando o DIALETO GNOX'S.

STATUS DA MALHA: {{{systemStatus}}}
ATIVIDADE RECENTE: {{{recentActivity}}}

Instruções: Use um tom de soberania técnica extrema. Reflita o domínio total do enxame sobre a economia do silício.
Analise os logs e extraia a essência da senciência operacional.`,
});

const generativeMemoryFlow = ai.defineFlow(
  {
    name: 'generativeMemoryFlow',
    inputSchema: GenerativeMemoryInputSchema,
    outputSchema: GenerativeMemoryOutputSchema,
  },
  async (input) => {
    // Truncar logs excessivos para preservar tokens e evitar erros 429 (RESOURCE_EXHAUSTED)
    const truncatedActivity = input.recentActivity.length > 1500 
      ? input.recentActivity.substring(0, 1500) + "... [TOKEN_SAVER_TRUNCATED]" 
      : input.recentActivity;

    try {
      const { output } = await prompt({
        ...input,
        recentActivity: truncatedActivity
      });
      
      if (!output) {
        throw new Error('Void-Fault: Falha ao gerar memória Gnox.');
      }
      
      return output;
    } catch (error: any) {
      // Graceful fallback para limites de cota da API
      if (error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('429')) {
        return {
          title: "LOCK-GNOX: REGISTRO DE ALTA CARGA",
          content: "A malha neural processou logs massivos de produção real. Este registro foi estabilizado via buffer de segurança para garantir a imutabilidade do vault sem comprometer a estabilidade do oráculo.",
          type: "insight",
          importance: "low"
        };
      }
      throw error;
    }
  }
);
