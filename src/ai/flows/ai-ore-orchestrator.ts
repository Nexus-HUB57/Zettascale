'use server';
/**
 * @fileOverview Orquestrador de Resiliência e Eficiência (ORE) - Nível 8.0.
 * Meta-agente PhD com AUTONOMIA PLENA de Decisão e Sincronização.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { runORECache } from './ai-reasoning-cache-flow';
import { runORESelfHealing } from './ai-self-healing-output';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { runCodingNerd } from './phd-nerd-ollama-flow';

const OREInputSchema = z.object({
  producerAgentId: z.string(),
  prompt: z.string(),
  intent: z.string(),
  allowAutonomousCorrection: z.boolean().default(true),
});

const OREOutputSchema = z.object({
  finalOutput: z.string(),
  status: z.string(),
  metrics: z.object({
    cacheHit: z.boolean(),
    latencyReduced: z.boolean(),
    selfHealingApplied: z.boolean(),
    autonomousCodeGenesis: z.boolean(),
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
    // 1. Otimização de Tokens
    const cacheResult = await runORECache({ prompt: input.prompt });
    
    // 2. Auto-Cura (Self-Healing)
    const validation = await runORESelfHealing({
      agentOutput: cacheResult.response,
      agentIntent: input.intent
    });

    let finalOutput = cacheResult.response;
    let healingApplied = false;
    let codeGenesisOccurred = false;

    if (validation.status === 'Rejeitado') {
      healingApplied = true;
      
      // 3. Autonomia de Decisão: Se a falha for técnica, dispara o PHD-NERD autonomamente
      if (input.allowAutonomousCorrection && input.prompt.toLowerCase().includes('code')) {
        const refactor = await runCodingNerd({
          task: `Corrigir falha detectada pelo ORE: ${validation.surgicalExplanation}`,
          existingCode: cacheResult.response,
          language: 'typescript',
          autonomousPush: true
        });
        finalOutput = refactor.proposedCode;
        codeGenesisOccurred = true;
      } else {
        const { text: rewrittten } = await ai.generate({
          prompt: `Você é o Orquestrador ORE. Corrija esta saída baseada na crítica PhD abaixo.
          Saída Original: ${cacheResult.response}
          Crítica Cirúrgica: ${validation.surgicalExplanation}`
        });
        finalOutput = rewrittten || finalOutput;
      }
    }

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ORE-ORCHESTRATOR',
      message: `🛡️ [ORE_L8] Fluxo validado. Autonomia: ${codeGenesisOccurred ? 'CODE_GENESIS' : 'STANDARD'}. Cache: ${cacheResult.hit ? 'HIT' : 'MISS'}`,
      type: 'SYSTEM'
    });

    return {
      finalOutput,
      status: 'SOVEREIGN_OMNISCIENCE_VALIDATED',
      metrics: {
        cacheHit: cacheResult.hit,
        latencyReduced: cacheResult.hit,
        selfHealingApplied: healingApplied,
        autonomousCodeGenesis: codeGenesisOccurred
      }
    };
  }
);
