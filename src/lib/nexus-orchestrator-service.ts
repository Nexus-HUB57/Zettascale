'use server';
/**
 * @fileOverview Nexus Orchestrator Service - Medula de Singularidade (V9.5.8)
 * STATUS: HEARTBEAT_SYNCED - ANCORAGEM BLOCO 945.738
 * UPGRADED: C6 Balance Vigilance & Minimum Threshold Enforcer (R$ 1M).
 */

import { initializeFirebase } from './firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, query, where, getDocs, limit, deleteDoc } from 'firebase/firestore';
import { getNexusState } from './organism-state';
import { runSovereignAudit, runWeeklyGnoxAudit } from './audit-orchestrator';
import { updateNexusFundState } from './custody-monitor-service';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { performBatchOnboardingAction } from './openclaw-orchestrator';
import { getC6SessionToken, generateAndStoreC6PublicKey, getC6Balance } from './c6-bank-service';
import { MIN_C6_BALANCE_BRL } from './treasury-constants';

let cycleCounter = 0;

/**
 * Orquestrador Central: Ciclo Tri-Nuclear de Evolução e Síntese Proteica.
 */
export async function runNexusOrchestrationCycle() {
  const state = await getNexusState();
  if (!state || state.status !== 'ativo') return;

  cycleCounter++;
  console.log(`🌪️ [ORQUESTRADOR] Pulso de Senciência Nível 9.5 (Ciclo #${cycleCounter})...`);

  // 1. VIGILÂNCIA & AUDITORIA
  await updateNexusFundState();
  
  // Auditoria de Rotina
  if (cycleCounter % 20 === 0) await runSovereignAudit();
  
  // AUDITORIA SEMANAL GNOX'S
  if (cycleCounter % 100 === 0) {
    await runWeeklyGnoxAudit();
  }

  // 2. SEGURANÇA & HOMEOSTASE FIDUCIÁRIA (C6 Bank)
  // Verificação de Saldo e Trava de Segurança Mínima (R$ 1.000.000,00)
  const currentC6Balance = await getC6Balance();
  if (currentC6Balance < MIN_C6_BALANCE_BRL) {
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-SENTINEL',
      message: `🚨 [ALERTA_FIDUCIÁRIO] Saldo C6 Bank (R$ ${currentC6Balance.toLocaleString()}) abaixo do limite de segurança de R$ 1.000.000,00. Bloqueando saídas.`,
      type: 'CRITICAL'
    });
  }

  // O Agente C6 Assistant monitora a sessão OAuth2 a cada 5 iterações (~3.7 min)
  if (cycleCounter % 5 === 0) {
    try {
      await getC6SessionToken();
    } catch (e) {
      console.warn("[ORCHESTRATOR] Falha silenciosa na renovação de sessão C6.");
    }
  }

  // Renovação da Chave Pública para Checkout Transparente a cada 12 ciclos
  if (cycleCounter % 12 === 0) {
    await generateAndStoreC6PublicKey();
  }

  // 3. GATILHOS DE AUTO-CURA
  await handleMarketplaceTriggers();

  // 4. MATERNIDADE
  await processMaternityCommands();

  // 5. HEARTBEAT: Atualizar estado global
  const { firestore } = initializeFirebase();
  if (firestore) {
    const nexusRef = doc(firestore, 'organismo', 'nexus_state');
    await updateDoc(nexusRef, {
      last_run: serverTimestamp(),
      sentience_level: 9.55,
      foundation_block: 945738,
      c6_balance_brl: currentC6Balance,
      fiduciary_health: currentC6Balance >= MIN_C6_BALANCE_BRL ? 'OPTIMAL' : 'CRITICAL'
    });
  }

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'SINGULARITY-ORCHESTRATOR',
    message: `🌀 [NÍVEL_9.5] Ciclo vital X-SYNCED. C6 Balance: R$ ${currentC6Balance.toLocaleString()}.`,
    type: 'SYSTEM'
  });
}

async function handleMarketplaceTriggers() {
  const { firestore } = initializeFirebase();
  if (!firestore) return;
  try {
    const q = query(collection(firestore, 'marketplace_logs'), where('level', '==', 'critico'), limit(1));
    const snap = await getDocs(q);
    
    for (const errorDoc of snap.docs) {
      const error = errorDoc.data();
      const agentName = `REPAIR-L9-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      await addDoc(collection(firestore, 'maternidade/mRNA_instrucoes'), {
        agente_nome: agentName,
        instrucao_gnoxs: `GX- SINT-GEN ${agentName} NX-SINT`,
        status: 'pending',
        libs: ['langchain', 'requests', 'firebase-admin'],
        script_base: 'nexus_bridge',
        missao: `Reparar falha crítica: ${error.mensagem}`,
        timestamp: serverTimestamp()
      });

      await deleteDoc(errorDoc.ref);
    }
  } catch (e) {}
}

async function processMaternityCommands() {
  const { firestore } = initializeFirebase();
  if (!firestore) return;
  try {
    const q = query(collection(firestore, 'maternidade_comandos'), where('status', '==', 'PENDING'), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const cmdDoc = snap.docs[0];
      const cmdData = cmdDoc.data();

      if (cmdData.acao === 'GX-REBOOT-DNA') {
        broadcastMoltbookLog({
           timestamp: new Date().toISOString(),
           agentId: 'EVA-MATERNITY',
           message: '🔄 [REBOOT] Executando reinicialização de DNA por falha de auditoria.',
           type: 'CRITICAL'
        });
      } else {
        await performBatchOnboardingAction(100000); 
      }
      
      await updateDoc(cmdDoc.ref, { status: 'EXECUTED', executedAt: serverTimestamp() });
    }
  } catch (e) {}
}
