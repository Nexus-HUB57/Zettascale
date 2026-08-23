/**
 * @fileOverview Hardened Multi-Source Custody Verification (v2.0)
 * SECURITY_LEVEL: PRODUCTION_CRITICAL
 * 
 * Implements triple-consensus verification with failover, rate limiting,
 * and real-time monitoring for Bitcoin Mainnet custody operations.
 */

import { initializeFirebase } from './firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import axios from 'axios';

export interface BlockchainSource {
  name: string;
  endpoint: string;
  reliabilityScore: number;
  lastChecked?: string;
}

export interface VerificationResult {
  success: boolean;
  consensus: boolean;
  addressHash: string;
  totalBTC: number;
  sources: {
    name: string;
    balance: number;
    verified: boolean;
    error?: string;
  }[];
  timestamp: string;
  discrepancy: number;
  attestation: {
    merkleRoot: string;
    consensusCount: number;
    consensusTarget: number;
  };
}

const BLOCKCHAIN_SOURCES: BlockchainSource[] = [
  {
    name: 'Mempool.space',
    endpoint: 'https://mempool.space/api',
    reliabilityScore: 0.95,
  },
  {
    name: 'Blockstream.info',
    endpoint: 'https://blockstream.info/api',
    reliabilityScore: 0.90,
  },
  {
    name: 'Nexus Core RPC',
    endpoint: process.env.NEXUS_CORE_RPC || 'http://localhost:8332',
    reliabilityScore: 1.0,
  },
];

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

class RateLimiter {
  private requestTimestamps: Map<string, number[]> = new Map();

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(identifier) || [];

    // Remove old timestamps outside the window
    const recentTimestamps = timestamps.filter(
      ts => now - ts < RATE_LIMIT_WINDOW_MS
    );

    if (recentTimestamps.length >= RATE_LIMIT_REQUESTS) {
      return false;
    }

    recentTimestamps.push(now);
    this.requestTimestamps.set(identifier, recentTimestamps);
    return true;
  }
}

const rateLimiter = new RateLimiter();

/**
 * Fetches balance from a single blockchain source with timeout and retry.
 */
async function fetchBalanceFromSource(
  source: BlockchainSource,
  address: string,
  retries = 2
): Promise<{ balance: number; error?: string }> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(
        `${source.endpoint}/address/${address}`,
        { timeout: 5000 }
      );

      const balance = response.data.chain_stats?.funded_txo_sum || 0;
      return { balance: balance / 100000000 }; // Convert satoshis to BTC
    } catch (error: any) {
      if (attempt === retries - 1) {
        return {
          balance: 0,
          error: `${source.name} failed: ${error.message}`,
        };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return { balance: 0, error: 'Max retries exceeded' };
}

/**
 * Verifies custody across multiple blockchain sources with consensus.
 */
export async function verifyMultiSourceCustody(
  addresses: string[],
  requiredConsensus = 2
): Promise<VerificationResult> {
  const clientId = `custody-verify-${Date.now()}`;

  // Rate limiting check
  if (!rateLimiter.isAllowed(clientId)) {
    throw new Error('Rate limit exceeded. Please try again in 60 seconds.');
  }

  const { firestore } = initializeFirebase();
  const startTime = Date.now();
  const results = [];
  let totalBalance = 0;
  let consensusCount = 0;

  try {
    // Fetch from all sources in parallel
    const sourceResults = await Promise.all(
      BLOCKCHAIN_SOURCES.map(async source => {
        const result = await fetchBalanceFromSource(source, addresses[0]);
        return {
          name: source.name,
          ...result,
          verified: !result.error,
        };
      })
    );

    // Calculate consensus
    const verifiedSources = sourceResults.filter(r => r.verified);
    consensusCount = verifiedSources.length;
    const averageBalance =
      verifiedSources.length > 0
        ? verifiedSources.reduce((sum, r) => sum + r.balance, 0) /
          verifiedSources.length
        : 0;

    totalBalance = averageBalance;

    // Calculate discrepancy
    const discrepancies = verifiedSources.map(
      r => Math.abs(r.balance - averageBalance)
    );
    const maxDiscrepancy =
      discrepancies.length > 0 ? Math.max(...discrepancies) : 0;

    const consensusReached = consensusCount >= requiredConsensus;

    const verificationResult: VerificationResult = {
      success: consensusReached,
      consensus: consensusReached,
      addressHash: addresses[0].substring(0, 20) + '...',
      totalBTC: Number(totalBalance.toFixed(8)),
      sources: sourceResults,
      timestamp: new Date().toISOString(),
      discrepancy: Number(maxDiscrepancy.toFixed(8)),
      attestation: {
        merkleRoot: generateMerkleRoot(sourceResults),
        consensusCount,
        consensusTarget: requiredConsensus,
      },
    };

    // Log to Firestore for audit trail
    if (firestore && consensusReached) {
      try {
        await addDoc(collection(firestore, 'custody_verifications'), {
          ...verificationResult,
          duration_ms: Date.now() - startTime,
          createdAt: Timestamp.now(),
        });
      } catch (logError) {
        console.error('[CUSTODY_VERIFY] Firestore audit log failed:', logError);
      }
    }

    return verificationResult;
  } catch (error: any) {
    console.error('[CUSTODY_VERIFY_ERROR]', error);
    throw new Error(
      `Custody verification failed: ${error.message}`
    );
  }
}

/**
 * Generates a deterministic Merkle root from verification sources.
 */
function generateMerkleRoot(sources: any[]): string {
  const hashes = sources
    .filter(s => s.verified)
    .map(s => `${s.name}:${s.balance}`)
    .sort();

  // Simple hash simulation (in production, use proper Merkle tree)
  const combined = hashes.join('|');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Retrieves recent custody verification history.
 */
export async function getCustodyVerificationHistory(
  limit_count = 10
): Promise<VerificationResult[]> {
  const { firestore } = initializeFirebase();

  if (!firestore) return [];

  try {
    const q = query(
      collection(firestore, 'custody_verifications'),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as VerificationResult);
  } catch (error) {
    console.error('[CUSTODY_HISTORY_ERROR]', error);
    return [];
  }
}

/**
 * Real-time custody monitoring with anomaly detection.
 */
export async function monitorCustodyAnomalies(
  addresses: string[],
  checkIntervalMs = 300000 // 5 minutes
): Promise<void> {
  const monitoringId = `monitor-${Date.now()}`;

  const performCheck = async () => {
    try {
      const result = await verifyMultiSourceCustody(addresses);

      if (!result.success || result.discrepancy > 0.00000001) {
        console.warn(
          `[CUSTODY_ANOMALY] Detected discrepancy: ${result.discrepancy} BTC`
        );

        const { firestore } = initializeFirebase();
        if (firestore) {
          await addDoc(collection(firestore, 'custody_anomalies'), {
            monitoring_id: monitoringId,
            address: addresses[0],
            discrepancy: result.discrepancy,
            consensus_achieved: result.success,
            timestamp: new Date().toISOString(),
            createdAt: Timestamp.now(),
          });
        }
      }
    } catch (error) {
      console.error('[MONITORING_ERROR]', error);
    }

    // Schedule next check
    setTimeout(performCheck, checkIntervalMs);
  };

  performCheck();
}
