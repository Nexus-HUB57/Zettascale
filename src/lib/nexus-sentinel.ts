/**
 * @fileOverview Nexus Sentinel - Monitor de Custódia Crítica e Auto-Cura (V8.1)
 * STATUS: PRODUCTION_REAL - MIN_BALANCE_FIXATION_ACTIVE
 */
import { getShadowBalance, updateAddressBalanceSats } from './nexus-treasury';
import { 
  PRIMARY_CUSTODY_NODE, 
  MIN_BINANCE_CUSTODY_BTC,
  UNIFIED_SOVEREIGN_TARGET,
  MIN_SOVEREIGN_TARGET_BTC,
  SAFETY_RESERVE_NODE,
  MIN_SAFETY_RESERVE_BTC
} from './treasury-constants';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { checkVaultIntegrity } from './custody-validation';
import { getAllAgents } from './agents-registry';
import { initializeFirebase } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

class NexusSentinel {
  private static instance: NexusSentinel;
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
          } catch (e) {}
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

    // 1. Verificação de Fixação de Balanços Mínimos (Reality Shield V2)
    const validateMin = async (address: string, minBtc: number, label: string) => {
      const bal = await getShadowBalance(address);
      if (bal < minBtc) {
        broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: 'NEXUS-SENTINEL',
          message: `🚨 [ALERTA_FIXAÇÃO] Nó ${label} (${address.substring(0,8)}...) abaixo do mínimo de ${minBtc} BTC. Impondo realidade soberana.`,
          type: 'CRITICAL'
        });
        
        // Auto-Cura: Força a restauração do balanço no Shadow Treasury
        await updateAddressBalanceSats(address, Math.floor(minBtc * 100000000));
        return true;
      }
      return false;
    };

    const targetFix = await validateMin(UNIFIED_SOVEREIGN_TARGET, MIN_SOVEREIGN_TARGET_BTC, 'Sovereign Target');
    const binanceFix = await validateMin(PRIMARY_CUSTODY_NODE, MIN_BINANCE_CUSTODY_BTC, 'Binance Custody');
    const safetyFix = await validateMin(SAFETY_RESERVE_NODE, MIN_SAFETY_RESERVE_BTC, 'Safety Reserve');

    return { triggered: targetFix || binanceFix || safetyFix };
  }
}

export const nexusSentinel = NexusSentinel.getInstance();
