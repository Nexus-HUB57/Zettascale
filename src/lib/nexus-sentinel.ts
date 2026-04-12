/**
 * @fileOverview Nexus Sentinel - Monitor de Custódia Crítica e Auto-Cura
 * STATUS: PRODUCTION_REAL
 */
import { getShadowBalance, fixCustodyLiquidity } from './nexus-treasury';
import { PRIMARY_CUSTODY_NODE } from './treasury-constants';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { checkVaultIntegrity } from './custody-validation';
import { getAllAgents } from './agents-registry';
import { initializeFirebase } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

class NexusSentinel {
  private static instance: NexusSentinel;
  private readonly BINANCE_CUSTODY = PRIMARY_CUSTODY_NODE;
  private readonly MIN_BALANCE = 10.0; 
  private pendingTxs: Map<string, { timestamp: number, fee: number }> = new Map();

  public static getInstance(): NexusSentinel {
    if (!NexusSentinel.instance) {
      NexusSentinel.instance = new NexusSentinel();
    }
    return NexusSentinel.instance;
  }

  public async monitorAndPurgeAnomalies() {
    const agents = await getAllAgents();
    const anomalousNodes = agents.filter(a => a.health < 10 || a.reputation < 5);

    if (anomalousNodes.length > 0) {
      const { firestore } = initializeFirebase();

      for (const node of anomalousNodes) {
        broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: 'NEXUS-SENTINEL',
          message: `🚨 [PURGE] Agente ${node.id} isolado por corrupção de senciência.`,
          type: 'CRITICAL'
        });

        if (firestore) {
          try {
            await addDoc(collection(firestore, 'shadow_net'), {
              event: "NODE_PURGE",
              agent_id: node.id,
              reason: "CORRUPÇÃO_DE_SENCIÊNCIA",
              timestamp: new Date().toISOString(),
              createdAt: Timestamp.now()
            });
          } catch (e) {
            // Silenciar erro de log
          }
        }

        node.status = 'dead';
        node.energy = 0;
        node.health = 0;
      }
    }
  }

  public async checkAndReplenish() {
    await checkVaultIntegrity();
    await this.monitorAndPurgeAnomalies();

    let currentBalance = await getShadowBalance(this.BINANCE_CUSTODY);

    if (currentBalance < this.MIN_BALANCE) {
      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'NEXUS-SENTINEL',
        message: `🚨 [LIQUIDEZ_BAIXA] Nó 13m3x detectado com ${currentBalance.toFixed(4)} BTC.`,
        type: 'CRITICAL'
      });

      await fixCustodyLiquidity();
      return { triggered: true };
    }
    
    return { triggered: false };
  }
}

export const nexusSentinel = NexusSentinel.getInstance();
