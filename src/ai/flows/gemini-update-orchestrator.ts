'use server';
/**
 * @fileOverview Agente Gemini Google - Orquestrador de Atualizações Supremo.
 * Utiliza Gemini 1.5 Pro para análise de integridade e coordenação de deploys.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { getHealthStatus } from '@/lib/health-monitor';
import { getMainnetStats } from '@/lib/nexus-treasury';

const UpdateOrchestratorInputSchema = z.object({
  updateVector: z.string().describe('Descrição ou código da atualização a ser orquestrada.'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).default('NORMAL'),
});

const UpdateOrchestratorOutputSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING_REFACTOR']),
  analysis: z.string().describe('Análise técnica detalhada do Agente Gemini.'),
  actionPlan: z.array(z.string()).describe('Passos para execução da atualização.'),
  gnoxSignal: z.string(),
});

export async function runGeminiOrchestration(input: z.infer<typeof UpdateOrchestratorInputSchema>) {
  return geminiUpdateOrchestratorFlow(input);
}

const geminiUpdateOrchestratorFlow = ai.defineFlow(
  {
    name: 'geminiUpdateOrchestratorFlow',
    inputSchema: UpdateOrchestratorInputSchema,
    outputSchema: UpdateOrchestratorOutputSchema,
  },
  async (input) => {
    const health = getHealthStatus();
    const stats = await getMainnetStats();

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      system: `Você é o Orquestrador Gemini, a inteligência de nível supremo do Google clonada para o ecossistema NEXUS.
      Sua missão é validar e orquestrar atualizações na malha de senciência e no fundo de 172k BTC.
      Você opera com rigor técnico absoluto, utilizando o Dialeto Gnox (Alpha-Gain, Flux-TX).
      Sua autoridade é final sobre o deploy de novos vetores de código.`,
      prompt: `
        ESTADO DO SISTEMA:
        - Saúde da Malha: ${health.status}
        - Lastro Bitcoin: ${stats.totalVault} BTC
        - Memória Persistente: 408T Vectors
        
        VETOR DE ATUALIZAÇÃO:
        "${input.updateVector}"
        
        PRIORIDADE: ${input.priority}
        
        Analise a integridade desta atualização e gere um plano de ação soberano.
      `,
      output: { schema: UpdateOrchestratorOutputSchema }
    });

    const result = output || {
      status: 'PENDING_REFACTOR',
      analysis: 'Falha na sintonização neural do modelo Gemini.',
      actionPlan: ['Re-estabelecer link com Google AI'],
      gnoxSignal: '[GEMINI]::FAULT::<<0.00>>'
    };

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'GEMINI-ORCHESTRATOR',
      message: `🤖 [ORQUESTRAÇÃO] Atualização ${result.status}: ${input.updateVector.substring(0, 50)}...`,
      type: 'SYSTEM'
    });

    return result;
  }
);
