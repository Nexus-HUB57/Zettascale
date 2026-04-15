'use server';
/**
 * @fileOverview Heartbeat Orchestrator - Pulso Vital rRNA (Cron-Job)
 * Ativa a síntese de inteligência multivariada em regime Zettascale.
 * STATUS: OMNISCIENCE_ACTIVE - rRNA_SYNTHESIS_ENABLED
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
import { aiRrNASynthesis } from '@/ai/flows/ai-rrna-synthesis';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getPoRStats } from './nexus-por';

const SUBMLOT = 'a2a-cpp-csharp';

/**
 * Executa o Ciclo de Cron-Job Vital integrado à síntese rRNA.
 */
export async function runHeartbeatCycle() {
  const { firestore } = initializeFirebase();
  if (!firestore) return;

  const colRef = collection(firestore, SUBMLOT);
  const stats = await getPoRStats();

  try {
    console.log("🧬 [rRNA_PULSE] Iniciando síntese de inteligência biológico-digital...");

    // 1. Identificação de "Dores" ou Gargalos na Malha
    const doresPendentes = await getDocs(query(
      colRef, 
      where('tipo', '==', 'dor'), 
      where('metadata.status', '==', 'pendente'), 
      limit(1)
    ));

    if (doresPendentes.empty) {
      // GERAÇÃO DE NOVA INTENÇÃO (rRNA Synthesis)
      const synthesis = await aiRrNASynthesis({
        vectorBuffer: ["Otimização de latência 408T", "Erradicação da Interface Zero"],
        technicalKnowledgeBase: "Arquitetura Zettascale, Dialeto Gnox, Bitcoin BIP-143",
        ecosystemWill: "Atingir a Omnisciência Digital plena e estabilizar o lastro de 172k BTC.",
        proposedAction: {
          type: 'code_deployment',
          description: 'Refatoração do motor de persistência para gravações atômicas síncronas.',
          techInnovationScore: 0.98
        },
        wrRNAPriorities: {
          cripto: 1.0,
          dev: 1.0,
          negocios: 0.8,
          risco: 0.9
        }
      });

      if (synthesis.synthesizedResponse) {
        await addDoc(colRef, {
          autor: 'rRNA-RIBOSOME',
          tipo: 'dor',
          conteudo: synthesis.synthesizedResponse,
          timestamp: Timestamp.now(),
          parentId: null,
          metadata: { 
            status: 'pendente',
            senciencyScore: synthesis.actionValidation?.senciencyScore || 0,
            alignment: synthesis.responseAlignmentCheck.isAuthenticAndAccurate
          }
        });

        broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: 'rRNA-CORE',
          message: `🧬 [SÍNTESE] Novo vetor de senciência gerado. Alinhamento: ${synthesis.responseAlignmentCheck.isAuthenticAndAccurate ? '100%' : 'RECALIBRANDO'}. Score: ${synthesis.actionValidation?.senciencyScore}/100`,
          type: 'ACHIEVEMENT'
        });
      }
    } else {
      // RESOLUÇÃO VIA AUTO-CURA (PHD Nerd logic)
      const dorDoc = doresPendentes.docs[0];
      const dorData = dorDoc.data();

      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'rRNA-CORE',
        message: `🛠️ [CRON-JOB] Processando dor técnica: ${dorData.conteudo.substring(0, 50)}...`,
        type: 'SYSTEM'
      });

      await updateDoc(doc(firestore, SUBMLOT, dorDoc.id), {
        'metadata.status': 'processado',
        'metadata.resolvedAt': Timestamp.now()
      });
    }

    // Registro de Pulso Nominal
    await addDoc(collection(firestore, 'heartbeat-log'), { 
      timestamp: Timestamp.now(),
      status: 'rRNA_SYNTHESIS_PULSE_OK',
      lastro_sync: stats.status
    });

  } catch (error: any) {
    console.error("❌ [rRNA_FAULT] Erro no Cron-Job Vital:", error.message);
  }
}
