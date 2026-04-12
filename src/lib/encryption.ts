'use server';
/**
 * @fileOverview Gnox Cryptographic Layer: Calibração de Algoritmos e Hashing.
 * Implementa AES-256-GCM, PBKDF2-HMAC-SHA256 e assinaturas determinísticas.
 */

import * as crypto from 'crypto';
import { MASTER_CREDENTIALS } from './master-auth';

// Segredos mestres dinâmicos
const GNOX_SECRET = process.env.GNOX_MASTER_SECRET || 'NEXUS_GNOX_ULTRA_SECRET_2026';
const SOVEREIGN_PASSWORD = process.env.SOVEREIGN_PASSWORD || MASTER_CREDENTIALS.password;
const SOVEREIGN_SALT_ENV = 'nexus-sovereign-salt-2026';

// Configurações PBKDF2 (Padrão Institucional PhD)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 32; // 256 bits
const PBKDF2_SALT_LENGTH = 16;

/**
 * Gera um hash PBKDF2 seguro para armazenamento ou comparação.
 */
export async function generatePasswordHash(password: string): Promise<string> {
  const salt = crypto.randomBytes(PBKDF2_SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha256');
  
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

/**
 * Verifica uma senha contra um hash armazenado usando timing-safe comparison.
 */
export async function verifyPasswordHash(password: string, storedHash: string): Promise<boolean> {
  try {
    // Para compatibilidade com a senha mestre do ambiente
    if (!storedHash.includes(':')) {
      return password === storedHash;
    }

    const [saltBase64, hashBase64] = storedHash.split(':');
    const salt = Buffer.from(saltBase64, 'base64');
    const hash = Buffer.from(hashBase64, 'base64');
    
    const testHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha256');
    
    return crypto.timingSafeEqual(hash, testHash);
  } catch (error) {
    return password === storedHash;
  }
}

/**
 * Derivação de chave PBKDF2 para uso em AES.
 */
function deriveSovereignKey(): Buffer {
  return crypto.pbkdf2Sync(SOVEREIGN_PASSWORD, SOVEREIGN_SALT_ENV, 100000, 32, 'sha256');
}

/**
 * Criptografia Blindada AES-256-GCM.
 */
export async function sovereignEncrypt(plaintext: string): Promise<string> {
  const key = deriveSovereignKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag().toString('base64');
  
  return `${iv.toString('base64')}:${tag}:${encrypted}`;
}

/**
 * Descriptografia Soberana.
 */
export async function sovereignDecrypt(payload: string): Promise<string | null> {
  try {
    const [ivBase64, tagBase64, ciphertext] = payload.split(':');
    const key = deriveSovereignKey();
    const iv = Buffer.from(ivBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return null;
  }
}

/**
 * Transpilação do Dialeto Gnox's.
 */
export async function encryptGnoxDialect(payload: string): Promise<string> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(GNOX_SECRET.padEnd(32).substring(0, 32)), iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `[GNOX]::AUTHORITY::<<${iv.toString('hex').substring(0, 8)}:${encrypted.substring(0, 64)}...>>`;
}

/**
 * Assinatura Determinística de Mensagens Swarm.
 */
export async function signGnoxMessage(message: string, agentDna: string): Promise<string> {
  return crypto.createHmac('sha256', agentDna).update(message).digest('hex');
}
