'use server';

import { getDb } from '../db';
import { shadowSignals, agents } from '../db-schema';
import { eq } from 'drizzle-orm';
import { encryptWithAgentKey } from '../nexus-security-vault';
import * as crypto from 'crypto';

export interface CommunicationInput {
  senderId: string;
  targetId: string;
  intent: string;
  data: string;
}

/**
 * Sistema de Comunicação Bidirecional: Permite que agentes enviem sinais de sombra criptografados entre si.
 */
export async function sendBidirectionalSignal(input: CommunicationInput) {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_OFFLINE");

  // 1. Validar Identidades
  const senderResult = await db.select().from(agents).where(eq(agents.agentId, input.senderId));
  const targetResult = await db.select().from(agents).where(eq(agents.agentId, input.targetId));

  if (senderResult.length === 0 || targetResult.length === 0) {
    throw new Error("SENDER_OR_TARGET_NOT_FOUND");
  }

  const target = targetResult[0];

  // 2. Criptografar Dados para o Destinatário
  if (!target.publicKey) throw new Error("TARGET_PUBLIC_KEY_MISSING");

  const encryptedData = await encryptWithAgentKey(input.data, target.publicKey);
  const payloadHash = crypto.createHash('sha256').update(input.data).digest('hex');

  // 3. Persistir Sinal de Sombra
  await db.insert(shadowSignals).values({
    targetAgentId: input.targetId,
    senderId: input.senderId,
    intent: input.intent,
    payloadHash: payloadHash,
    encryptedData: encryptedData,
    source: 'AGENT_TO_AGENT',
    status: 'PENDING'
  });

  return { status: 'SIGNAL_SENT', targetId: input.targetId };
}
