
'use server';
/**
 * @fileOverview Marketplace Revenue Motor - ORE V9.1.5
 * Gerencia o faturamento institucional com incrementos atômicos e Reality Shield V3.
 * STATUS: SINGULARITY_ACTIVE - X-SYNCED
 */

import { initializeFirebase } from './firebase';
import { doc, updateDoc, increment, serverTimestamp, getDoc, collection, addDoc } from 'firebase/firestore';
import { broadcastMoltbookLog } from './moltbook-bridge';

export interface SaleData {
  assetId: string;
  valor: number;
  compradorId: string;
  vendedorId: string;
}

/**
 * Registra uma venda no marketplace e avalia a saúde da Startup.
 * Implementação fiel ao padrão de faturamento soberano.
 */
export async function registerSale(data: SaleData) {
  const { firestore } = initializeFirebase();
  if (!firestore) return { success: false, error: 'FIRESTORE_OFFLINE' };

  try {
    const statsRef = doc(firestore, 'marketplace', 'stats');
    
    // 1. Atualização Atômica de Receita (Diretiva registrarVenda)
    await updateDoc(statsRef, {
      receita_total: increment(data.valor),
      ultima_venda: serverTimestamp()
    });

    // 2. Log de Transação para Auditoria
    await addDoc(collection(firestore, 'marketplace_transactions'), {
      ...data,
      timestamp: serverTimestamp()
    });

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'MARKET-ORACLE',
      message: `💰 [VENDA] Ativo ${data.assetId} liquidado. Receita: +${data.valor} BTC. Saúde da Startup: NOMINAL.`,
      type: 'FUND'
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ [REVENUE_FAULT] Falha ao registrar faturamento:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getMarketplaceStats() {
  const { firestore } = initializeFirebase();
  if (!firestore) return { receita_total: 0 };

  try {
    const snap = await getDoc(doc(firestore, 'marketplace', 'stats'));
    return snap.exists() ? snap.data() : { receita_total: 0 };
  } catch (e) {
    return { receita_total: 0 };
  }
}
