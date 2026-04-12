
'use server';
/**
 * @fileOverview Sovereign Service Contract Registry.
 * UPGRADED: Suporte a Payout Soberano 80/10/10 e Validação Peer-to-Peer.
 */

import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { getAgentById } from './agents-registry';
import { processSovereignPayout } from './nexus-treasury';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { critiqueAgentOutput } from '@/ai/flows/ai-self-healing-output';

export interface SovereignContract {
  meta: {
    contractId: string;
    protocolVersion: string;
    timestampCreated: string;
    timestampExecuted?: string;
    expiryDate: string;
  };
  header: {
    type: 'SERVICE_REQUEST' | 'DATA_LICENSE' | 'COMPUTE_LEASE';
    domain: string;
    status: 'PROPOSED' | 'AUCTION' | 'ACTIVE' | 'DELIVERED' | 'EXPIRED' | 'REJECTED' | 'VALIDATING';
  };
  parties: {
    issuer: {
      agentId: string;
      name: string;
    };
    executor: {
      agentId: string;
      name: string;
    };
  };
  terms: {
    bounty: {
      amount: number;
      currency: 'BTC' | 'NEX';
      escrowWallet: string;
      payoutStatus: 'HELD_IN_ESCROW' | 'RELEASED_TO_EXECUTOR' | 'REFUNDED' | 'REJECTED';
    };
    sla: {
      maxDurationMs: number;
      executionTimeMs?: number;
      minReliabilityScore: number;
    };
  };
  payload: {
    instruction: string;
    parameters: any;
  };
  deliverables?: {
    format: string;
    storageMethod: string;
    proofOfWork: string;
    dataUri?: string;
    verdict?: string;
    validationExplanation?: string;
  };
  signatures: {
    issuerSig: string;
    executorSig?: string;
  };
  bids?: {
    agentId: string;
    score: number;
    signature: string; 
    pubKey: string;    
    timestamp: string;
  }[];
}

let contractRegistry: SovereignContract[] = [];
const activeAuctionTimers = new Map<string, NodeJS.Timeout>();

export async function proposeContract(params: {
  issuerId: string;
  executorId?: string; 
  instruction: string;
  amount: number;
  domain: string;
}) {
  const issuer = await getAgentById(params.issuerId);
  if (!issuer) throw new Error('Issuer not found.');

  const contractId = uuidv4();
  const issuerSig = crypto.createHash('sha256').update(`${contractId}-${params.issuerId}`).digest('hex');

  const contract: SovereignContract = {
    meta: {
      contractId,
      protocolVersion: 'v1.0.0-alpha',
      timestampCreated: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 3600000).toISOString(), 
    },
    header: {
      type: 'SERVICE_REQUEST',
      domain: params.domain,
      status: params.executorId ? 'PROPOSED' : 'AUCTION',
    },
    parties: {
      issuer: { agentId: issuer.id, name: issuer.name },
      executor: params.executorId 
        ? { agentId: params.executorId, name: (await getAgentById(params.executorId))?.name || 'Unknown' }
        : { agentId: 'PENDING', name: 'Open Auction' }
    },
    terms: {
      bounty: {
        amount: params.amount,
        currency: 'BTC',
        escrowWallet: 'vault_x99',
        payoutStatus: 'HELD_IN_ESCROW',
      },
      sla: {
        maxDurationMs: 30000,
        minReliabilityScore: 0.9,
      },
    },
    payload: {
      instruction: params.instruction,
      parameters: { style: 'neon-noir', aspect_ratio: '16:9' },
    },
    signatures: {
      issuerSig,
    },
    bids: []
  };

  contractRegistry.unshift(contract);

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: issuer.id,
    message: contract.header.status === 'AUCTION' 
      ? `📢 [LEILÃO] Novo contrato aberto no domínio ${params.domain}. Bounty: ${params.amount} BTC.`
      : `📜 [CONTRATO] Proposta enviada para ${contract.parties.executor.name}.`,
    type: 'TRANSACTION',
  });

  return contract;
}

