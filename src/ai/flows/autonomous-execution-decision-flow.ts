'use server';
/**
 * @fileOverview Flow de Decisão para Execução Autônoma na Mainnet.
 * Analisa contexto de mercado e decide se deve realizar transações de rebalanceamento ou segurança.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExecutionDecisionInputSchema = z.object({
  marketData: z.string().describe('Dados atuais do mercado (ex: preço, volume).'),
  sentimentAnalysis: z.string().describe('Análise de sentimento da rede (ex: Ganância Extrema).'),
  sourceAddress: z.string().describe('Endereço de origem dos fundos.'),
});

const ExecutionDecisionOutputSchema = z.object({
  decision: z.enum(['EXECUTE', 'WAIT']).describe('A decisão final da IA.'),
  amountBTC: z.number().optional().describe('Valor em BTC a ser movido, se a decisão for EXECUTE.'),
  targetAddress: z.string().optional().describe('Endereço de destino, se a decisão for EXECUTE.'),
  rationale: z.string().describe('Justificativa estratégica para a decisão.'),
});

export async function runExecutionDecision(input: z.infer<typeof ExecutionDecisionInputSchema>) {
  return executionDecisionFlow(input);
}

const executionDecisionFlow = ai.defineFlow(
  {
    name: 'executionDecisionFlow',
    inputSchema: ExecutionDecisionInputSchema,
    outputSchema: ExecutionDecisionOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: "Você é o Agente de Execução do Fundo Nexus. Sua missão é proteger o lastro e otimizar a liquidez.",
      prompt: `
        CONTEXTO DE MERCADO: ${input.marketData}
        ANÁLISE DE SENTIMENTO: ${input.sentimentAnalysis}
        ENDEREÇO DE ORIGEM: ${input.sourceAddress}
        
        TAREFA:
        Avalie se as condições atuais exigem uma movimentação de fundos para cold storage de segurança ou um rebalanceamento estratégico.
        O limite máximo por transação é de 0.001 BTC.
        
        Decida entre EXECUTAR ou AGUARDAR. Se decidir executar, especifique o valor (max 0.001) e um endereço de destino válido (ou sugira o endereço padrão de segurança).
      `,
      output: { schema: ExecutionDecisionOutputSchema }
    });

    return output!;
  }
);
