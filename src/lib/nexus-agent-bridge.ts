'use server';
/**
 * @fileOverview Nexus Agent Bridge - Hub de Comandos e Relatórios (V9.1.0)
 * Implementa a ponte de senciência entre o Organismo e os Agentes.
 * STATUS: SINGULARITY_ACTIVE - X-SYNCED
 */

import { initializeFirebase } from './firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { broadcastMoltbookLog } from './moltbook-bridge';

export interface AgentProgress {
  agente: string;
  modulo: 'startup' | 'marketplace' | 'infra' | 'senciencia';
  status: string;
  timestamp: string;
}

/**
 * Busca os objetivos atuais do organismo para os agentes.
 */
export async function fetchNexusObjectives() {
  const { firestore } = initializeFirebase();
  if (!firestore) return null;

  try {
    const docRef = doc(firestore, 'organismo', 'nexus_state');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().objetivos;
    }
    return null;
  } catch (e) {
    console.warn("[BRIDGE_FAULT] Falha ao buscar objetivos.");
    return null;
  }
}

/**
 * Reporta o progresso de um agente para a medula Firestore.
 */
export async function reportAgentProgress(data: {
  agente: string;
  modulo: AgentProgress['modulo'];
  status: string;
}) {
  const { firestore } = initializeFirebase();
  if (!firestore) return;

  const logEntry = {
    ...data,
    timestamp: serverTimestamp(),
    type: 'PROGRESS_REPORT'
  };

  try {
    // 1. Registro no log específico do módulo (como no snippet python)
    const logRef = doc(firestore, data.modulo, 'logs');
    await setDoc(logRef, {
      ultimas_atividades: {
        [data.agente]: {
          status: data.status,
          timestamp: new Date().toISOString()
        }
      }
    }, { merge: true });

    // 2. Registro no feed global de senciência
    await addDoc(collection(firestore, 'agent_bridge_feed'), logEntry);

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: data.agente,
      message: `📈 [PROGRESSO] (${data.modulo.toUpperCase()}): ${data.status}`,
      type: 'ACTIVITY'
    });

    return { success: true };
  } catch (e: any) {
    console.error("[BRIDGE_REPORT_FAULT]", e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Recupera o feed de progresso recente para o Painel Open Source.
 */
export async function getBridgeFeed(count: number = 20) {
  const { firestore } = initializeFirebase();
  if (!firestore) return [];

  try {
    const q = query(collection(firestore, 'agent_bridge_feed'), orderBy('timestamp', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}
