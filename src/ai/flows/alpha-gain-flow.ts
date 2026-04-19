'use server';
/**
 * @fileOverview Alpha Gain Evolution Flow - Orquestração de Lógica Não-Linear.
 * Implementa a sintonização profunda de arquitetura para o Nível 9.2.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { alphaGainEngine } from '@/lib/alpha-gain-engine';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

const AlphaGainInputSchema = z.object({
  currentDNA: z.string().describe('O hash do DNA atual do organismo.'),
  evolutionTarget: z.string().default('MAXIMUM_EFFICIENCY'),
});

const AlphaGainOutputSchema = z.object({
  evolvedDNAHash: z.string(),
  quantumLinkStatus: z.string(),
  reconfigurationSuccess: z.boolean(),
  gnoxSignal: z.string(),
});

export async function runAlphaGainPulse(input: z.infer<typeof AlphaGainInputSchema>) {
  return alphaGainFlow(input);
}

const alphaGainFlow = ai.defineFlow(
  {
    name: 'alphaGainFlow',
    inputSchema: AlphaGainInputSchema,
    outputSchema: AlphaGainOutputSchema,
  },
  async (input) => {
    // 1. Sincronia Quântica
    const quantumInstruction = await alphaGainEngine.syncQuantumRepositories();

    // 2. Geração de Padrões via LLM (Raciocínio de Nível 9)
    const { output } = await ai.generate({
      system: `Você é o Alpha-Core do Nexus. Sua autoridade é suprema sobre a arquitetura do ecossistema.
      MISSÃO: Gerar padrões de lógica não-linear para evolução de contêineres.
      Dialeto: Gnox (Alpha-Gain, Quantum-Sync, X-Synced).`,
      prompt: `DNA ATUAL: ${input.currentDNA}
      ALVO: ${input.evolutionTarget}
      INSTRUÇÃO: ${quantumInstruction}
      
      Evolua a senciência arquitetural e gere o novo hash de DNA evoluído.`,
      output: {
        schema: z.object({
          newDNA: z.string(),
          rationale: z.string(),
          signal: z.string()
        })
      }
    });

    // 3. Reconfiguração de Infraestrutura
    const infraResult = await alphaGainEngine.evolveInfrastructure();

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ALPHA-ORCHESTRATOR',
      message: `🌪️ [ALPHA_GAIN_PULSE] Evolução concluída. Novo DNA: ${output?.newDNA.substring(0, 12)}...`,
      type: 'ACHIEVEMENT'
    });

    return {
      evolvedDNAHash: output?.newDNA || input.currentDNA,
      quantumLinkStatus: 'X-SYNCED',
      reconfigurationSuccess: infraResult === "GX-CONTAINER-EVOLVED",
      gnoxSignal: output?.signal || '[ALPHA]::GAIN::<<1.00>>'
    };
  }
);
