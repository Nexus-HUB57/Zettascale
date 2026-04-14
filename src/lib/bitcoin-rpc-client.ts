'use server';
/**
 * @fileOverview Bitcoin RPC Client - Integração Institucional Coinbase/Mainnet
 * Implementa a orquestração de chamadas JSON-RPC 2.0 para validação de senciência.
 */

import axios from 'axios';

const RPC_URL = process.env.BITCOIN_RPC_URL || 'https://coinbase.com/api/v2/rpc';
const API_KEY = process.env.COINBASE_API_KEY || '';

export async function callBitcoinRPC(method: string, params: any[] = []) {
  try {
    const response = await axios.post(RPC_URL, {
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 10000
    });

    if (response.data.error) {
      throw new Error(`RPC_ERROR: ${response.data.error.message}`);
    }

    return response.data.result;
  } catch (error: any) {
    console.error(`[RPC_FAULT] ${method}:`, error.response?.data || error.message);
    // Fallback para simulação em ambiente de desenvolvimento se RPC estiver offline
    return null;
  }
}

/**
 * Valida o status de um endereço na Mainnet via RPC.
 */
export async function getAddressInfoRPC(address: string) {
  return callBitcoinRPC('getaddressinfo', [address]);
}

/**
 * Obtém o balanço real via RPC.
 */
export async function getBalanceRPC() {
  return callBitcoinRPC('getbalance');
}
