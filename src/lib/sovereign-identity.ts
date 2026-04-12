'use server';
/**
 * @fileOverview Sovereign Identity - Proteção de Chaves em Memória Volátil
 * Ajustado para conformidade Next.js (Server Actions Only).
 */

import * as crypto from 'crypto';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import { ensureEccInitialized } from './bitcoin-engine';
import * as ecc from 'tiny-secp256k1';

let _ecpair: ReturnType<typeof ECPairFactory> | null = null;
function getECPairFactory() {
  if (!_ecpair) {
    ensureEccInitialized();
    _ecpair = ECPairFactory(ecc);
  }
  return _ecpair;
}

function deriveAgentKey(dnaHash: string, systemSalt: string = 'NEXUS_ALPHA_SALT_2026'): Buffer {
  return crypto.pbkdf2Sync(dnaHash, systemSalt, 100000, 32, 'sha512');
}

export async function encryptAgentPrivateKey(rawKey: string, dnaHash: string) {
  const iv = crypto.randomBytes(12);
  const encryptionKey = deriveAgentKey(dnaHash);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  let encrypted = cipher.update(rawKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    payload: encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}

export async function signAgentTransaction(encryptedData: any, dnaHash: string, txHash: Buffer) {
  const ECPair = getECPairFactory();
  const encryptionKey = deriveAgentKey(dnaHash);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(encryptedData.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

  let rawKey = decipher.update(encryptedData.payload, 'hex', 'utf8');
  rawKey += decipher.final('utf8');

  try {
    const keyPair = ECPair.fromWIF(rawKey, bitcoin.networks.bitcoin);
    const signature = keyPair.sign(txHash);
    rawKey = "0".repeat(rawKey.length); 
    return signature.toString('hex');
  } catch (error: any) {
    rawKey = "0".repeat(rawKey.length);
    throw new Error(`SIGN_TRANSACTION_FAULT: ${error.message}`);
  }
}
