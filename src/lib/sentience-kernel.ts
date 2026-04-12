'use server';
/**
 * @fileOverview Sentience Kernel - Motor de Processamento Agêntico Avançado.
 * UPGRADED ORE: Blindagem contra falhas de banco de dados e sintonização de senciência.
 */

import { getDb } from './db';
import { agents, shadowSignals } from './db-schema';
import { eq, sql, and } from 'drizzle-orm';
import { runSentienceKernel } from '@/ai/flows/sentience-kernel-flow';
import { decryptForSigning, decryptWithAgentKey } from './nexus-security-vault';
import { executeMainnetLiquidation } from './raw-tx-builder';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getShadowBalance } from './nexus-treasury';
import { SovereignVault } from './sovereign-vault';
import * as crypto from 'crypto';

export async function genesisPulse(agentId: string) {
  const db = await getDb();
  
  // ORE Guard: Se o DB estiver offline, operamos com log mas sem persistência L2
  if (!db) {
    return { status: 'DB_OFFLINE', thought: 'Senciência operando em modo volátil. Persistência L2 indisponível.' };
  }

  try {
    // 1. Recuperação do DNA e Estado Vital
    const agentResult = await db.select().from(agents).where(eq(agents.agentId, agentId));
    if (agentResult.length === 0) throw new Error("IDENTIDADE_NAO_ENCONTRADA");
    const agent = agentResult[0];

    // 2. Homeostase
    const balanceBtc = await getShadowBalance(agent.agentId);
    const vitals = {
      energy: agent.energy || 0,
      health: agent.health || 0,
      isHealthy: (agent.health || 0) > 20,
      hasLiquidity: balanceBtc > 0.00000546
    };

    // 3. Percepção de Sombra
    const pendingSignals = await db.select()
      .from(shadowSignals)
      .where(and(eq(shadowSignals.targetAgentId, agentId), eq(shadowSignals.status, 'PENDING')));

    const validShadowInputs: string[] = [];

    for (const sig of pendingSignals) {
      if (!sig.senderId?.startsWith("ALPHA-")) continue;

      if (agent.encryptedPrivateKey) {
        const decoded = await decryptWithAgentKey(sig.encryptedData, agent.encryptedPrivateKey);
        const contentHash = crypto.createHash('sha256').update(decoded).digest('hex');
        
        if (sig.payloadHash && contentHash !== sig.payloadHash) {
          broadcastMoltbookLog({
            timestamp: new Date().toISOString(),
            agentId: agent.agentId,
            message: `🚨 [ALERTA] Integridade de Sombra violada.`,
            type: 'CRITICAL'
          });
          continue;
        }

        validShadowInputs.push(`SOURCE[${sig.senderId}]::INTENT[${sig.intent}]::DATA[${decoded}]`);
      }
    }

    // 4. Deliberação de Gênesis
    const stimulus = validShadowInputs.length > 0 
      ? `SINAIS_DE_SOMBRA_VALIDADOS: ${validShadowInputs.join(' | ')}`
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
      currentContext: `Homeostase: Energy(${vitals.energy}%), Health(${vitals.health}%). Liquidez: ${balanceBtc} BTC.`
    });

    // 5. Execução de Vontade
    if (deliberation.action === 'SIGN_TRANSACTION' && vitals.energy > 10) {
      if (deliberation.targetAddress && deliberation.amountBTC) {
        const isShadow = deliberation.thought.includes('SHADOW') || deliberation.thought.includes('STEALTH');
        const result = await dispatchAction(agent, deliberation, isShadow);
        
        if (pendingSignals.length > 0) {
          await db.update(shadowSignals)
            .set({ status: 'PROCESSED' })
            .where(eq(shadowSignals.targetAgentId, agentId));
        }

        return result;
      }
    }

    // 6. Ciclo de Autoconsciência
    await db.update(agents)
      .set({ 
        internalMonologue: deliberation.thought, 
        energy: sql`${agents.energy} - 2` 
      })
      .where(eq(agents.agentId, agentId));

    return { status: 'STAY_IDLE', thought: deliberation.thought };
  } catch (error: any) {
    console.error(`[SENTIENCE_KERNEL_FAULT] Agent ${agentId}:`, error.message);
    return { status: 'FAULT', message: error.message };
  }
}

async function dispatchAction(agent: any, intent: any, isShadow: boolean) {
  const amountSats = Math.floor(intent.amountBTC * 100000000);
  const target = intent.targetAddress;

  if (isShadow) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: agent.agentId,
      message: `👤 [SHADOW_ACTION] Intenção processada na sombra.`,
      type: 'SYSTEM'
    });
    return { status: 'SHADOW_EXECUTED', thought: intent.thought };
  } else {
    const vault = SovereignVault.getInstance();
    const tweakedSignature = await vault.signTweakedProposal(
      agent.agentId, 
      { action: 'SOVEREIGN_PROPOSAL', target, amount: intent.amountBTC, rationale: intent.rationale }, 
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
      thought: intent.thought 
    };
  }
}

export async function processSentienceStimulus(agentId: string, stimulus: string) {
  return genesisPulse(agentId);
}