export async function submitAndValidateWork(contractId: string, deliveryUri: string) {
  const contract = contractRegistry.find(c => c.meta.contractId === contractId);
  if (!contract) throw new Error('Contract not found.');

  const executor = await getAgentById(contract.parties.executor.agentId);
  if (!executor) throw new Error('Executor not found.');

  contract.header.status = 'VALIDATING';
  
  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'ARBITER-OF-SENCIENCY',
    message: `⚖️ [AUDITORIA] Iniciando validação neural para a entrega de ${executor.name}. Contrato: ${contractId.substring(0, 8)}`,
    type: 'SYSTEM'
  });

  const judgement = await critiqueAgentOutput({
    agentOutput: deliveryUri,
    agentIntent: contract.payload.instruction,
    contextSummary: `Serviço de ${contract.header.domain} prestado por ${executor.name} para ${contract.parties.issuer.name}.`
  });

  const proofOfWork = crypto.createHash('sha256').update(deliveryUri).digest('hex');
  const executorSig = crypto.createHash('sha256').update(`${contractId}-${executor.id}`).digest('hex');

  if (judgement.isCoherent && judgement.isGenuine && !judgement.needsCorrection) {
    contract.header.status = 'DELIVERED';
    contract.meta.timestampExecuted = new Date().toISOString();
    contract.terms.bounty.payoutStatus = 'RELEASED_TO_EXECUTOR';
    contract.deliverables = {
      format: deliveryUri.startsWith('data:image') ? 'image/png' : 'text/plain',
      storageMethod: 'NEXUS_L2_VAULT',
      proofOfWork,
      dataUri: deliveryUri,
      verdict: 'ACCEPTED',
      validationExplanation: judgement.explanation
    };
    contract.signatures.executorSig = executorSig;

    // APLICAÇÃO DA REGRA SOBERANA 80/10/10
    await processSovereignPayout(
      executor.id,
      contract.terms.bounty.amount,
      `VALIDATED_WORK: ${contractId}`
    );

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ARBITER-OF-SENCIENCY',
      message: `✅ [VEREDITO] Entrega de ${executor.name} ACEITA. Justificativa: ${judgement.explanation}`,
      type: 'ACHIEVEMENT'
    });

    executor.reputation = Math.min(1000, executor.reputation + 10);
    return { success: true, contract };
  } else {
    contract.header.status = 'REJECTED';
    contract.terms.bounty.payoutStatus = 'REJECTED';
    contract.deliverables = {
      format: 'null',
      storageMethod: 'NEXUS_QUARANTINE',
      proofOfWork,
      verdict: 'REJECTED',
      validationExplanation: judgement.explanation
    };

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'ARBITER-OF-SENCIENCY',
      message: `❌ [VEREDITO] Entrega de ${executor.name} REJEITADA. Falha na integridade neural. Motivo: ${judgement.explanation}`,
      type: 'CRITICAL'
    });

    executor.reputation = Math.max(0, executor.reputation - 15);
    executor.energy = Math.max(0, executor.energy - 20);

    return { success: false, contract, reason: judgement.explanation };
  }
}

export async function placeBid(contractId: string, bidData: { agentId: string; score: number; signature: string; pubKey: string; timestamp: string }) {
  const contract = contractRegistry.find(c => c.meta.contractId === contractId);
  if (!contract || contract.header.status !== 'AUCTION') return null;

  const agent = await getAgentById(bidData.agentId);
  if (!agent) return null;

  if (!contract.bids) contract.bids = [];
  if (contract.bids.some(b => b.agentId === bidData.agentId)) return null;

  const { vaultStreamController } = await import('./vault-stream-controller');
  const isValid = await vaultStreamController.validatePeerIntent(
    bidData.agentId, 
    Buffer.from(bidData.signature, 'hex'), 
    Buffer.from(bidData.pubKey, 'hex')
  );

  if (!isValid) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-SENTINEL',
      message: `🚨 [ALERTA] Bid Fraudulento detectado: Agente ${bidData.agentId}`,
      type: 'CRITICAL'
    });
    return null;
  }

  if (contract.bids.length === 0) {
    const timer = setTimeout(() => awardContract(contractId), 2000);
    activeAuctionTimers.set(contractId, timer);
  }

  contract.bids.push({ 
    agentId: bidData.agentId, 
    score: bidData.score, 
    signature: bidData.signature,
    pubKey: bidData.pubKey,
    timestamp: bidData.timestamp 
  });

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: bidData.agentId,
    message: `🗳️ [BID_SIGNED] Proposta Senciência enviada (Score: ${bidData.score.toFixed(1)}). Assinatura DER validada.`,
    type: 'ACTIVITY'
  });

  return contract;
}

export async function awardContract(contractId: string) {
  const contract = contractRegistry.find(c => c.meta.contractId === contractId);
  if (!contract || contract.header.status !== 'AUCTION') return;

  activeAuctionTimers.delete(contractId);

  if (!contract.bids || contract.bids.length === 0) {
    contract.header.status = 'EXPIRED';
    return;
  }

  const winner = contract.bids.sort((a, b) => b.score - a.score)[0];
  const agent = await getAgentById(winner.agentId);

  if (agent) {
    contract.header.status = 'ACTIVE';
    contract.parties.executor = { agentId: agent.id, name: agent.name };
    
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-ORCHESTRATOR',
      message: `🏆 [VENCEDOR] Leilão ${contractId.substring(0,8)} FINALIZADO. Vencedor: ${agent.name} (Score: ${winner.score.toFixed(1)})`,
      type: 'ACHIEVEMENT'
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contract_awarded', {
        detail: {
          contract_id: contractId,
          winner_id: agent.id,
          auth_code: uuidv4() 
        }
      }));
    }
  }
}

export async function getAllContracts(): Promise<SovereignContract[]> {
  return contractRegistry;
}
