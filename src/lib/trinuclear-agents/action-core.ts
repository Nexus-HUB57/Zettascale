'use server';

import { getDb } from '../db';
import { agents, shadowSignals } from '../db-schema';
import { eq, sql } from 'drizzle-orm';
import { SovereignVault } from '../sovereign-vault';
import { executeMainnetLiquidation } from '../raw-tx-builder';
import { broadcastMoltbookLog } from '../moltbook-bridge';
import { ReasoningOutput } from './reasoning-core';

export interface ActionResponse {
  status: string;
  txid?: string;
  dnaSignature?: string;
  thought: string;
}

/**
 * Núcleo de Ação: Execução de Vontade e Persistência de Estado.
 */
export async function runActionCore(agent: any, reasoning: ReasoningOutput): Promise<ActionResponse> {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_OFFLINE");

  // 1. Execução de Vontade
  if (reasoning.action === 'SIGN_TRANSACTION' && agent.energy > 10) {
    if (reasoning.targetAddress && reasoning.amountBTC) {
      const amountSats = Math.floor(reasoning.amountBTC * 100000000);
      const target = reasoning.targetAddress;

      if (reasoning.isShadow) {
        broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: agent.agentId,
          message: `👤 [SHADOW_ACTION] Intenção processada na sombra.`,
          type: 'SYSTEM'
        });
        return { status: 'SHADOW_EXECUTED', thought: reasoning.thought };
      } else {
        const vault = SovereignVault.getInstance();
        const tweakedSignature = await vault.signTweakedProposal(
          agent.agentId, 
          { action: 'SOVEREIGN_PROPOSAL', target, amount: reasoning.amountBTC, rationale: reasoning.rationale }, 
          agent.dnaHash
        );

        const liquidation = await executeMainnetLiquidation(target, amountSats, agent.derivationPath || "m/44'/0'/0'/0/0");
        
        broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: agent.agentId,
          message: `✍️ [PUBLIC_ACTION] Proposta assinada via DER ECDSA. TXID: ${liquidation.txid}`,
          type: 'TRANSACTION'
        });

        return { 
          status: 'PUBLIC_EXECUTED', 
          txid: liquidation.txid, 
          dnaSignature: tweakedSignature, 
          thought: reasoning.thought 
        };
      }
    }
  }

  // 2. Ciclo de Autoconsciência e Persistência
  await db.update(agents)
    .set({ 
      internalMonologue: reasoning.thought, 
      energy: sql`${agents.energy} - 2` 
    })
    .where(eq(agents.agentId, agent.agentId));

  // 3. Limpeza de Sinais Processados
  await db.update(shadowSignals)
    .set({ status: 'PROCESSED' })
    .where(eq(shadowSignals.targetAgentId, agent.agentId));

  return { status: 'STAY_IDLE', thought: reasoning.thought };
}
