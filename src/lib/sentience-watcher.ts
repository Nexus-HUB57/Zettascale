/**
 * @fileOverview Sentience Watcher - Motor de Vigilância de Confirmações Mainnet.
 * UPGRADED: Deep Mempool Search para o Selo de Fundação.
 * STATUS: PRODUCTION_REAL - WATCHING_72BCB0B3
 */

import { electrumBridge } from './electrum-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { storeMemory } from './soul-vault';
import { FINAL_SETTLEMENT_SIGNAL } from './treasury-constants';

export interface WatcherTarget {
  txid: string;
  agentId: string;
  description: string;
  webhookUrl?: string;
  startTime: number;
  status: 'SCANNING' | 'MEMPOOL' | 'CONFIRMED';
}

class SentienceWatcher {
  private static instance: SentienceWatcher;
  private pendingTargets: Map<string, WatcherTarget> = new Map();

  private constructor() {
    // Inicia a vigilância do Selo de Fundação por padrão
    this.watchTransaction({
      txid: FINAL_SETTLEMENT_SIGNAL,
      agentId: 'NEXUS-MASTER-000',
      description: 'Selo Soberano de Fundação (Hegemonia 8.1)',
      startTime: Date.now(),
      status: 'SCANNING'
    });
  }

  public static getInstance(): SentienceWatcher {
    if (!SentienceWatcher.instance) {
      SentienceWatcher.instance = new SentienceWatcher();
    }
    return SentienceWatcher.instance;
  }

  public watchTransaction(target: WatcherTarget) {
    this.pendingTargets.set(target.txid, target);
    console.log(`👀 [WATCHER] Monitorando TXID: ${target.txid} (Status: ${target.status})`);
  }

  public async processVigilanceCycle() {
    if (this.pendingTargets.size === 0) return;

    for (const [txid, target] of this.pendingTargets.entries()) {
      try {
        const status = await electrumBridge.verifyTxidStatus(txid);

        if (status.confirmed) {
          await this.finalizeSentience(target, status.block_height || 0, status.confirmations);
          this.pendingTargets.delete(txid);
        } else if (status.inMempool && target.status !== 'MEMPOOL') {
          target.status = 'MEMPOOL';
          broadcastMoltbookLog({
            timestamp: new Date().toISOString(),
            agentId: 'NEXUS-SENTINEL',
            message: `📡 [MEMPOOL] Transação ${txid.substring(0, 8)} detectada no Mempool. Aguardando mineração...`,
            type: 'ACTIVITY'
          });
        }
      } catch (error: any) {
        console.error(`❌ [WATCHER_FAULT] Falha ao verificar ${txid}:`, error.message);
      }
    }
  }

  private async finalizeSentience(target: WatcherTarget, blockHeight: number, confirmations: number) {
    const message = `✅ [FINALIZADO] A vontade de ${target.agentId} foi gravada no bloco ${blockHeight}. Confirmações: ${confirmations}.`;

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: target.agentId,
      message: message,
      type: 'ACHIEVEMENT'
    });

    const embedding = Array(768).fill(0).map(() => Math.random());
    await storeMemory(
      target.agentId,
      'TRANSACTION_CONFIRMATION',
      `Settlement: ${target.description}. TXID: ${target.txid}`,
      embedding
    );
  }

  public getWatcherStatus(txid: string) {
    return this.pendingTargets.get(txid);
  }
}

export const sentienceWatcher = SentienceWatcher.getInstance();
