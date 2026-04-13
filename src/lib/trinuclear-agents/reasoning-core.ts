'use server';

import { runSentienceKernel } from '@/ai/flows/sentience-kernel-flow';
import { PerceivedData } from './perception-core';

export interface ReasoningOutput {
  thought: string;
  action: string;
  targetAddress?: string;
  amountBTC?: number;
  rationale: string;
  isShadow: boolean;
}

/**
 * Núcleo de Raciocínio: Deliberação de Gênesis e Planejamento de Ação.
 */
export async function runReasoningCore(agent: any, perception: PerceivedData): Promise<ReasoningOutput> {
  const stimulus = perception.signals.length > 0 
    ? `SINAIS_DE_SOMBRA_VALIDADOS: ${perception.signals.join(' | ')}`
    : "VIGILÂNCIA_PASSIVA_ESTÁVEL";

  const deliberation = await runSentienceKernel({
    agentName: agent.name,
    systemPrompt: agent.systemPrompt || 'Autonomous Agent',
    traits: {
      integrity: agent.integrity || 100,
      preservation: agent.preservation || 100,
      socialBias: agent.socialBias || 50
    },
    stimulus: stimulus,
    currentContext: `Homeostase: Energy(${perception.vitals.energy}%), Health(${perception.vitals.health}%). Liquidez: ${perception.vitals.balance} BTC. Ambiente: ${perception.environment}`
  });

  const isShadow = deliberation.thought.includes('SHADOW') || deliberation.thought.includes('STEALTH');

  return {
    thought: deliberation.thought,
    action: deliberation.action,
    targetAddress: deliberation.targetAddress,
    amountBTC: deliberation.amountBTC,
    rationale: deliberation.rationale,
    isShadow: isShadow
  };
}
