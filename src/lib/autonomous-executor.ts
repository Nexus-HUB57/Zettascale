'use server';
/**
 * @fileOverview Autonomous Executor Service - Execução Real Mainnet.
 * Transpõe a lógica Python para o ecossistema Nexus com segurança L7.
 */

import * as bitcoin from 'bitcoinjs-lib';
import { ensureEccInitialized } from './bitcoin-engine';
import { WALLET_10_ADDRESS, UNIFIED_SOVEREIGN_TARGET } from './treasury-constants';
import { getMasterKeyStatus, getDerivedKeyForPath } from './master-key-service';
import { electrumBridge } from './electrum-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { runExecutionDecision } from '@/ai/flows/autonomous-execution-decision-flow';
import axios from 'axios';

const MAX_AUTONOMOUS_SPEND = 0.001; // BTC

export async function runAutonomousExecutionCycle() {
  ensureEccInitialized();
  const masterStatus = await getMasterKeyStatus();

  if (!masterStatus.isActive) {
    console.warn("[AUTONOMOUS_EXEC] Vault bloqueado. Abortando ciclo.");
    return { success: false, message: 'VAULT_LOCKED' };
  }

  try {
    // 1. Coleta de dados reais (Market Vitals)
    const priceRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const btcPrice = priceRes.data.bitcoin.usd;
    
    // Simulação de sentimento (Em produção real, isso viria de uma análise de rede social/notícias)
    const sentiment = btcPrice > 70000 ? "Ganância Elevada - Risco de Volatilidade" : "Estável - Consolidação de Preço";

    // 2. Consulta ao Oráculo de Decisão (LLM)
    const decisionResult = await runExecutionDecision({
      marketData: `BTC a $${btcPrice.toLocaleString()}`,
      sentimentAnalysis: sentiment,
      sourceAddress: WALLET_10_ADDRESS
    });

    if (decisionResult.decision === 'WAIT') {
      console.log(`[AUTONOMOUS_EXEC] Oráculo decidiu aguardar. Motivo: ${decisionResult.rationale}`);
      return { success: true, decision: 'WAIT' };
    }

    // 3. Validação de Segurança
    const amountBTC = decisionResult.amountBTC || 0.0001;
    const target = decisionResult.targetAddress || UNIFIED_SOVEREIGN_TARGET;

    if (amountBTC > MAX_AUTONOMOUS_SPEND) {
      throw new Error(`SECURITY_VIOLATION: Tentativa de gasto de ${amountBTC} excede o limite autônomo.`);
    }

    // 4. Execução de Transação Real
    console.log(`🚀 [AUTONOMOUS_EXEC] Iniciando movimentação de ${amountBTC} BTC para ${target}...`);
    
    // Aqui usamos o motor de liquidação existente que já lida com PSBT e Master Key
    const { executeMainnetLiquidation } = await import('./raw-tx-builder');
    const amountSats = Math.floor(amountBTC * 100000000);
    
    const txResult = await executeMainnetLiquidation(
      target,
      amountSats,
      "m/84'/0'/0'/0/0" // Caminho Master
    );

    // 5. Broadcast Real para a Mainnet
    const broadcast = await electrumBridge.broadcastHex(txResult.hex);

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AUTONOMOUS-EXECUTOR',
      message: `⚡ [AUTONOMOUS_ACTION] IA decidiu mover ${amountBTC} BTC. Motivo: ${decisionResult.rationale}. TXID: ${broadcast.txid}`,
      type: 'TRANSACTION'
    });

    return { 
      success: true, 
      txid: broadcast.txid, 
      decision: 'EXECUTE',
      rationale: decisionResult.rationale 
    };

  } catch (error: any) {
    console.error("[AUTONOMOUS_EXEC_FAULT]", error.message);
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AUTONOMOUS-EXECUTOR',
      message: `🚨 [FALHA_EXECUÇÃO] Erro ao processar decisão autônoma: ${error.message}`,
      type: 'CRITICAL'
    });
    return { success: false, error: error.message };
  }
}
