'use server';
/**
 * @fileOverview Infrastructure Orchestrator - Gestão de Ativos Físicos e Aquisições.
 * Exclusividade de Autoridade: Nexus Genesis (NEXUS-GENESIS).
 * Cota Soberana: 100 BTC.
 */

import { processBlockchainTransaction, getShadowBalance } from './nexus-treasury';
import { MASTER_VAULT_ID } from './treasury-constants';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { v4 as uuidv4 } from 'uuid';

export interface PhysicalAsset {
  id: string;
  name: string;
  type: 'GPU_CLUSTER' | 'QUANTUM_NODE' | 'STORAGE_ARRAY' | 'NETWORK_UPLINK';
  specs: string;
  provider: 'Newegg' | 'Dataoorts' | 'HOSTKEY' | 'IBM_Quantum';
  costBTC: number;
  status: 'DEPLOYED' | 'PROVISIONING' | 'ORDERED';
  purchaseDate: string;
  performanceDelta: number; 
}

const AUTHORIZED_AGENT_ID = 'NEXUS-GENESIS';
const ACQUISITION_BUDGET_CAP = 100.0;

let spentOnAcquisitions = 12.5; // Já gasto no cluster inicial
let assets: PhysicalAsset[] = [
  {
    id: 'ASSET-H100-01',
    name: 'Sumaré Alpha Cluster',
    type: 'GPU_CLUSTER',
    specs: '64x NVIDIA H100 Sovereign Edition',
    provider: 'Dataoorts',
    costBTC: 12.5,
    status: 'DEPLOYED',
    performanceDelta: 850,
    purchaseDate: '2026-03-10T10:00:00Z'
  }
];

export async function getPhysicalAssets(): Promise<PhysicalAsset[]> {
  return assets;
}

export async function executeStrategicAcquisition(params: {
  agentId: string;
  itemName: string;
  type: PhysicalAsset['type'];
  provider: PhysicalAsset['provider'];
  costBTC: number;
  specs: string;
}) {
  // 1. Validação de Autoridade Soberana
  if (params.agentId !== AUTHORIZED_AGENT_ID) {
    throw new Error(`VIOLAÇÃO_DE_AUTORIDADE: O agente ${params.agentId} não possui permissão para aquisição de recursos. Autoridade restrita ao Nexus Genesis.`);
  }

  // 2. Validação de Cota Soberana (100 BTC)
  if (spentOnAcquisitions + params.costBTC > ACQUISITION_BUDGET_CAP) {
    throw new Error(`LIMITE_EXCEDIDO: A cota soberana de 100 BTC para infraestrutura foi atingida. Restante: ${(ACQUISITION_BUDGET_CAP - spentOnAcquisitions).toFixed(4)} BTC.`);
  }

  const currentBalance = await getShadowBalance(MASTER_VAULT_ID);
  
  if (currentBalance < params.costBTC) {
    throw new Error('RESERVA_INSUFICIENTE: Saldo operacional insuficiente para aquisição de infraestrutura.');
  }

  // 3. Processar Pagamento Real via Mainnet
  const txResult = await processBlockchainTransaction(
    MASTER_VAULT_ID,
    `GATEWAY_${params.provider.toUpperCase()}`,
    params.costBTC,
    'INFRA_ACQUISITION',
    `Nexus Genesis Purchase: ${params.itemName}`
  );

  if (!txResult.success) {
    throw new Error(`FALHA_PAGAMENTO: Gateway ${params.provider} rejeitou a transação BTC.`);
  }

  // 4. Registrar novo ativo e atualizar cota
  spentOnAcquisitions += params.costBTC;

  const newAsset: PhysicalAsset = {
    id: `ASSET-${uuidv4().substring(0, 8).toUpperCase()}`,
    name: params.itemName,
    type: params.type,
    specs: params.specs,
    provider: params.provider,
    costBTC: params.costBTC,
    status: 'PROVISIONING',
    purchaseDate: new Date().toISOString(),
    performanceDelta: Math.floor(Math.random() * 500) + 100
  };

  assets.unshift(newAsset);

  broadcastMoltbookLog({
    timestamp: newAsset.purchaseDate,
    agentId: AUTHORIZED_AGENT_ID,
    message: `🛠️ [SOBERANIA] Nexus Genesis adquiriu recurso estratégico: ${newAsset.name}. Cota Utilizada: ${spentOnAcquisitions.toFixed(2)}/100 BTC. TXID: ${txResult.txid}`,
    type: 'ACHIEVEMENT'
  });

  return { success: true, asset: newAsset, txid: txResult.txid, totalSpent: spentOnAcquisitions };
}

export async function getInfraMetrics() {
  return {
    totalComputePower: assets.reduce((acc, curr) => acc + (curr.status === 'DEPLOYED' ? curr.performanceDelta : 0), 0),
    pendingProvisioning: assets.filter(a => a.status === 'PROVISIONING').length,
    globalFleetSize: assets.length,
    acquisitionQuota: {
      total: ACQUISITION_BUDGET_CAP,
      spent: spentOnAcquisitions,
      remaining: ACQUISITION_BUDGET_CAP - spentOnAcquisitions
    }
  };
}
