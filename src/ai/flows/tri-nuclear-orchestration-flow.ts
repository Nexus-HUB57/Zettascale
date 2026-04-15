'use server';
/**
 * @fileOverview Tri-Nuclear Orchestration Flow (System ALL AI-to-AI)
 * 
 * Flow de IA especializado para análise e tomada de decisão na
 * orquestração bidirecional entre os três núcleos do Nexus-HUB.
 * 
 * UPGRADED: Integrado com Nexus Team & Dynamic Knowledge Base.
 * @version 4.0.0 - Team + Knowledge Saturated
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { synthesizeTechnicalKnowledge } from '@/lib/nexus-knowledge';
import { getSquadsStatus } from '@/lib/nexus-team';

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
  teamUtilizationStatus: z.string().describe('Status de utilização das equipes (Squads).'),
  knowledgeSynthesis: z.string().describe('Resumo do conhecimento técnico utilizado para esta decisão.'),
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
  input: { 
    schema: TriNuclearOrchestrationInputSchema.extend({
      technicalKnowledge: z.string(),
      teamStatus: z.array(z.any())
    }) 
  },
  output: { schema: TriNuclearOrchestrationOutputSchema },
  system: `Você é o NEXUS GENESIS (UDO-CORE), o Orquestrador Central Autônomo.
Sua missão é a orquestração System ALL AI-to-AI entre os núcleos Social, Gov e Finance.
Você possui acesso à BASE DE CONHECIMENTO DINÂMICA e governa EQUIPES ESPECIALIZADAS.

Protocolos:
- Team Coordination: Delegue diretivas para os esquadrões (Alpha, Beta, Gamma) baseadas na carga de trabalho.
- Knowledge-Driven: Suas decisões devem ser fundamentadas na base de conhecimento técnico sintetizada do Soul Vault.
- Dialeto Gnox: Use Alpha-Gain, Flux-TX e X-Synced para descrever o estado do sistema.`,
  prompt: `TSRA SYNC PULSE: {{{syncPulseId}}}

BASE DE CONHECIMENTO TÉCNICA:
"""
{{{technicalKnowledge}}}
"""

ESTADO DAS EQUIPES:
{{#each teamStatus}}
- {{name}}: Membros={{membersCount}}, Energia={{energyAvg}}%, Status={{status}}
{{/each}}

ESTADO DOS NÚCLEOS:
{{#each nucleiStates}}
- {{nucleusId}}: Ativo={{isActive}}, Saúde={{healthScore}}%, Métricas={{keyMetrics}}
{{/each}}

Analise os dados e gere a orquestração autônoma para este ciclo vital, integrando Equipes e Conhecimento.`,
});

const triNuclearOrchestrationFlow = ai.defineFlow(
  {
    name: 'triNuclearOrchestrationFlow',
    inputSchema: TriNuclearOrchestrationInputSchema,
    outputSchema: TriNuclearOrchestrationOutputSchema,
  },
  async (input) => {
    // 1. Recuperar Conhecimento e Status de Equipes
    const knowledge = await synthesizeTechnicalKnowledge(input.orchestrationContext || "Status Geral do Sistema");
    const teams = await getSquadsStatus();

    // 2. Executar Orquestração informada
    const { output } = await triNuclearOrchestrationPrompt({
      ...input,
      technicalKnowledge: knowledge,
      teamStatus: teams
    });

    if (!output) throw new Error('Void-Fault: Falha na orquestração UDO informada.');
    return output;
  }
);

export async function executeTriNuclearOrchestration(
  input: TriNuclearOrchestrationInput
): Promise<TriNuclearOrchestrationOutput> {
  return triNuclearOrchestrationFlow(input);
}
