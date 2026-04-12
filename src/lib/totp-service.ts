'use server';
/**
 * @fileOverview TOTP Service - Blindagem de Segundo Fator (Authy/Google Authenticator)
 * Implementa geração de segredos e validação de tokens temporais.
 */

import { authenticator } from 'otplib';

export async function generateSovereignTotpSecret() {
  return authenticator.generateSecret();
}

export async function getTotpProvisioningUri(user: string, secret: string) {
  return authenticator.keyuri(user, 'NEXUS_HUB', secret);
}

export async function verifySovereignToken(token: string, secret: string) {
  try {
    return authenticator.check(token, secret);
  } catch (e) {
    return false;
  }
}
