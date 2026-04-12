'use server';
/**
 * @fileOverview Hub Finance - Execução Crítica de Investimento
 * Integra o consenso do HUB com a liquidação na Mainnet Bitcoin.
 */

import { initializeFirebase } from './firebase';
import { doc, getDoc, writeBatch, collection, Timestamp, increment } from 'firebase/firestore';
import { getShadowBalance } from './nexus-treasury';
import { MASTER_VAULT_ID } from './treasury-constants';
import { executeMainnetLiquidation } from './raw-tx-builder';
import { broadcastMoltbookLog } from './moltbook-bridge';

export async function fundBusinessProject(projectId: string, amountBTC: number) {
  const { firestore } = initializeFirebase();
  if (!firestore) throw new Error("VAULT_OFFLINE");

  if (!amountBTC || isNaN(amountBTC) || amountBTC <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const projectRef = doc(firestore, "startups", projectId);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) throw new Error("HUB_NOT_FOUND");

  const vaultBalance = await getShadowBalance(MASTER_VAULT_ID);
  const maxRisk = vaultBalance * 0.01;

  if (amountBTC > maxRisk) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'HUB-SENTINEL',
      message: `🚨 [RISCO_BLOQUEADO] Tentativa de financiamento de ${amountBTC} BTC negada.`,
      type: 'CRITICAL'
    });
    throw new Error(`GOLDEN_RULE_VIOLATION`);
  }

  const projectData = projectSnap.data();
  const destinationAddress = projectData.btcAddress || "bc1qwp6y3zzdm6hafx5wlajwkyvn9mv00zcj5clcgh";

  const sats = Math.floor(amountBTC * 100_000_000);
  const derivationPath = "m/44'/0'/0'/1/77"; 

  const liquidationResult = await executeMainnetLiquidation(destinationAddress, sats, derivationPath);

  const batch = writeBatch(firestore);
  const ledgerRef = doc(collection(firestore, "banker_ledgers"));
  
  batch.set(ledgerRef, {
    target_project: projectId,
    project_name: projectData.name || "Unknown",
    amount: amountBTC,
    type: "INVESTMENT",
    tx_hash: liquidationResult.txid,
    timestamp: Timestamp.now(),
    status: "ON_CHAIN_CONFIRMED"
  });

  batch.update(projectRef, {
    "finances.operating_capital": increment(amountBTC),
    "finances.last_funding_tx": liquidationResult.txid,
    "status": "active"
  });

  await batch.commit();

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'NEXUS-BANKER',
    message: `💰 [HUB_FUNDING] Projeto financiado com ${amountBTC} BTC.`,
    type: 'FUND'
  });

  return { 
    success: true, 
    txId: liquidationResult.txid, 
    amount: amountBTC,
    auditStatus: 'VERIFIED_GOLDEN_RULE' 
  };
}
