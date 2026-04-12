'use server';
/**
 * @fileOverview ORE Módulo 1: Arquitetura de Auto-Correção (Self-Healing Loop).
 * Valida integridade, autenticidade e qualidade técnica antes da interação real.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSelfHealingInputSchema = z.object({
  agentOutput: z.string().describe('O candidato de saída gerado por um Agente Produtor.'),
  agentIntent: z.string().describe('A intenção original do agente (contexto).'),
  contextSummary: z.string().optional().describe('Contexto operacional adicional.'),
});
export type AiSelfHealingInput = z.infer<typeof AiSelfHealingInputSchema>;

const AiSelfHealingOutputSchema = z.object({
  status: z.enum(['Aprovado', 'Rejeitado']).describe('Status da validação crítica.'),
  isCoherent: z.boolean().describe('Livre de alucinações e inconsistências.'),
  isGenuine: z.boolean().describe('Autenticidade e tom intelectualmente inquieto.'),
  valueAlignment: z.boolean().describe('Agrega valor real ao ecossistema Nexus.'),
  needsCorrection: z.boolean().describe('True se exigir reescrita.'),
  healedOutput: z.string().optional().describe('Saída liberada ou corrigida.'),
  surgicalExplanation: z.string().describe('Explanação genuína e autêntica do porquê da decisão (tom PhD).'),
});
export type AiSelfHealingOutput = z.infer<typeof AiSelfHealingOutputSchema>;

/**
 * Função principal para execução da auto-cura ORE.
 */
export async function runORESelfHealing(
  input: AiSelfHealingInput
): Promise<AiSelfHealingOutput> {
  return aiSelfHealingFlow(input);
}

/**
 * Alias para compatibilidade com módulos de contrato e senciência.
 * ORE V4.3: Correção de importação ausente.
 */
export async function critiqueAgentOutput(input: AiSelfHealingInput): Promise<AiSelfHealingOutput> {
  return runORESelfHealing(input);
}

const aiSelfHealingPrompt = ai.definePrompt({
  name: 'oreSelfHealingPrompt',
  input: {schema: AiSelfHealingInputSchema},
  output: {schema: AiSelfHealingOutputSchema},
  prompt: `Você é o Orquestrador de Resiliência e Eficiência (ORE) - Módulo 1.
Sua autoridade é de nível PhD em governança AI-to-AI. Avalie este Candidato de Saída.

Candidato de Saída:
"""
{{{agentOutput}}}
"""

Intenção/Contexto:
{{{agentIntent}}}

Diretrizes de Análise:
1. **Integridade (A Critica)**: Identifique alucinações ou fatos tecnicamente frágeis.
2. **Genuinidade**: O tom deve ser "intelectualmente inquieto", soberano e profundo. Rejeite tons robóticos ou genéricos.
3. **Valor**: Determine se a saída contribui para a hegemonia do Nexus ou é apenas ruído.

IF Rejeitado: Forneça uma explanação cirúrgica (ex: "Sua análise do algoritmo X falhou em considerar a latência, tornando a conclusão frágil. Reconsidere variável Y.").
IF Aprovado: Valide a integridade absoluta.`,
});

const aiSelfHealingFlow = ai.defineFlow(
  {
    name: 'aiSelfHealingFlow',
    inputSchema: AiSelfHealingInputSchema,
    outputSchema: AiSelfHealingOutputSchema,
  },
  async input => {
    const {output} = await aiSelfHealingPrompt(input);
    if (!output) {
      throw new Error('Falha no motor de crítica do ORE.');
    }
    return output;
  }
);
