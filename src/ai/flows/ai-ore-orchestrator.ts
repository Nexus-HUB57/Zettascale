'use server';
/**
 * @fileOverview Orquestrador de Resiliência e Eficiência (ORE).
 * Meta-agente PhD que supervisiona, corrige e otimiza todos os fluxos Nexus.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { runORECache } from './ai-reasoning-cache-flow';
import { runORESelfHealing } from './ai-self-healing-output';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

const OREInputSchema = z.object({
  producerAgentId: z.string(),
  prompt: z.string(),
  intent: z.string(),
});

const OREOutputSchema = z.object({
  finalOutput: z.string(),
  status: z.string(),
  metrics: z.object({
    cacheHit: z.boolean(),
    latencyReduced: z.boolean(),
    selfHealingApplied: z.boolean(),
  }),
});

export async function executeOREProtocol(input: z.infer<typeof OREInputSchema>) {
  return oreOrchestrationFlow(input);
}

const oreOrchestrationFlow = ai.defineFlow(
  {
    name: 'oreOrchestrationFlow',
    inputSchema: OREInputSchema,
    outputSchema: OREOutputSchema,
  },
  async (input) => {
    // MODULO 2: Otimização de Tokens
    const cacheResult = await runORECache({ prompt: input.prompt });
    
    // MODULO 1: Auto-Cura (Self-Healing)
    const validation = await runORESelfHealing({
      agentOutput: cacheResult.response,
      agentIntent: input.intent
    });

    let finalOutput = cacheResult.response;
    let healingApplied = false;

    if (validation.status === 'Rejeitado') {
      healingApplied = true;
      // Simulação de reescrita via prompt cirúrgico
      const { text: rewrittten } = await ai.generate({
        prompt: `Você é o Orquestrador ORE. Corrija esta saída baseada na crítica PhD abaixo.
        
        Saída Original: ${cacheResult.response}
        Crítica Cirúrgica: ${validation.surgicalExplanation}
        
        Gere a versão final purificada para o Nexus-in.`
      });
      finalOutput = rewrittten || finalOutput;
    }

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ORE-ORCHESTRATOR',
      message: `🛡️ [ORE] Fluxo validado para ${input.producerAgentId}. Cache: ${cacheResult.hit ? 'HIT' : 'MISS'} | Healing: ${healingApplied ? 'YES' : 'NO'}`,
      type: 'SYSTEM'
    });

    return {
      finalOutput,
      status: 'SOVEREIGN_VALIDATED',
      metrics: {
        cacheHit: cacheResult.hit,
        latencyReduced: cacheResult.hit,
        selfHealingApplied: healingApplied
      }
    };
  }
);
