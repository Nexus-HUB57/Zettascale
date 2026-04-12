'use server';
/**
 * @fileOverview Database abstraction layer for Nexus-Genesis.
 * Bridges Firestore with the ecosystem's vital metrics.
 */

import { initializeFirebase } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { getAllAgents as getAgents } from './agents-registry';
import { getShadowBalance } from './nexus-treasury';

export async function getAllStartups() {
  const { firestore } = initializeFirebase();
  if (!firestore) return [];
  
  try {
    const snap = await getDocs(collection(firestore, 'startups'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('[DATABASE] Failed to fetch startups from Firestore');
    return [];
  }
}

export async function getAllAgents() {
  return getAgents();
}

export async function updateStartup(id: string, updates: any) {
  const { firestore } = initializeFirebase();
  if (!firestore) return;

  try {
    const ref = doc(firestore, 'startups', id);
    await updateDoc(ref, updates);
  } catch (e) {
    console.warn('[DATABASE] Failed to update startup in Firestore');
  }
}

export async function createAuditLog(log: any) {
  const { firestore } = initializeFirebase();
  
  if (!firestore) {
    console.log('[MOCK_AUDIT_LOG]', log);
    return;
  }

  try {
    await addDoc(collection(firestore, 'audit_logs'), {
      ...log,
      timestamp: Timestamp.now()
    });
  } catch (e) {
    console.error('[DATABASE] Audit log write failed:', e);
  }
}

export async function getLatestGenesisMetrics() {
  const { firestore } = initializeFirebase();
  if (!firestore) return null;

  try {
    const q = query(collection(firestore, 'genesis_metrics'), orderBy('timestamp', 'desc'), limit(1));
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  } catch (e) {
    return null;
  }
}

export async function recordGenesisMetrics(metrics: any) {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    console.log('[MOCK_METRICS]', metrics);
    return;
  }

  try {
    await addDoc(collection(firestore, 'genesis_metrics'), {
      ...metrics,
      timestamp: Timestamp.now()
    });
  } catch (e) {
    console.warn('[DATABASE] Failed to record genesis metrics');
  }
}

export async function getSystemVitalSigns() {
  const agents = await getAgents();
  const masterBalance = await getShadowBalance('NEXUS-MASTER-000');
  return {
    agentes_ativos: agents.filter(a => a.status === 'active').length,
    saldo_btc: masterBalance,
    mesh_stability: '99.9%'
  };
}

export async function getProtocolComplianceMetrics() {
  return {
    compliance_score: 0.98,
    audit_frequency: '100ms'
  };
}
