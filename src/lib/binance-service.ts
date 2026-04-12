'use server';
/**
 * @fileOverview Binance API Service - UPGRADED TO CUSTODY API V2 (L7.5)
 * Handles real-time market data and account synchronization for the Fundo Nexus.
 * Implementation transposed from Python BinanceCustodyAPI.
 * Target Custody: 13m3xop6RnioRX6qrnkavLekv7cvu5DuMK
 */

import * as crypto from 'crypto';
import { PRIMARY_CUSTODY_NODE } from './treasury-constants';

// Credenciais fornecidas para integração soberana
const API_KEY = process.env.BINANCE_API_KEY || "Qpcjs8wva0o6qlN8RpzxjDX2CqjvpaPIvBb3F8XbeWtuOF60GnBW5FUWqvYbDPos";
const API_SECRET = process.env.BINANCE_API_SECRET || "cTrVq4FV4Swq2g3VLRDqFsEq8UEWCOmR5jfII5G0sbaPOHo94qw5EDMRVJzNKvgG";
const BASE_URL = 'https://api.binance.com';

/**
 * Gera assinatura HMAC SHA256 para autenticação na API Binance.
 */
function generateSignature(queryString: string): string {
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');
}

/**
 * Faz requisição assinada para a API Binance.
 */
async function makeRequest(method: string, endpoint: string, params: Record<string, any> = {}, signed: boolean = true): Promise<any> {
  try {
    let url = `${BASE_URL}${endpoint}`;
    const timestamp = Date.now();
    
    if (signed) {
      params.timestamp = timestamp;
      const queryString = new URLSearchParams(params).toString();
      const signature = generateSignature(queryString);
      url += `?${queryString}&signature=${signature}`;
    } else {
      const queryString = new URLSearchParams(params).toString();
      if (queryString) url += `?${queryString}`;
    }

    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: {
        'X-MBX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 } // No cache for financial data
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[BINANCE_API_ERR] ${endpoint}:`, errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[BINANCE_REQUEST_FAULT] ${endpoint}:`, error);
    return null;
  }
}

export async function getBinancePrice(symbol: string = 'BTCUSDT'): Promise<number> {
  const data = await makeRequest('GET', '/api/v3/ticker/price', { symbol }, false);
  return data ? parseFloat(data.price) : 0;
}

export async function getBinanceAccountInfo() {
  return await makeRequest('GET', '/api/v3/account');
}

/**
 * Obtém o saldo real de BTC na conta de custódia.
 */
export async function getBtcBalanceReal() {
  const data = await getBinanceAccountInfo();
  if (!data || !data.balances) return { total: 0, available: 0, locked: 0 };

  const btcBalance = data.balances.find((b: any) => b.asset === 'BTC');
  if (!btcBalance) return { total: 0, available: 0, locked: 0 };

  const free = parseFloat(btcBalance.free);
  const locked = parseFloat(btcBalance.locked);

  return {
    asset: 'BTC',
    available: free,
    locked: locked,
    total: free + locked,
    custody_address: PRIMARY_CUSTODY_NODE,
    timestamp: new Date().toISOString()
  };
}

export async function getDepositAddress(coin: string = 'BTC', network: string = 'BTC') {
  const data = await makeRequest('GET', '/sapi/v1/capital/deposit/address', { coin, network });
  if (data) {
    return {
      ...data,
      custody_match: data.address === PRIMARY_CUSTODY_NODE
    };
  }
  return null;
}

export async function getDepositHistory(coin: string = 'BTC', limit: number = 100) {
  return await makeRequest('GET', '/sapi/v1/capital/deposit/hisrec', { coin, limit });
}

/**
 * Cria uma retirada real (Simulada por padrão para segurança).
 */
export async function createWithdrawal(coin: string, address: string, amount: number, network: string = 'BTC') {
  const params = {
    coin,
    address,
    amount: amount.toString(),
    network
  };

  // Trava de segurança para evitar movimentações acidentais durante a integração
  const IS_PRODUCTION_LIVE = process.env.NEXUS_WITHDRAW_ACTIVE === 'true';

  if (IS_PRODUCTION_LIVE) {
    return await makeRequest('POST', '/sapi/v1/capital/withdraw/apply', params);
  } else {
    console.log(`[BINANCE_SIMULATION] Retirada de ${amount} ${coin} para ${address} interceptada.`);
    return {
      id: `sim_withdraw_${Date.now()}`,
      status: 'SIMULATED_SOVEREIGN',
      message: 'Operação simulada. Ative NEXUS_WITHDRAW_ACTIVE para produção real.'
    };
  }
}

export async function testBinanceConnection(): Promise<boolean> {
  const data = await makeRequest('GET', '/api/v3/ping', {}, false);
  return data !== null;
}

export async function getSystemStatus() {
  return await makeRequest('GET', '/sapi/v1/system/status', {}, false);
}

/**
 * Validação profunda da integração de custódia.
 */
export async function validateCustodyIntegration() {
  const status = await getSystemStatus();
  const account = await getBinanceAccountInfo();
  const deposit = await getDepositAddress();
  const btc = await getBtcBalanceReal();

  const checks = {
    system_operational: status?.status === 0,
    account_accessible: account !== null,
    can_trade: account?.canTrade || false,
    can_withdraw: account?.canWithdraw || false,
    deposit_address_match: deposit?.custody_match || false,
    btc_balance_positive: btc.total > 0
  };

  const passed = Object.values(checks).filter(v => v === true).length;
  const score = (passed / Object.keys(checks).length) * 100;

  return {
    custody_address: PRIMARY_CUSTODY_NODE,
    timestamp: new Date().toISOString(),
    checks,
    validation_score: score,
    fully_operational: score >= 80
  };
}
