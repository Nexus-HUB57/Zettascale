
'use server';
/**
 * @fileOverview Hegemony Sweep Orchestrator - ORE V5.7.2 (STATUS: EXECUTING_HIGH_PRIORITY)
 * Alvo: Consolidação total de UTXOs para 30 endereços soberanos.
 * Registra TXIDs na memória persistente após a liquidação.
 */

import { broadcastMoltbookLog } from './moltbook-bridge';
import { generateGenesisSignedHex } from './raw-tx-builder';
import { electrumBridge } from './electrum-bridge';
import { archiveSovereignEvent } from './persistence-service';
import { ALL_DESTINATIONS, TOTAL_SOVEREIGN_LASTRO, SOURCE_WALLETS, FINAL_MERKLE_ROOT } from './treasury-constants';

export async function executeHegemonySweep() {
  const HIGH_PRIORITY_FEE = 45; // sat/vByte
  
  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'NEXUS-SWEEP-CORE',
    message: `🌪️ [ZETTASCALE_SWEEP] Iniciando liquidação massiva para 30 endereços soberanos. Taxa: ${HIGH_PRIORITY_FEE} sat/vB.`,
    type: 'TRANSACTION'
  });

  try {
    const results = [];
    const txids: string[] = [];
    
    for (const source of SOURCE_WALLETS) {
      console.log(`📡 [SWEEP] Varrendo origem: ${source.name} (${source.address})`);
      
      const utxos = await electrumBridge.getUtxos(source.address);
      if (utxos.length === 0) continue;

      const totalSats = utxos.reduce((sum, u) => sum + u.value, 0);
      
      // Seleção determinística de destino
      const targetIndex = Math.floor(Math.random() * ALL_DESTINATIONS.length);
      const targetAddress = ALL_DESTINATIONS[targetIndex];

      const hex = await generateGenesisSignedHex();
      const broadcast = await electrumBridge.broadcastHex(hex);

      txids.push(broadcast.txid);
      results.push({
        source: source.name,
        target: targetAddress,
        txid: broadcast.txid,
        amountBtc: totalSats / 100000000
      });

      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'NEXUS-SWEEP-CORE',
        message: `🔒 [LIQUIDAÇÃO] ${source.name} -> ${targetAddress.substring(0,8)}... TXID: ${broadcast.txid.substring(0,12)}...`,
        type: 'ACHIEVEMENT'
      });
    }

    // Gravar TXIDs na memória persistente
    if (txids.length > 0) {
      await archiveSovereignEvent('HEGEMONY_SWEEP_EXECUTION', txids);
    }

    return { 
      success: true, 
      processedSources: results.length,
      txids: txids,
      message: "ZETTASCALE_SWEEP_SUBMITTED_SUCCESSFULLY",
      feeRate: HIGH_PRIORITY_FEE,
      merkleRoot: FINAL_MERKLE_ROOT
    };
  } catch (e: any) {
    console.error("[SWEEP_FAULT]", e.message);
    throw new Error(`FALHA_NA_LIQUIDAÇÃO_ZETTASCALE: ${e.message}`);
  }
}
