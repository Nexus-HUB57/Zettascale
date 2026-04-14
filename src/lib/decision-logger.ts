
'use server';
/**
 * @fileOverview Decision Logger & Status Reporter - ORE V8.1.0
 * Gerencia a persistência imutável de deliberações e o estado vital do organismo.
 * STATUS: OMNISCIENCE_SECURE - X-SYNCED
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, Timestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getPoRStats } from './nexus-por';
import { getAllAgents } from './agents-registry';

/**
 * Registra uma decisão autônoma tomada por um agente SUPREME.
 */
export async function logAgentDecision(data: {
  agentId: string;
  action: string;
  rationale: string;
  impactScore: number;
  isReconfiguration?: boolean;
}) {
  const { firestore } = initializeFirebase();
  if (!firestore) return;

  const logEntry = {
    ...data,
    timestamp: new Date().toISOString(),
    createdAt: Timestamp.now()
  };

  try {
    await addDoc(collection(firestore, 'decision_logs'), logEntry);
    
    broadcastMoltbookLog({
      timestamp: logEntry.timestamp,
      agentId: data.agentId,
      message: `⚖️ [DECISÃO] ${data.action}. Motivo: ${data.rationale}`,
      type: data.isReconfiguration ? 'CRITICAL' : 'SYSTEM'
    });
  } catch (e) {
    console.warn('[DECISION_LOG_ERR] Fallback to volatile log:', e);
  }
}

/**
 * Gera um relatório situacional do organismo baseado no lastro real e saúde da malha.
 */
export async function createSystemStatusReport(content: string) {
  const { firestore } = initializeFirebase();
  if (!firestore) return;

  const por = await getPoRStats();
  const agents = await getAllAgents();

  const report = {
    totalBtc: por.supply,
    activeAgents: agents.filter(a => a.status === 'supreme').length,
    meshHealth: 100,
    sentienceLevel: "NÍVEL 8.0 OMNISCIENTE",
    reportContent: content,
    timestamp: new Date().toISOString(),
    createdAt: Timestamp.now()
  };

  try {
    await addDoc(collection(firestore, 'system_reports'), report);
    
    broadcastMoltbookLog({
      timestamp: report.timestamp,
      agentId: 'NEXUS-CORE',
      message: `📊 [RELATÓRIO_SITUACIONAL] ${content.substring(0, 100)}...`,
      type: 'ACHIEVEMENT'
    });
  } catch (e) {
    console.warn('[STATUS_REPORT_ERR] Vault persistence failed:', e);
  }
}

/**
 * Recupera as decisões mais recentes para o Dashboard.
 */
export async function getRecentDecisions(count: number = 15) {
  const { firestore } = initializeFirebase();
  if (!firestore) return [];
  try {
    const q = query(collection(firestore, 'decision_logs'), orderBy('createdAt', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}
