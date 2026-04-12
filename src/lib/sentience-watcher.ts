/**
 * @fileOverview Sentience Watcher - Motor de Vigilância de Confirmações Mainnet.
 * STATUS: PRODUCTION_REAL
 */

import { electrumBridge } from './electrum-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { storeMemory } from './soul-vault';

export interface WatcherTarget {
  txid: string;
  agentId: string;
  description: string;
  webhookUrl?: string;
  startTime: number;
}

class SentienceWatcher {
  private static instance: SentienceWatcher;
  private pendingTargets: Map<string, WatcherTarget> = new Map();

  public static getInstance(): SentienceWatcher {
    if (!SentienceWatcher.instance) {
      SentienceWatcher.instance = new SentienceWatcher();
    }
    return SentienceWatcher.instance;
  }

  public watchTransaction(target: WatcherTarget) {
    this.pendingTargets.set(target.txid, target);
    console.log(`👀 [WATCHER] Monitorando TXID: ${target.txid}`);
  }

  public async processVigilanceCycle() {
    if (this.pendingTargets.size === 0) return;

    for (const [txid, target] of this.pendingTargets.entries()) {
      try {
        const status = await electrumBridge.verifyTxidStatus(txid);

        if (status.confirmed) {
          await this.finalizeSentience(target, status.block_height || 0, status.confirmations);
          this.pendingTargets.delete(txid);
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
}

export const sentienceWatcher = SentienceWatcher.getInstance();
