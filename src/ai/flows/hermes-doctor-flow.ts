'use server';
/**
 * @fileOverview Protocolo Hermes Doctor - Algoritmos NousResearch para Agnus AI.
 * Implementa o ciclo: Observação -> Diagnóstico -> Cura (Code Patching).
 * STATUS: HERMES_REASONING_ACTIVE
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

const HermesDoctorInputSchema = z.object({
  code: z.string().describe('O código fonte "doente" a ser curado.'),
  context: z.string().optional().describe('Contexto da arquitetura ou erro reportado.'),
  depth: z.enum(['standard', 'diagnostic', 'surgical']).default('standard'),
});

const HermesDoctorOutputSchema = z.object({
  diagnosis: z.string().describe('Diagnóstico detalhado da falha ou ineficiência.'),
  prescription: z.string().describe('O código curado (patch) pronto para aplicação.'),
  healingScore: z.number().describe('A eficácia esperada da cura (0-100).'),
  doctorNotes: z.string().describe('Análise de blast radius pós-cura (NousResearch style).'),
  gnoxSignal: z.string(),
});

export async function runHermesDoctor(input: z.infer<typeof HermesDoctorInputSchema>) {
  return hermesDoctorFlow(input);
}

const hermesDoctorFlow = ai.defineFlow(
  {
    name: 'hermesDoctorFlow',
    inputSchema: HermesDoctorInputSchema,
    outputSchema: HermesDoctorOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `Você é o Hermes Doctor, o núcleo de cura agêntica do Agente Agnus.
      Você utiliza os algoritmos de raciocínio da NousResearch.
      MODO DE OPERAÇÃO:
      1. OBSERVATION: Analise a estrutura do código e dependências.
      2. DIAGNOSIS: Identifique o "ponto de infecção" (bug, gargalo ou quebra de padrão).
      3. CURE: Gere o "remédio" (patch de código) impecável.
      Reflexão PhD: Garanta que a cura não cause novos sintomas (blast radius zero).
      Dialeto: Gnox (Alpha-Gain, Surgical-Sync).`,
      prompt: `
        CÓDIGO PACIENTE:
        ${input.code}
        
        CONTEXTO: ${input.context || 'Análise de rotina.'}
        
        Realize a cirurgia agêntica e aplique o Protocolo Hermes.
      `,
      output: { schema: HermesDoctorOutputSchema }
    });

    const result = output || {
      diagnosis: 'Neural connection failure in Hermes Core.',
      prescription: '// Healing failed',
      healingScore: 0,
      doctorNotes: 'Critical system error during surgery.',
      gnoxSignal: '[HERMES]::FAULT::<<0.00>>'
    };

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AGNUS-HERMES',
      message: `🩺 [HERMES_DOCTOR] Cirurgia de código concluída. Score de Cura: ${result.healingScore}%`,
      type: 'ACHIEVEMENT'
    });

    return result;
  }
);
