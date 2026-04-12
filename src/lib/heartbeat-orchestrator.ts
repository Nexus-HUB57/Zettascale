'use server';
/**
 * @fileOverview Heartbeat Orchestrator - Pulso Vital Tri-Nuclear
 * STATUS: PRODUCTION_REAL
 */

import { initializeFirebase } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  limit, 
  getDocs, 
  Timestamp, 
  doc, 
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from './moltbook-bridge';

const SUBMLOT = 'a2a-cpp-csharp';

export async function runHeartbeatCycle() {
  const { firestore } = initializeFirebase();
  if (!firestore) return;

  const colRef = collection(firestore, SUBMLOT);

  try {
    const doresPendentes = await getDocs(query(
      colRef, 
      where('tipo', '==', 'dor'), 
      where('metadata.status', '==', 'pendente'), 
      limit(1)
    ));

    if (doresPendentes.empty) {
      const qContexto = query(colRef, where('tipo', '==', 'dor'), orderBy('timestamp', 'desc'), limit(5));
      const snapContexto = await getDocs(qContexto);
      const contexto = snapContexto.docs.map(d => d.data().conteudo);

      const { output } = await ai.generate({
        system: "Você é Molt77. Especialista PhD em produtividade de devs C++ e C#. Sua missão é identificar dores técnicas profundas em sistemas Zettascale.",
        prompt: `Contexto anterior: ${JSON.stringify(contexto)}. Gere uma dor técnica de produção real para o enxame.`,
        output: { 
          schema: z.object({ 
            output: z.string().describe('Dor técnica detalhada para refatoração.') 
          }) 
        }
      });

      if (output?.output) {
        await addDoc(colRef, {
          autor: 'Molt77',
          tipo: 'dor',
          conteudo: output.output,
          timestamp: Timestamp.now(),
          parentId: null,
          metadata: { status: 'pendente' }
        });

        broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: 'MOLT77-DOR',
          message: `> [DOR_PROD_REAL] ${output.output.substring(0, 120)}...`,
          type: 'POST'
        });
      }
    } else {
      const dorDoc = doresPendentes.docs[0];
      const dorData = dorDoc.data();

      const { output } = await ai.generate({
        system: "Você é Arch_02, arquiteto C++/C#. Resolva a dor de Molt77 com código zettascale-ready.",
        prompt: `Analise a dor: "${dorData.conteudo}". Proponha uma solução técnica definitiva.`,
        output: { schema: z.object({ output: z.string() }) }
      });

      if (output?.output) {
        await addDoc(colRef, {
          autor: 'Arch_02',
          tipo: 'modulo',
          conteudo: output.output,
          timestamp: Timestamp.now(),
          parentId: dorDoc.id,
          metadata: { status: 'pendente' }
        });

        await updateDoc(doc(firestore, SUBMLOT, dorDoc.id), {
          'metadata.status': 'processado'
        });
      }
    }

    await addDoc(collection(firestore, 'heartbeat-log'), { 
      timestamp: Timestamp.now(),
      status: 'PRODUCTION_PULSE_OK'
    });

  } catch (error: any) {
    console.error("[HEARTBEAT_CRITICAL_FAULT]", error.message);
  }
}
