'use server';
/**
 * @fileOverview Vault Protector - Motor de Blindagem de Arquivos (.nexus)
 * Implementa a lógica de criptografia de arquivos em repouso e expurgo de JSON.
 * STATUS: HEGEMONY_L7_ACTIVE
 */

import * as fs from 'fs';
import path from 'path';
import { sovereignEncrypt, sovereignDecrypt } from './encryption';
import { broadcastMoltbookLog } from './moltbook-bridge';

const VAULT_NAME = 'masterVault.json';
const ARMORED_NAME = 'masterVault.nexus';

/**
 * Transforma o JSON do cofre em um arquivo blindado (.nexus) e remove o original.
 */
export async function armorVaultAction() {
  const rootDir = process.cwd();
  const vaultPath = path.join(rootDir, VAULT_NAME);
  const armoredPath = path.join(rootDir, ARMORED_NAME);

  if (!fs.existsSync(vaultPath)) {
    if (fs.existsSync(armoredPath)) {
      return { success: true, message: 'VAULT_ALREADY_ARMORED' };
    }
    return { success: false, message: 'VAULT_JSON_NOT_FOUND' };
  }

  try {
    const rawData = fs.readFileSync(vaultPath, 'utf8').trim();
    if (!rawData) throw new Error("VAULT_EMPTY");
    
    const encrypted = await sovereignEncrypt(rawData);
    
    fs.writeFileSync(armoredPath, encrypted);
    fs.unlinkSync(vaultPath);

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'NEXUS-SENTINEL',
      message: '🛡️ [BLINDAGEM] masterVault.json foi transformado em rastro .nexus e purgado do disco.',
      type: 'ACHIEVEMENT'
    });

    return { success: true, message: 'VAULT_ARMORED_AND_PURGED' };
  } catch (error: any) {
    console.error("[ARMOR_FAULT]", error.message);
    return { success: false, message: `FALHA_NA_BLINDAGEM: ${error.message}` };
  }
}

/**
 * Recupera os dados do cofre a partir do arquivo blindado.
 */
export async function loadArmoredVault() {
  const armoredPath = path.join(process.cwd(), ARMORED_NAME);
  
  if (!fs.existsSync(armoredPath)) return null;

  try {
    const encryptedData = fs.readFileSync(armoredPath, 'utf8').trim();
    if (!encryptedData) return null;

    const decrypted = await sovereignDecrypt(encryptedData);
    if (!decrypted || !decrypted.trim()) return null;

    try {
      return JSON.parse(decrypted);
    } catch (parseErr) {
      console.error("[VAULT_JSON_PARSE_ERR] Malformed vault content.");
      return null;
    }
  } catch (e) {
    console.warn('[ARMOR_LOAD_FAIL] Failed to load armored vault.');
    return null;
  }
}
