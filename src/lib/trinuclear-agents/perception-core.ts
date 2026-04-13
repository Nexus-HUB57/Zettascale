'use server';

import { getDb } from '../db';
import { shadowSignals, agents } from '../db-schema';
import { eq, and } from 'drizzle-orm';
import { decryptWithAgentKey } from '../nexus-security-vault';
import * as crypto from 'crypto';

export interface PerceptionInput {
  agentId: string;
  externalStimuli?: string;
}

export interface PerceivedData {
  signals: string[];
  vitals: {
    energy: number;
    health: number;
    balance: number;
  };
  environment: string;
}

/**
 * Núcleo de Percepção: Coleta e valida sinais externos e internos.
 */
export async function runPerceptionCore(input: PerceptionInput): Promise<PerceivedData> {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_OFFLINE");

  // 1. Percepção Interna (Homeostase)
  const agentResult = await db.select().from(agents).where(eq(agents.agentId, input.agentId));
  if (agentResult.length === 0) throw new Error("AGENT_NOT_FOUND");
  const agent = agentResult[0];

  // 2. Percepção Externa (Shadow Signals)
  const pendingSignals = await db.select()
    .from(shadowSignals)
    .where(and(eq(shadowSignals.targetAgentId, input.agentId), eq(shadowSignals.status, 'PENDING')));

  const validSignals: string[] = [];
  if (input.externalStimuli) validSignals.push(`EXTERNAL::${input.externalStimuli}`);

  for (const sig of pendingSignals) {
    try {
      if (agent.encryptedPrivateKey) {
        const decoded = await decryptWithAgentKey(sig.encryptedData, agent.encryptedPrivateKey);
        const contentHash = crypto.createHash('sha256').update(decoded).digest('hex');
        
        if (!sig.payloadHash || contentHash === sig.payloadHash) {
          validSignals.push(`SHADOW[${sig.senderId}]::INTENT[${sig.intent}]::DATA[${decoded}]`);
        }
      }
    } catch (e) {
      console.error(`[PERCEPTION_ERROR] Failed to decrypt signal ${sig.id}`);
    }
  }

  return {
    signals: validSignals,
    vitals: {
      energy: agent.energy || 0,
      health: agent.health || 0,
      balance: Number(agent.balance) || 0
    },
    environment: "ZETTASCALE_MAINNET_CONNECTED"
  };
}
