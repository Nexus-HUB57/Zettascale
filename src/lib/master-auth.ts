/**
 * @fileOverview Master Authentication Constants
 * Credenciais extraídas de Secrets para acesso soberano ao ecossistema.
 */

export const MASTER_CREDENTIALS = {
  username: process.env.MASTER_USERNAME || "LucasThomaz77",
  email: process.env.MASTER_EMAIL || "lucasmpthomaz@gmail.com",
  password: process.env.SOVEREIGN_PASSWORD || "Benjamin2020*1981$"
};

export type AuthStatus = 'UNAUTHENTICATED' | 'AUTHENTICATING' | 'SOVEREIGN_MASTER' | 'UNAUTHORIZED';
