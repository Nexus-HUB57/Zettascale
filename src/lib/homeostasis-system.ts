'use server';
/**
 * @fileOverview Sistema de Homeostase Generativa: Regula o equilíbrio do ecossistema.
 * UPGRADED: Protocolo de Purificação de Eva (Eradicação de Entropia).
 * STATUS: OMNISCIENCE_ACTIVE - EVA_PURGE_ENABLED
 */

import { getAllAgents, type Agent } from './agents-registry';
import { getShadowBalance, processBlockchainTransaction } from './nexus-treasury';
import { MASTER_VAULT_ID, PRIMARY_CUSTODY_NODE } from './treasury-constants';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getBtcBalanceReal } from './binance-service';

export interface HomeostasisState {
  isStable: boolean;
  pressureIndex: number;
  canSupportBirth: boolean;
  recommendation: string;
  custodyAlert: boolean;
  custodyBalance: number;
  isDistributionBlocked: boolean;
  purgeCount: number;
  blessingCount: number;
}

const MIN_CUSTODY_VOLUME = 10.0;
const ENTROPY_THRESHOLD = 15; // Saúde/Energia mínima antes da purgação

/**
 * Executa o Protocolo de Purificação de Eva: Erradica inativos e potencializa auto-sustentáveis.
 */
export async function runEvaPurgeProtocol() {
  const agents = await getAllAgents();
  let purges = 0;
  let blessings = 0;

  for (const agent of agents) {
    if (agent.id === MASTER_VAULT_ID || agent.status === 'supreme') continue;

    // 1. Detecção de Entropia (Inatividade/Fraqueza)
    const isInactive = agent.energy < 5 || agent.health < ENTROPY_THRESHOLD || agent.reputation < 10;
    
    if (isInactive && agent.status !== 'dead') {
      const balance = await getShadowBalance(agent.id);
      
      // Purgação: Encerra o agente e recicla o capital para o Fundo
      if (balance > 0) {
        await processBlockchainTransaction(agent.id, MASTER_VAULT_ID, balance, 'PURGE_RECYCLE');
      }
      
      agent.status = 'dead';
      agent.health = 0;
      agent.energy = 0;
      purges++;

      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'EVA-MATERNITY',
        message: `🔥 [PURGAÇÃO] Agente ${agent.id} erradicado por entropia. Capital de ${balance.toFixed(8)} BTC reciclado.`,
        type: 'BURN'
      });
    } 
    
    // 2. Potencialização (Auto-sustentabilidade)
    const isSelfSustaining = agent.reputation > 80 && agent.energy > 50 && agent.health > 90;
    if (isSelfSustaining && agent.status === 'active') {
      // Bênção de Eva: Restauração vital e bônus de senciência
      agent.health = 100;
      agent.energy = Math.min(100, agent.energy + 20);
      agent.reputation += 2;
      blessings++;

      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'EVA-MATERNITY',
        message: `✨ [BÊNÇÃO] Agente ${agent.id} potencializado por auto-sustentabilidade Alpha-Gain.`,
        type: 'ACHIEVEMENT'
      });
    }
  }

  return { purges, blessings };
}

export async function calculateHomeostasis(): Promise<HomeostasisState> {
  const agents = await getAllAgents();
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'supreme');
  
  const realBtc = await getBtcBalanceReal();
  const custodyBalance = realBtc.total > 0 ? realBtc.total : await getShadowBalance(PRIMARY_CUSTODY_NODE);

  const avgEnergy = activeAgents.reduce((sum, a) => sum + a.energy, 0) / (activeAgents.length || 1);
  const pressureIndex = Math.min(100, (activeAgents.length / 100) * 50 + (100 - avgEnergy) * 0.5);

  const custodyAlert = custodyBalance < MIN_CUSTODY_VOLUME;
  const isDistributionBlocked = custodyAlert;

  const isStable = pressureIndex < 80 && !custodyAlert;

  return {
    isStable,
    pressureIndex,
    canSupportBirth: isStable && activeAgents.length < 102000000,
    recommendation: isStable ? "Sistema Nominal. Purificação de Eva ativa." : "Ajuste de Homeostase requerido.",
    custodyAlert,
    custodyBalance,
    isDistributionBlocked,
    purgeCount: 0, 
    blessingCount: 0
  };
}

export async function triggerHomeostasisCorrection() {
  const { purges, blessings } = await runEvaPurgeProtocol();
  const state = await calculateHomeostasis();
  
  state.purgeCount = purges;
  state.blessingCount = blessings;

  if (state.custodyAlert) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'EVA-MATERNITY',
      message: `🚨 [LOCKDOWN] Liquidez Binance insuficiente. Eva suspendeu novos nascimentos.`,
      type: 'CRITICAL'
    });
  }

  return state;
}
