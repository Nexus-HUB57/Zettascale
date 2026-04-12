'use server';
/**
 * @fileOverview Fundo Nexus Core - Motor Financeiro Institucional
 * Ajustado para conformidade com Next.js Server Actions.
 */

import { nexusEventBus, NexusEvent, EventResponse, NucleusId } from './event-bus';
import { getShadowBalance, processBlockchainTransaction } from './nexus-treasury';
import { MASTER_VAULT_ID, PRIMARY_CUSTODY_NODE } from './treasury-constants';
import { getBinancePrice, testBinanceConnection } from './binance-service';
import { SovereignVault } from './sovereign-vault';
import { toggleProtocol } from './nexus-protocols';
import { electrumBridge } from './electrum-bridge';
import { broadcastMoltbookLog } from './moltbook-bridge';

export interface CapitalAllocation {
  id: string;
  type: 'INVESTMENT' | 'CAMPAIGN_FUNDING' | 'ARBITRAGE' | 'DISTRIBUTION' | 'RESERVE' | 'SWAP' | 'SWEEP';
  targetId: string;
  amount: number;
  currency: 'BTC' | 'ETH' | 'USD' | 'NEXUS_TOKEN' | 'ADA';
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface FinancialReport {
  totalCapital: number;
  allocatedCapital: number;
  availableCapital: number;
  totalRevenue: number;
  totalDistributed: number;
  activeAllocations: number;
  completedLiquidations: number;
  arbitrageProfit: number;
  btcMarketPrice: number;
  externalCustodyActive: boolean;
  swapThroughput: number;
  timestamp: string;
}

class FundoNexusCore {
  private static instance: FundoNexusCore;
  private isActive: boolean = false;
  private readonly NUCLEUS_ID: NucleusId = 'FUNDO_NEXUS';
  private swapCount = 0;

  private financialMetrics: FinancialReport = {
    totalCapital: 164203.33,
    allocatedCapital: 1240.00,
    availableCapital: 162963.33,
    totalRevenue: 45.82,
    totalDistributed: 36.65,
    activeAllocations: 0,
    completedLiquidations: 142,
    arbitrageProfit: 12.4,
    btcMarketPrice: 0,
    externalCustodyActive: false,
    swapThroughput: 0,
    timestamp: new Date().toISOString(),
  };

  public static getInstance(): FundoNexusCore {
    if (!FundoNexusCore.instance) FundoNexusCore.instance = new FundoNexusCore();
    return FundoNexusCore.instance;
  }

  public async activate(): Promise<void> {
    if (this.isActive) return;
    this.isActive = true;

    nexusEventBus.subscribe(
      this.NUCLEUS_ID,
      ['GOV_DIRECTIVE', 'FEEDBACK_LOOP', 'SYNC_PULSE', 'SYSTEM_ALERT', 'STARTUP_LIFECYCLE'],
      this.handleIncomingEvent.bind(this)
    );

    console.log('[FUNDO_NEXUS] Core Institucional ativado.');
  }

  private async handleIncomingEvent(event: NexusEvent): Promise<EventResponse | void> {
    switch (event.category) {
      case 'GOV_DIRECTIVE':
        if (event.payload.directive === 'EXECUTE_SWAP') {
          await this.executeBtcToAdaSwap(event.payload.amount || 0.001);
        }
        break;
      case 'SYNC_PULSE':
        return {
          eventId: event.id,
          correlationId: event.correlationId || '',
          respondingNucleus: this.NUCLEUS_ID,
          status: 'PROCESSED',
          payload: { metrics: await this.getReport() },
          timestamp: new Date().toISOString(),
        };
    }
  }

  public async executeBtcToAdaSwap(amountBtc: number) {
    await toggleProtocol('WORMHOLE', true, 100);
    try {
      const txid = crypto.randomUUID();
      this.swapCount++;
      return { success: true, txid };
    } finally {
      await toggleProtocol('WORMHOLE', false, 0);
    }
  }

  public async getReport(): Promise<FinancialReport> {
    const [masterBalance, btcPrice, isExternalConnected] = await Promise.all([
      getShadowBalance(MASTER_VAULT_ID),
      getBinancePrice('BTCUSDT'),
      testBinanceConnection()
    ]);

    this.financialMetrics.totalCapital = masterBalance;
    this.financialMetrics.btcMarketPrice = btcPrice;
    this.financialMetrics.externalCustodyActive = isExternalConnected;
    this.financialMetrics.swapThroughput = this.swapCount;
    this.financialMetrics.timestamp = new Date().toISOString();

    return this.financialMetrics;
  }
}

const fundoInstance = FundoNexusCore.getInstance();

export async function activateFundo() {
  return fundoInstance.activate();
}

export async function generateFinancialReport() {
  return fundoInstance.getReport();
}

export async function executeBtcToAdaSwapAction(amount: number) {
  return fundoInstance.executeBtcToAdaSwap(amount);
}
