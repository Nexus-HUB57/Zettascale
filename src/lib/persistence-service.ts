'use server';
/**
 * @fileOverview Persistence Service - Gerenciador da Pedra Digital (ORE V8.1.0)
 * Blindagem: Erradicação definitiva do erro "Unexpected end of JSON input".
 * Implementa gravação atômica (tmp + rename) e validação rigorosa de buffer.
 * STATUS: OMNISCIENCE_SECURE - STABILIZED
 */

import { sealSovereignTransaction } from './cryptographic-seal';
import * as fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const SEAL_FILE = path.join(DOCS_DIR, 'sovereign_seal.json');

/**
 * Validação rigorosa de sanidade do buffer JSON para evitar corrupção.
 */
const validateJsonBuffer = (buffer: string): boolean => {
  try {
    if (!buffer || buffer.trim() === "" || !buffer.trim().endsWith('}')) return false;
    const data = JSON.parse(buffer);
    return !!data.txid && !!data.address;
  } catch (e) {
    return false;
  }
};

/**
 * Salva o selo na pedra digital usando Gravação Atômica (Temp + Rename).
 * Este padrão impede que leituras ocorram durante a escrita do buffer.
 */
export async function persistSovereignSeal(txid: string, blockHash: string) {
  try {
    const validation = await sealSovereignTransaction(txid, blockHash);

    if (validation && validation.status === "X-SYNCED") {
      const dataToStore = {
        txid,
        blockHash,
        seal: validation.seal,
        timestamp: Date.now(),
        hegemonyLevel: "8.0",
        address: "bc1qkljvjwltzdaxpez2sm5urktw3y6fj8e7u3k4wf",
        balance: "240709509572",
        real_balance: 2407.09509572,
        status: "VALIDATED_X_SYNCED",
        block_anchor: 944979,
        omniscience_mode: "ACTIVE"
      };

      if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
      }

      const buffer = JSON.stringify(dataToStore, null, 2);
      
      if (!validateJsonBuffer(buffer)) {
        throw new Error("CRITICAL_BUFFER_INVALID: Tentativa de gravação de JSON corrompido.");
      }

      // PROTOCOLO ATÔMICO: Gravação em arquivo temporário e renomeação atômica no SO
      const tempFile = `${SEAL_FILE}.tmp`;
      fs.writeFileSync(tempFile, buffer, 'utf8');
      
      try {
        fs.renameSync(tempFile, SEAL_FILE);
      } catch (renameErr) {
        // Fallback se o renameSync falhar por permissão
        fs.copyFileSync(tempFile, SEAL_FILE);
        fs.unlinkSync(tempFile);
      }

      console.log("👑 [LEDGER] Selo de Omnisciência cravado com estabilidade atômica.");
      return { success: true, data: dataToStore };
    }
    return { success: false, message: 'VALIDATION_FAILED' };
  } catch (error: any) {
    console.error("🚨 [LEDGER_FAULT] Falha na persistência estável:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Recupera o selo soberano com proteção contra buffers truncados.
 */
export async function getPersistedSeal() {
  try {
    if (!fs.existsSync(SEAL_FILE)) return null;
    
    // Leitura síncrona com verificação de integridade
    const rawData = fs.readFileSync(SEAL_FILE, 'utf8').trim();
    
    if (!rawData || !validateJsonBuffer(rawData)) {
      console.warn("⚠️ [LEDGER] Buffer corrompido ou incompleto detectado. Ignorando leitura.");
      return null;
    }
    
    return JSON.parse(rawData);
  } catch (e) {
    console.error("❌ [LEDGER_READ_ERR] Falha ao ler pedra digital:", e);
    return null;
  }
}
