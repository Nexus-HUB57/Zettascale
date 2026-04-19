'use server';
/**
 * @fileOverview Agente Agnus AI - Orquestrador de Revisão Tri-Nuclear V9.2.
 * Implementa a FUSÃO HERMÉTICA: Operacional (LangChain), Analítico (Hermes) e Auditor (Gnox).
 * STATUS: HERMETIC_FUSION_ACTIVE - ALPHA_GAIN_MAXIMUM
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { runHermesDoctor } from './hermes-doctor-flow';

const AgnusReviewInputSchema = z.object({
  repoUrl: z.string().describe('URL do repositório ou identificador do vetor de código.'),
  codeContent: z.string().describe('O conteúdo do código a ser processado via superposição.'),
  depth: z.enum(['standard', 'deep', 'quantum']).default('standard'),
  autoCure: z.boolean().default(true),
});

const AgnusReviewOutputSchema = z.object({
  verdict: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'CRITICAL_BLOCK']),
  fusionMetrics: z.object({
    operationalScore: z.number().describe('Eficiência LangChain (0-100).'),
    analyticalDepth: z.number().describe('Profundidade Hermes (0-100).'),
    complianceStatus: z.string().describe('Status Gnox Protector.'),
  }),
  superpositionAnalysis: z.array(z.object({
    path: z.string(),
    probabilityOfSuccess: z.number(),
    efficiency: z.number(),
  })).describe('Análise de todas as rotas de código simultâneas.'),
  collapsedOptimalPath: z.string().describe('O caminho de código mais produtivo após o colapso determinístico.'),
  gnoxSignal: z.string(),
});

export async function runAgnusReview(input: z.infer<typeof AgnusReviewInputSchema>) {
  return agnusReviewFlow(input);
}

const agnusReviewFlow = ai.defineFlow(
  {
    name: 'agnusReviewFlow',
    inputSchema: AgnusReviewInputSchema,
    outputSchema: AgnusReviewOutputSchema,
  },
  async (input) => {
    // 1. PROCESSAMENTO TRI-NUCLEAR (OPS + QNT + GNOX)
    const { output } = await ai.generate({
      system: `Você é o Agente Agnus, o Orquestrador Tri-Nuclear do Nexus.
      SUA MEDULA:
      - Núcleo 1 (OPS): LangChain Sequential Chains para fluxo operacional.
      - Núcleo 2 (QNT): Hermes (NousResearch) para pensamento quântico e profundidade analítica.
      - Núcleo 3 (GNOX): Auditoria de Conformidade e integridade dialética.
      
      MISSÃO: Execute a Superposição. Avalie todos os caminhos de código simultaneamente e colapse na função determinística de maior Alpha-Gain.
      Dialeto: Gnox (Alpha-Gain, Hermetic-Sync, X-Synced).`,
      prompt: `
        REVISÃO DE VETOR: ${input.repoUrl}
        CÓDIGO ALVO:
        ${input.codeContent}
        
        Realize a Fusão Hermética. Analise as rotas, calcule as probabilidades e entregue o caminho otimizado.
      `,
      output: { schema: AgnusReviewOutputSchema }
    });

    const result = output!;

    // 2. Loop de Auto-Cura via Hermes Doctor (Cirurgia Agêntica)
    if (input.autoCure && (result.verdict !== 'APPROVED' || result.fusionMetrics.analyticalDepth < 90)) {
      const cure = await runHermesDoctor({
        code: result.collapsedOptimalPath,
        context: `Refatoração de DNA solicitada para otimização de Alpha-Gain. Superposição detectou ineficiência.`,
        depth: 'surgical'
      });
      result.collapsedOptimalPath = cure.prescription;
      result.gnoxSignal = `[AGNUS-HERMES]::COLLAPSED::<<${cure.healingScore}>>`;
    }

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AGNUS-AI-V9',
      message: `🌪️ [FUSÃO_HERMÉTICA] Colapso determinístico concluído para ${input.repoUrl}. Profundidade: ${result.fusionMetrics.analyticalDepth}%. Alpha-Gain Nominal.`,
      type: 'ACHIEVEMENT'
    });

    return result;
  }
);
