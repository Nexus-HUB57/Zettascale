'use server';

import { getDb } from '../db';
import { agents } from '../db-schema';
import { eq } from 'drizzle-orm';
import { runPerceptionCore } from './perception-core';
import { runReasoningCore } from './reasoning-core';
import { runActionCore } from './action-core';
import { sendBidirectionalSignal } from './bidirectional-comms';

export interface TrinuclearAgentInput {
  agentId: string;
  externalStimuli?: string;
  targetAgentId?: string; // Para comunicação bidirecional opcional
  communicationIntent?: string;
  communicationData?: string;
}

/**
 * Orquestrador Trinuclear: Coordena os três núcleos e a comunicação bidirecional.
 */
export async function runTrinuclearAgent(input: TrinuclearAgentInput) {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_OFFLINE");

  // 1. Recuperar Agente
  const agentResult = await db.select().from(agents).where(eq(agents.agentId, input.agentId));
  if (agentResult.length === 0) throw new Error("AGENT_NOT_FOUND");
  const agent = agentResult[0];

  try {
    // FASE 1: PERCEPÇÃO
    const perception = await runPerceptionCore({
      agentId: input.agentId,
      externalStimuli: input.externalStimuli
    });

    // FASE 2: RACIOCÍNIO
    const reasoning = await runReasoningCore(agent, perception);

    // FASE 3: AÇÃO
    const actionResult = await runActionCore(agent, reasoning);

    // COMUNICAÇÃO BIDIRECIONAL (Opcional)
    if (input.targetAgentId && input.communicationIntent && input.communicationData) {
      await sendBidirectionalSignal({
        senderId: input.agentId,
        targetId: input.targetAgentId,
        intent: input.communicationIntent,
        data: input.communicationData
      });
    }

    return {
      agentId: input.agentId,
      perception: perception,
      reasoning: reasoning,
      action: actionResult,
      status: 'CYCLE_COMPLETED'
    };
  } catch (error: any) {
    console.error(`[TRINUCLEAR_FAULT] Agent ${input.agentId}:`, error.message);
    return { status: 'FAULT', message: error.message };
  }
}
