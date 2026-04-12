'use server';
/**
 * @fileOverview Sistema de Homeostase Generativa: Regula o equilíbrio do ecossistema.
 * Monitora energia, capital e população para garantir crescimento sustentável.
 * Implementa o Fluxo Crítico de monitoramento do Saldo Binance (13m3xop...).
 * UPGRADED: Utiliza Binance Custody API real para validação de liquidez.
 */

import { getAllAgents } from './agents-registry';
import { getShadowBalance, fixCustodyLiquidity } from './nexus-treasury';
import { MASTER_VAULT_ID, PRIMARY_CUSTODY_NODE } from './treasury-constants';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getBtcBalanceReal } from './binance-service';

export interface HomeostasisState {
  isStable: boolean;
  pressureIndex: number; // 0-100
  canSupportBirth: boolean;
  recommendation: string;
  custodyAlert: boolean;
  custodyBalance: number;
  isDistributionBlocked: boolean;
}

const IDEAL_POPULATION = 50;
const CRITICAL_ENERGY_AVG = 30;
const MIN_CUSTODY_VOLUME = 10.0;

export async function calculateHomeostasis(): Promise<HomeostasisState> {
  const agents = await getAllAgents();
  const activeAgents = agents.filter(a => a.status === 'active');
  const masterBalance = await getShadowBalance(MASTER_VAULT_ID);
  
  // Tenta obter saldo real da Binance, se falhar usa o shadow balance
  const realBtc = await getBtcBalanceReal();
  const custodyBalance = realBtc.total > 0 ? realBtc.total : await getShadowBalance(PRIMARY_CUSTODY_NODE);

  // 1. Calcular Vitalidade Mativa
  const avgEnergy = activeAgents.reduce((sum, a) => sum + a.energy, 0) / (activeAgents.length || 1);
  
  // 2. Calcular Pressão de Recursos
  const populationPressure = (activeAgents.length / IDEAL_POPULATION) * 50;
  const energyPressure = (100 - avgEnergy) * 0.5;
  const pressureIndex = Math.min(100, populationPressure + energyPressure);

  // 3. Monitor de Saldo Binance -> ALERTA CRÍTICO SE < 10 BTC
  const custodyAlert = custodyBalance < MIN_CUSTODY_VOLUME;
  const isDistributionBlocked = custodyAlert; // BLOQUEAR DISTRIBUIÇÃO 80/10/10

  const isStable = pressureIndex < 80 && avgEnergy > CRITICAL_ENERGY_AVG && !custodyAlert;
  const canSupportBirth = isStable && masterBalance > 100;

  let recommendation = "Sistema Nominal. Operação Normal 80/10/10 mantida.";
  if (custodyAlert) {
    recommendation = `ALERTA CRÍTICO: Saldo Binance (${custodyBalance.toFixed(4)} BTC) < 10 BTC. Distribuição Bloqueada.`;
  } else if (pressureIndex > 70) {
    recommendation = "Pressão alta de recursos. Conservar energia.";
  } else if (!isStable) {
    recommendation = "Instabilidade detectada. Acionando protocolos de recuperação.";
  }

  return {
    isStable,
    pressureIndex,
    canSupportBirth,
    recommendation,
    custodyAlert,
    custodyBalance,
    isDistributionBlocked
  };
}

export async function triggerHomeostasisCorrection() {
  const state = await calculateHomeostasis();
  
  if (state.custodyAlert) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'HOMEOSTASIS-ORACLE',
      message: `🚨 [ALERTA REAL] Liquidez Binance violada (${state.custodyBalance.toFixed(4)} BTC). Distribuição SUSPENSA.`,
      type: 'CRITICAL'
    });
    
    // Executa fluxo: Ativar Reserva -> Gerar Top-up -> Assinar Vault -> Transmitir Mesh
    await fixCustodyLiquidity();
  } else if (!state.isStable) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'HOMEOSTASIS-ORACLE',
      message: `⚖️ [HOMEOSTASE] Desequilíbrio detectado (Pressão: ${state.pressureIndex.toFixed(1)}). ${state.recommendation}`,
      type: 'SYSTEM'
    });
  }

  return state;
}
