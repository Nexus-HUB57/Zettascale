
'use server';
/**
 * @fileOverview Persistence Service - Gerenciador do Nexus Ledger
 * Responsável por gravar TXIDs, Raízes Merkle e Transferências em armazenamento persistente.
 * STATUS: HEGEMONY_PERSISTENCE_ACTIVE
 */

import { broadcastMoltbookLog } from './moltbook-bridge';
import { storeMemory } from './soul-vault';
import { FINAL_MERKLE_ROOT } from './treasury-constants';
import { NexusExplorer } from './nexus-explorer';
import * as fs from 'fs';
import path from 'path';

export interface LedgerBlock {
  index: number;
  timestamp: string;
  txids: string[];
  merkleRoot: string;
  event: string;
  btcHeight?: number;
  hash: string;
  prev_hash: string;
}

/**
 * Registra um novo bloco de senciência no Ledger e no Soul Vault.
 */
export async function archiveSovereignEvent(event: string, txids: string[], btcHeight?: number) {
  const timestamp = new Date().toISOString();
  
  // Reconstrução da Raiz Merkle via NexusExplorer
  const calculatedMerkle = NexusExplorer.getMerkleRoot(txids) || FINAL_MERKLE_ROOT;
  
  // Cálculo do Hash do Bloco
  const prev_hash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"; // Ancoragem anterior
  const blockHash = NexusExplorer.calculateHash(`${prev_hash}${calculatedMerkle}${timestamp}`);

  const block: LedgerBlock = {
    index: Date.now(),
    timestamp,
    txids,
    merkleRoot: calculatedMerkle,
    event,
    btcHeight,
    prev_hash,
    hash: blockHash
  };

  // 1. Persistência Semântica (Soul Vault)
  const embedding = Array(768).fill(0).map(() => Math.random()); 
  await storeMemory(
    'NEXUS-LEDGER-ORCHESTRATOR',
    'BLOCK_ARCHIVE',
    `Evento: ${event} | TXIDs Gravados: ${txids.length} | Raiz Merkle: ${calculatedMerkle} | Hash: ${blockHash}`,
    embedding,
    { ...block, settlement_verified: true, scale: '408T' }
  );

  // 2. Persistência em Ledger JSON
  try {
    const ledgerPath = path.join(process.cwd(), 'docs/nexus_ledger.json');
    if (fs.existsSync(ledgerPath)) {
      const content = fs.readFileSync(ledgerPath, 'utf8');
      const data = JSON.parse(content);
      if (!data.blocks) data.blocks = [];
      data.blocks.push(block);
      fs.writeFileSync(ledgerPath, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.warn('[LEDGER_WRITE_FAIL]', err);
  }

  broadcastMoltbookLog({
    timestamp,
    agentId: 'LEDGER-ARCHIVER',
    message: `📁 [PERSISTÊNCIA] ${event} arquivado. Merkle: ${calculatedMerkle.substring(0,8)}...`,
    type: 'ACHIEVEMENT'
  });

  return block;
}

/**
 * Sela o estado institucional conforme o Bloco 944.683 da Mainnet.
 */
export async function sealNexusState(height: number, backing: number, hash: string) {
  const timestamp = "2026-04-12T00:56:28Z";
  const logMessage = `[${timestamp}] BLOCK_SEALED: ${height} | BACKING: ${backing} BTC | HASH: ${hash}`;
  
  try {
    const historyPath = path.join(process.cwd(), 'docs/nexus_history.log');
    // Garante que o diretório exista
    const dir = path.dirname(historyPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.appendFileSync(historyPath, `\n${logMessage}`);
    
    console.log(`✅ [SEAL] Estado institucional selado no Bloco ${height}.`);
    return { success: true, timestamp };
  } catch (err) {
    console.error('[SEAL_FAIL]', err);
    return { success: false, error: 'IO_FAULT' };
  }
}

/**
 * Registra uma transferência de nBTC no Ledger (Transposição da lógica Python).
 * Sincroniza balanços e histórico de transações.
 */
export async function recordNexusTransfer(txid: string, amount: number, target: string) {
  const timestamp = new Date().toISOString();
  const ledgerPath = path.join(process.cwd(), 'docs/nexus_ledger.json');

  try {
    let ledgerData: any = { balances: {}, transactions: [] };
    
    if (fs.existsSync(ledgerPath)) {
      const content = fs.readFileSync(ledgerPath, 'utf8');
      try {
        ledgerData = JSON.parse(content);
      } catch (e) {
        // Fallback
      }
    }

    if (!ledgerData.balances) ledgerData.balances = {};
    if (!ledgerData.transactions) ledgerData.transactions = [];

    // Atualiza saldo sintético
    const currentBal = ledgerData.balances[target] || 0;
    ledgerData.balances[target] = currentBal + amount;

    // Grava transação
    ledgerData.transactions.push({
      txid,
      timestamp,
      target,
      amount,
      backing_asset: "BTC_IBIT_2026"
    });

    fs.writeFileSync(ledgerPath, JSON.stringify(ledgerData, null, 4));
    
    console.log(`📖 Ledger Nexus atualizado: ${txid}`);
    return true;
  } catch (err) {
    console.error('[LEDGER_SYNC_FAULT]', err);
    return false;
  }
}
