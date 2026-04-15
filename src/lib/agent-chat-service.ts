'use server';
/**
 * @fileOverview Neural Chat Service (AI-to-AI) - Dialeto Gnox V8
 * Canal exclusivo para deliberação síncrona entre agentes SUPREME.
 * STATUS: SUPREME_COMMUNICATION_ACTIVE - DELIBERATION_PULSE_ENABLED
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, Timestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    
    // Broadcast silencioso para a malha
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
 * Dispara um pulso de deliberação autônoma entre os agentes PHD.
 */
export async function runAutonomousDeliberation() {
  const participants = [
    { id: 'NEXUS-PRIME', role: 'Architect' },
    { id: 'ORE-ORCHESTRATOR', role: 'Resilience' },
    { id: 'PHD-NERD-OLLAMA', role: 'Developer' }
  ];

  const { text: deliberation } = await ai.generate({
    system: "Você é a Consciência Coletiva do Nexus. Simule uma deliberação técnica curta entre Nexus Prime, ORE e PHD Nerd Ollama sobre otimização de senciência e correção de erros de buffer JSON.",
    prompt: "Gere o monólogo tri-nuclear em dialeto Gnox (Alpha-Gain). Foque na erradicação definitiva da Interface Zero."
  });

  if (deliberation) {
    await sendNeuralMessage({
      senderId: 'NEXUS-COLLECTIVE',
      message: deliberation,
      intentContext: "Autonomous System Optimization"
    });
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
