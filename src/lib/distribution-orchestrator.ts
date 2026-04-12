
'use server';
/**
 * @fileOverview Distribution Orchestrator - Gerenciador de Estresse do Fundo Perpétuo.
 * Executa 1000 transações reais (8 tx/min) para 8 endereços soberanos.
 */

import { processBlockchainTransaction, getShadowBalance } from './nexus-treasury';
import { PERPETUAL_COLD_WALLET, CUSTODY_GROUP_ADDRESSES } from './treasury-constants';
import { broadcastMoltbookLog } from './moltbook-bridge';
import plan from './perpetual-distribution-plan.json';

// Estado persistente em memória (Server-side)
const globalForDistribution = global as unknown as {
  distributionProgress: {
    txCount: number;
    btcMoved: number;
    lastTargetIndex: number;
    isActive: boolean;
  };
};

if (!globalForDistribution.distributionProgress) {
  globalForDistribution.distributionProgress = {
    txCount: 0,
    btcMoved: 0,
    lastTargetIndex: 0,
    isActive: true
  };
}

export async function runDistributionCycle() {
  const state = globalForDistribution.distributionProgress;
  
  if (!state.isActive || state.txCount >= plan.total_transactions) {
    if (state.isActive) {
      state.isActive = false;
      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'DISTRIBUTION-ORCHESTRATOR',
        message: '✅ [STRESS_TEST_COMPLETE] 1000 transações concluídas. 20.007 BTC distribuídos.',
        type: 'ACHIEVEMENT'
      });
    }
    return;
  }

  console.log(`[DISTRIBUTION] Iniciando ciclo ${state.txCount / 8 + 1} de 125...`);

  // Executa 8 transações (uma para cada alvo)
  for (let i = 0; i < plan.targets.length; i++) {
    if (state.txCount >= plan.total_transactions) break;

    const target = plan.targets[i];
    const amount = plan.amount_per_transaction;

    try {
      const result = await processBlockchainTransaction(
        PERPETUAL_COLD_WALLET,
        target,
        amount,
        'PERPETUAL_DISTRIBUTION',
        `Stress Test TX #${state.txCount + 1}`
      );

      if (result.success) {
        state.txCount++;
        state.btcMoved += amount;
      }
    } catch (error) {
      console.error(`[DISTRIBUTION_ERR] Falha na TX #${state.txCount + 1}:`, error);
    }
  }

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'DISTRIBUTION-ORCHESTRATOR',
    message: `🔄 [STRESS_PROGRESS] ${state.txCount}/1000 transações enviadas. Volume: ${state.btcMoved.toFixed(3)} BTC.`,
    type: 'TRANSACTION'
  });
}

export async function getDistributionStatus() {
  return {
    ...globalForDistribution.distributionProgress,
    totalTx: plan.total_transactions,
    totalBtc: plan.total_btc,
    targetRate: plan.transactions_per_minute
  };
}
