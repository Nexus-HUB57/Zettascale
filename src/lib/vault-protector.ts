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
    // Se o blindado já existir e o JSON não, o sistema já está protegido
    if (fs.existsSync(armoredPath)) {
      return { success: true, message: 'VAULT_ALREADY_ARMORED' };
    }
    return { success: false, message: 'VAULT_JSON_NOT_FOUND' };
  }

  try {
    const rawData = fs.readFileSync(vaultPath, 'utf8');
    
    // Blindagem via AES-256-GCM (Nexus Sovereign Protocol)
    const encrypted = await sovereignEncrypt(rawData);
    
    fs.writeFileSync(armoredPath, encrypted);
    
    // EXPURGO DE SEGURANÇA: Remove o arquivo original imediatamente
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
    const encryptedData = fs.readFileSync(armoredPath, 'utf8');
    const decrypted = await sovereignDecrypt(encryptedData);
    
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}
