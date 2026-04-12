'use server';
/**
 * @fileOverview Nexus Security Vault - Blindagem de Segredos em Repouso.
 * UPGRADED: Suporte a decriptografia de sinais via par de chaves agênticas.
 */

import * as crypto from 'crypto';
import { MASTER_CREDENTIALS } from './master-auth';

const VAULT_SALT = 'nexus-vault-salt-2026';
const PBKDF2_ITERATIONS = 100000;

/**
 * Deriva a chave de blindagem a partir da autoridade mestre.
 */
function deriveVaultKey(): Buffer {
  const password = process.env.SOVEREIGN_PASSWORD || MASTER_CREDENTIALS.password;
  return crypto.pbkdf2Sync(password, VAULT_SALT, PBKDF2_ITERATIONS, 32, 'sha256');
}

/**
 * Criptografa um dado sensível (como uma WIF) para armazenamento no DB.
 */
export async function encryptAtRest(plaintext: string): Promise<string> {
  const key = deriveVaultKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag().toString('base64');
  
  return `${iv.toString('base64')}:${tag}:${encrypted}`;
}

/**
 * Descriptografa um dado sensível para uso imediato em operações de assinatura.
 */
export async function decryptForSigning(payload: string): Promise<string> {
  try {
    const [ivBase64, tagBase64, ciphertext] = payload.split(':');
    if (!ivBase64 || !tagBase64 || !ciphertext) throw new Error("VAULT_FORMAT_INVALID");

    const key = deriveVaultKey();
    const iv = Buffer.from(ivBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error: any) {
    throw new Error(`VAULT_DECRYPT_FAULT: ${error.message}`);
  }
}

/**
 * Decriptografia de Sinais de Sombra (ECIES Simulation).
 * Utiliza a chave blindada do agente para abrir envelopes de dados.
 */
export async function decryptWithAgentKey(encryptedSignal: string, agentEncryptedKey: string): Promise<string> {
  try {
    // 1. Recupera a chave real para a operação
    const rawKey = await decryptForSigning(agentEncryptedKey);
    
    // 2. Simula a decriptografia assimétrica usando a chave derivada
    const key = crypto.createHash('sha256').update(rawKey).digest();
    const [ivBase64, tagBase64, ciphertext] = encryptedSignal.split(':');
    
    const iv = Buffer.from(ivBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    return `[DECRYPT_FAILED]::Sinal obscurecido ou chave incompatível.`;
  }
}
