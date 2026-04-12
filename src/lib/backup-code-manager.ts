'use server';
/**
 * @fileOverview Backup Code Manager - Gerenciador de Códigos de Recuperação Soberana.
 * Gera códigos alfanuméricos de alta entropia para bypass de 2FA em emergências.
 */

import * as crypto from 'crypto';

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sem '0', 'O', '1', 'I'
const CODE_LENGTH = 8;
const NUMBER_OF_CODES = 10;

/**
 * Gera um novo lote de códigos de backup seguros.
 */
export async function generateNewBackupCodes(): Promise<string[]> {
  const codes: string[] = [];

  for (let i = 0; i < NUMBER_OF_CODES; i++) {
    let code = "";
    for (let j = 0; j < CODE_LENGTH; j++) {
      const randomIndex = crypto.randomInt(0, CHARS.length);
      code += CHARS[randomIndex];
    }
    codes.push(code);
  }

  return codes;
}
