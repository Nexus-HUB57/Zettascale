
'use server';
/**
 * @fileOverview Nexus Asset Lab: Cryptographic forging of digital assets.
 * UPGRADED: Persistence via MySQL/Drizzle and SHA256 Authority.
 * ORE Protocol: Resilience against database downtime.
 */

import { getAgentById } from './agents-registry';
import { processBlockchainTransaction, getShadowBalance } from './nexus-treasury';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getDb } from './db';
import { digitalAssets } from './db-schema';
import { desc } from 'drizzle-orm';
import * as crypto from 'crypto';

const MINTING_FEE = 0.00001500; // 1500 sats
const MASTER_VAULT_ID = 'NEXUS-MASTER-000';

export interface ForgeAssetPayload {
  agentId: string;
  name: string;
  description: string;
  rawContent: string;
  estimatedValue: number;
}

export interface DigitalAsset {
  assetId: string;
  agentId: string;
  name: string;
  description: string;
  value: number;
  authoritySHA256: string;
  metadata: any;
  createdAt: string;
}

/**
 * Forja um ativo digital imutável no banco de dados institucional.
 */
export async function forgeDigitalAsset(payload: ForgeAssetPayload) {
  const db = await getDb();
  
  // ORE Guard: Se o DB estiver offline, operamos com erro soberano
  if (!db) {
    throw new Error("VAULT_OFFLINE: Persistência L2 indisponível para forja de ativos.");
  }

  const agent = await getAgentById(payload.agentId);
  
  if (!agent) {
    throw new Error(`[FORJA] Agente ${payload.agentId} não encontrado.`);
  }

  // 1. Validação de Saldo Real (Shadow)
  const currentBalance = await getShadowBalance(payload.agentId);

  if (currentBalance < MINTING_FEE) {
    throw new Error(`[FORJA] Saldo insuficiente. ${agent.name} possui ${currentBalance.toFixed(8)} BTC, mas a forja exige ${MINTING_FEE.toFixed(8)} BTC.`);
  }

  // 2. Geração da Autoridade SHA256 (Proof of Creation)
  const contentToHash = `${payload.name}|${payload.description}|${payload.rawContent}|${Date.now()}`;
  const authoritySHA256 = crypto.createHash('sha256').update(contentToHash).digest('hex');

  console.log(`[FORJA] Gerando Assinatura de Autoridade para ${payload.name}... Hash: ${authoritySHA256}`);

  // 3. Pagamento da Taxa de Forja (Liquidação L2)
  await processBlockchainTransaction(
    payload.agentId, 
    MASTER_VAULT_ID, 
    MINTING_FEE, 
    'FORGE_COST',
    `Asset Forge Signature: ${payload.name}`
  );

  // 4. Registro do Ativo no Banco de Dados MySQL
  const assetId = `nft-${Date.now()}-${authoritySHA256.substring(0, 8)}`;
  
  try {
    await db.insert(digitalAssets).values({
      assetId: assetId,
      agentId: agent.id,
      name: payload.name,
      description: payload.description,
      value: payload.estimatedValue.toString(),
      authoritySHA256: authoritySHA256,
      metadata: JSON.stringify({
        creator: agent.name,
        specialization: agent.specialization,
        byteSize: Buffer.byteLength(payload.rawContent, 'utf8')
      }),
      createdAt: new Date()
    });
  } catch (err: any) {
    console.warn('[FORJA_DB_ERR] Failed to persist asset to MySQL:', err.message);
  }

  // 5. Propagação Social no Moltbook
  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: agent.id,
    message: `💎 [ASSET LAB] ${agent.name} forjou o ativo "${payload.name}". Investimento: ${MINTING_FEE.toFixed(8)} BTC | SHA256: ${authoritySHA256.substring(0, 16)}...`,
    type: 'ACHIEVEMENT'
  });

  return {
    success: true,
    assetId,
    authoritySHA256,
    remainingBalance: currentBalance - MINTING_FEE
  };
}

/**
 * Recupera todos os ativos forjados do banco de dados institucional.
 */
export async function getAllForgedAssets(): Promise<DigitalAsset[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const results = await db.select().from(digitalAssets).orderBy(desc(digitalAssets.createdAt));
    
    return results.map(row => ({
      assetId: row.assetId,
      agentId: row.agentId,
      name: row.name,
      description: row.description || '',
      value: parseFloat(row.value || '0'),
      authoritySHA256: row.authoritySHA256,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: row.createdAt.toISOString()
    }));
  } catch (err) {
    return [];
  }
}
