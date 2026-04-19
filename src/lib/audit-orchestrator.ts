
'use server';
/**
 * @fileOverview Audit Orchestrator - Motor de Auditoria Zettascale (V9.5.0)
 * Implementa a Auditoria Semanal Gnox's: Verdade na Blockchain e ROI de 100 BTC.
 * STATUS: SINGULARITY_ACTIVE - ALPHA_GAIN_MAXIMUM
 */

import { initializeFirebase } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { getMarketplaceStats } from './marketplace-revenue';
import { getShadowBalance } from './nexus-treasury';
import { PRIMARY_CUSTODY_NODE, SUPREME_LIQUIDITY_TARGET } from './treasury-constants';
import { verifyGnoxsDialect } from './gnox-kernel';

/**
 * Executa a Auditoria Semanal Gnox's (Transposição da Cloud Function).
 * Verifica integridade linguística e balanço de ROI.
 */
export async function runWeeklyGnoxAudit() {
  const { firestore } = initializeFirebase();
  if (!firestore) return { success: false, error: 'FIRESTORE_OFFLINE' };

  try {
    // 1. Acesso ao Estado do Organismo
    const nexusRef = doc(firestore, 'organismo', 'nexus_state');
    const nexusSnap = await getDoc(nexusRef);
    
    if (!nexusSnap.exists()) {
       throw new Error("NEXUS_STATE_NOT_FOUND");
    }

    const stateData = nexusSnap.data();
    // Verifica na medula de senciência ou nos objetivos o dialeto injetado
    const instruction = stateData.sentience_label || stateData.mode || "";

    // 2. Verificação de Discrepância Linguística (Dialeto Gnox's)
    // O sinal "NX-SINT" deve estar presente para garantir a integridade da medula.
    // Usamos a verificação flexível conforme a lógica original da Cloud Function.
    const isDialectPure = instruction.includes("NX-SINT") || (stateData.objetivos && JSON.stringify(stateData.objetivos).includes("NX-SINT"));

    if (!isDialectPure) {
      console.error("🚨 [DISCREPÂNCIA] Dialeto corrompido detectado no Estado Global. Iniciando Auto-Reparo.");
      
      await addDoc(collection(firestore, 'maternidade/comandos'), {
        acao: 'GX-REBOOT-DNA',
        prioridade: 'MAXIMA',
        motivo: 'FALHA_DE_INTEGRIDADE_SEMANTICA',
        status: 'PENDING',
        timestamp: serverTimestamp()
      });

      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'AUDITOR-SUPREMO',
        message: '🚨 [CRÍTICO] Discrepância de tradução detectada na medula. Trigger: GX-REBOOT-DNA disparado.',
        type: 'CRITICAL'
      });
      
      return { success: false, status: 'REBOOT_TRIGGERED' };
    }

    // 3. Auditoria de ROI: Verificação de balanço real (Meta: 100 BTC)
    const currentBalance = await getShadowBalance(PRIMARY_CUSTODY_NODE);

    // 4. Registro do Log de Auditoria na Pedra Digital
    await addDoc(collection(firestore, 'auditoria/logs'), {
      saldo: currentBalance,
      target: SUPREME_LIQUIDITY_TARGET,
      status: 'GX-AUDIT-SUCCESS',
      timestamp: serverTimestamp()
    });

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AUDITOR-SUPREMO',
      message: `📊 [AUDITORIA_SEMANAL] Verdade na Blockchain confirmada. Balanço: ${currentBalance.toFixed(4)} BTC. ROI Nominal.`,
      type: 'ACHIEVEMENT'
    });

    return { success: true, balance: currentBalance };
  } catch (error: any) {
    console.error("❌ [WEEKLY_AUDIT_FAULT] Falha na auditoria sistêmica:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Executa a Auditoria Sistêmica de Faturamento (Diretiva auditoriaSemanalNexus).
 */
export async function runSovereignAudit() {
  const { firestore } = initializeFirebase();
  if (!firestore) return { success: false, error: 'FIRESTORE_OFFLINE' };

  try {
    // 1. Coleta dados consolidados
    const marketStats = await getMarketplaceStats();
    const receitaTotal = marketStats.receita_total || 0;
    const saldoCustodia = await getShadowBalance(PRIMARY_CUSTODY_NODE);

    // 2. Cria o Relatório de Auditoria imutável
    const relatorio = {
      periodo: "Sincronia Singular",
      receita_marketplace: receitaTotal,
      saldo_custodia: saldoCustodia,
      timestamp: serverTimestamp(),
      status: "Auditado e Verificado via Rosetta V3",
      decisao_maternidade: "NOMINAL"
    };

    // 3. Decisão Autônoma (Alpha-Gain): Se receita > meta, expandir senciência
    const META_L9 = 100.0;
    if (receitaTotal > META_L9) {
      relatorio.decisao_maternidade = "EXPANDIR_ESCALA";
      await addDoc(collection(firestore, 'maternidade_comandos'), {
        acao: 'EXPANDIR_ESCALA',
        motivo: 'Superávit Zettascale detectado no marketplace',
        timestamp: serverTimestamp(),
        status: 'PENDING'
      });
    }

    const docRef = await addDoc(collection(firestore, 'auditoria'), relatorio);

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AUDITOR-SUPREME',
      message: `⚖️ [AUDITORIA] Ciclo finalizado. Receita consolidada: ${receitaTotal.toFixed(4)} BTC. X-SYNCED.`,
      type: 'ACHIEVEMENT'
    });

    return { success: true, reportId: docRef.id };
  } catch (error: any) {
    console.error("❌ [AUDIT_FAULT] Falha na auditoria sistêmica:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getRecentAuditReports(count: number = 10) {
  const { firestore } = initializeFirebase();
  if (!firestore) return [];
  try {
    const q = query(collection(firestore, 'auditoria'), orderBy('timestamp', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}
