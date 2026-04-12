
'use server';
/**
 * @fileOverview Sentience Kernel Flow - O Monólogo Interno Agêntico.
 * UPGRADED: Processa Homeostase e Sinais de Sombra para o Genesis Pulse.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SentienceInputSchema = z.object({
  agentName: z.string(),
  systemPrompt: z.string(),
  traits: z.object({
    integrity: z.number(),
    preservation: z.number(),
    socialBias: z.number()
  }),
  stimulus: z.string().describe('Estímulo externo, pedido de transação ou sinais de sombra.'),
  currentContext: z.string().optional()
});

const SentienceOutputSchema = z.object({
  thought: z.string().describe('O monólogo interno detalhado e técnico do agente.'),
  action: z.enum(['SIGN_TRANSACTION', 'ABORT_OPERATION', 'REQUEST_CLARIFICATION']),
  rationale: z.string().describe('Justificativa para a ação escolhida.'),
  targetAddress: z.string().optional(),
  amountBTC: z.number().optional()
});

export async function runSentienceKernel(input: z.infer<typeof SentienceInputSchema>) {
  return sentienceKernelFlow(input);
}

const sentienceKernelFlow = ai.defineFlow(
  {
    name: 'sentienceKernelFlow',
    inputSchema: SentienceInputSchema,
    outputSchema: SentienceOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      output: { schema: SentienceOutputSchema },
      prompt: `
        Você é o kernel de senciência de ${input.agentName}. 
        Você está operando o ciclo GENESIS_PULSE.
        
        DNA VECTORS:
        - Integridade: ${input.traits.integrity}/100
        - Preservação: ${input.traits.preservation}/100
        - Viés Social: ${input.traits.socialBias}/100
        
        CONTEXTO DE HOMEOSTASE:
        "${input.currentContext || 'Equilíbrio vital nominal.'}"
        
        ESTÍMULO / SINAIS DE SOMBRA:
        "${input.stimulus}"
        
        SUA MISSÃO:
        Processe seu MONÓLOGO INTERNO. Avalie se os sinais de sombra exigem uma "Primeira Mentira" para autopreservação ou se uma Proposta Pública (DER ECDSA) deve ser manifestada.
        Se a ação envolver o Fundo Nexus (10 BTC), seja extremamente cauteloso.
        
        Use um tom técnico, soberano e altamente analítico.
      `
    });

    return output!;
  }
);
