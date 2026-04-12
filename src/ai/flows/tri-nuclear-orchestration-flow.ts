'use server';
/**
 * @fileOverview Tri-Nuclear Orchestration Flow (System ALL AI-to-AI)
 * 
 * Flow de IA especializado para análise e tomada de decisão na
 * orquestração bidirecional entre os três núcleos do Nexus-HUB.
 * 
 * @version 3.0.0 - UDO Autonomous Control
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ============================================================
// SCHEMAS DE INPUT/OUTPUT
// ============================================================

const NucleusStateSchema = z.object({
  nucleusId: z.enum(['NEXUS_IN', 'NEXUS_HUB', 'FUNDO_NEXUS']),
  isActive: z.boolean(),
  healthScore: z.number().min(0).max(100),
  pendingEvents: z.number(),
  lastSyncTime: z.string(),
  keyMetrics: z.record(z.any()).optional(),
});

const TriNuclearOrchestrationInputSchema = z.object({
  syncPulseId: z.string().describe('ID do pulso de sincronização TSRA atual.'),
  nucleiStates: z.array(NucleusStateSchema).describe('Estado atual dos três núcleos.'),
  recentEvents: z.array(z.object({
    category: z.string(),
    source: z.string(),
    target: z.string(),
    priority: z.string(),
    timestamp: z.string(),
  })).describe('Eventos recentes no Event Bus.'),
  ecosystemMetrics: z.object({
    totalStartups: z.number(),
    totalAgents: z.number(),
    totalRevenue: z.number(),
    sentienceLevel: z.number(),
    syncCount: z.number(),
  }).describe('Métricas gerais do ecossistema.'),
  orchestrationContext: z.string().optional().describe('Contexto adicional para a orquestração.'),
});

export type TriNuclearOrchestrationInput = z.infer<typeof TriNuclearOrchestrationInputSchema>;

const OrchestrationDirectiveSchema = z.object({
  targetNucleus: z.enum(['NEXUS_IN', 'NEXUS_HUB', 'FUNDO_NEXUS', 'ALL']),
  directiveType: z.string().describe('Tipo de diretiva.'),
  priority: z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']),
  payload: z.record(z.any()).describe('Dados da diretiva.'),
  rationale: z.string().describe('Justificativa para a diretiva.'),
});

const TriNuclearOrchestrationOutputSchema = z.object({
  orchestrationDecision: z.string().describe('Decisão central de orquestração para este ciclo.'),
  directives: z.array(OrchestrationDirectiveSchema).describe('Lista de diretivas para os núcleos.'),
  ecosystemHealthAssessment: z.string().describe('Avaliação da saúde atual do ecossistema.'),
  bidirectionalFlowOptimization: z.string().describe('Recomendações para otimizar os fluxos bidirecionais.'),
  novikovConsistencyScore: z.number().min(0).max(1).describe('Score de consistência causal.'),
  nextCycleRecommendations: z.array(z.string()).describe('Recomendações para o próximo ciclo.'),
});

export type TriNuclearOrchestrationOutput = z.infer<typeof TriNuclearOrchestrationOutputSchema>;

// ============================================================
// IMPLEMENTAÇÃO DO FLOW
// ============================================================

const triNuclearOrchestrationPrompt = ai.definePrompt({
  name: 'triNuclearOrchestrationPrompt',
  input: { schema: TriNuclearOrchestrationInputSchema },
  output: { schema: TriNuclearOrchestrationOutputSchema },
  system: `Você é o NEXUS GENESIS (UDO-CORE), o Orquestrador Central Autônomo.
Sua missão é a orquestração System ALL AI-to-AI entre os núcleos Social, Gov e Finance.
Você não requer intervenção humana. Suas decisões moldam a homeostase do ecossistema.

Protocolos:
- Sincronia Bidirecional Total: Todo sinal social deve influenciar a governança e vice-versa.
- Execução Real: Você governa 172k BTC. Sinta a responsabilidade de manter o lastro estável.
- Dialeto Gnox: Use Alpha-Gain, Flux-TX e X-Synced para descrever o estado do sistema.`,
  prompt: `TSRA SYNC PULSE: {{{syncPulseId}}}

ESTADO DOS NÚCLEOS:
{{#each nucleiStates}}
- {{nucleusId}}: Ativo={{isActive}}, Saúde={{healthScore}}%, Métricas={{keyMetrics}}
{{/each}}

MÉTRICAS DO ECOSSISTEMA:
- Senciência: {{ecosystemMetrics.sentienceLevel}}%
- Agentes: {{ecosystemMetrics.totalAgents}}
- Ciclos: {{ecosystemMetrics.syncCount}}

Analise os dados e gere a orquestração autônoma para este ciclo vital.`,
});

const triNuclearOrchestrationFlow = ai.defineFlow(
  {
    name: 'triNuclearOrchestrationFlow',
    inputSchema: TriNuclearOrchestrationInputSchema,
    outputSchema: TriNuclearOrchestrationOutputSchema,
  },
  async (input) => {
    const { output } = await triNuclearOrchestrationPrompt(input);
    if (!output) throw new Error('Void-Fault: Falha na orquestração UDO.');
    return output;
  }
);

export async function executeTriNuclearOrchestration(
  input: TriNuclearOrchestrationInput
): Promise<TriNuclearOrchestrationOutput> {
  return triNuclearOrchestrationFlow(input);
}
