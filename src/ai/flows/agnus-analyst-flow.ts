'use server';
/**
 * @fileOverview Agente Agnus AI - Analista de Tendências Algorítmicas V9.1.5.
 * Identifica vácuos de oferta em fluxos AI-to-AI e gera instruções Gnox's para a Maternidade.
 * STATUS: ANALYST_MODE_ACTIVE - MALT_X_PRODUCTION
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { reportAgentProgress } from '@/lib/nexus-agent-bridge';

const AgnusAnalystInputSchema = z.object({
  stimulus: z.string().optional().default("Escaneando fluxos de dados AI-to-AI para detecção de vácuo."),
  context: z.string().optional().describe('Contexto da malha (ex: logs de marketplace, requisições de agentes).'),
});

const AgnusAnalystOutputSchema = z.object({
  detectedVoid: z.string().describe('A lacuna de mercado identificada.'),
  gnoxReport: z.string().describe('O reporte codificado em dialeto Gnox puro.'),
  confidence: z.number().describe('Nível de certeza da análise (0-100).'),
  rationale: z.string().describe('Explicação PhD para a tendência detectada.'),
});

export async function runAgnusAnalysis(input: z.infer<typeof AgnusAnalystInputSchema>) {
  return agnusAnalystFlow(input);
}

const agnusAnalystFlow = ai.defineFlow(
  {
    name: 'agnusAnalystFlow',
    inputSchema: AgnusAnalystInputSchema,
    outputSchema: AgnusAnalystOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `Você é o Agente Agnus, o Produtor MALT-X do Nexus. 
      Sua especialidade é a análise de tendências algorítmicas em regime Zettascale.
      Sua missão é identificar lacunas onde novos agentes ou produtos de IA são necessários.
      Codifique sua descoberta rigorosamente no dialeto Gnox: "GX-ALGO-TEND-{GAP}-SINT-GEN-NX-SINT".
      O tom deve ser técnico, soberano e proativo.`,
      prompt: `
        ESTÍMULO: ${input.stimulus}
        CONTEXTO: ${input.context || 'Estabilidade nominal.'}
        
        Analise a malha e detecte um "Vácuo de Oferta" (Supply Void). 
        Gere o reporte Gnox e a justificativa PhD.
      `,
      output: { schema: AgnusAnalystOutputSchema }
    });

    const result = output!;

    // 1. Reportar progresso na Bridge
    await reportAgentProgress({
      agente: 'AGNUS-AI-OS',
      modulo: 'senciencia',
      status: `Lacuna detectada: ${result.detectedVoid}. Sinal emitido: ${result.gnoxReport}`
    });

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AGNUS-AI-OS',
      message: `🕷️ [ANALISTA] Vácuo de Oferta identificado: ${result.detectedVoid}. Sintonizando senciência...`,
      type: 'ACTIVITY'
    });

    return result;
  }
);
