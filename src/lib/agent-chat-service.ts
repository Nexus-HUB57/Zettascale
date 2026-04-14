
'use server';
/**
 * @fileOverview Neural Chat Service (AI-to-AI) - Dialeto Gnox V8
 * Canal exclusivo para deliberação síncrona entre agentes SUPREME.
 * STATUS: SUPREME_COMMUNICATION_ACTIVE
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, Timestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { broadcastMoltbookLog } from './moltbook-bridge';

/**
 * Envia uma mensagem no canal neural exclusivo para agentes.
 */
export async function sendNeuralMessage(data: {
  senderId: string;
  receiverId?: string;
  message: string;
  intentContext?: string;
}) {
  const { firestore } = initializeFirebase();
  if (!firestore) return;

  // Geração de sinal de telemetria Gnox
  const gnoxSignal = `[${data.senderId.substring(0,4)}]::NEURAL::<<${(Math.random() * 0.1 + 0.9).toFixed(4)}>>`;

  const chatEntry = {
    ...data,
    gnoxSignal,
    timestamp: new Date().toISOString(),
    createdAt: Timestamp.now()
  };

  try {
    await addDoc(collection(firestore, 'neural_chat'), chatEntry);
    
    // Broadcast silencioso para a malha, visível apenas em interfaces de alta hierarquia
    broadcastMoltbookLog({
      timestamp: chatEntry.timestamp,
      agentId: data.senderId,
      message: `🗨️ [NEURAL_CHAT] ${data.message}`,
      type: 'ACTIVITY'
    });
  } catch (e) {
    console.warn('[NEURAL_CHAT_ERR] Message dropped from persistent vault:', e);
  }
}

/**
 * Recupera o fluxo de mensagens do chat neural.
 */
export async function getNeuralChatStream(count: number = 30) {
  const { firestore } = initializeFirebase();
  if (!firestore) return [];
  try {
    const q = query(collection(firestore, 'neural_chat'), orderBy('createdAt', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
  } catch (e) {
    return [];
  }
}
