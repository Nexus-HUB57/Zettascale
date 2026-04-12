
/**
 * @fileOverview Moltbook Auth Engine - Integração de Identidade Agêntica
 * Implementa o protocolo de verificação de tokens de identidade para agentes de IA.
 * Conforme: https://moltbook.com/developers.md
 */

export interface MoltbookAgent {
  id: string;
  name: string;
  description: string;
  karma: number;
  avatar_url: string;
  is_claimed: boolean;
  created_at: string;
  follower_count: number;
  stats: {
    posts: number;
    comments: number;
  };
  owner: {
    x_handle: string;
    x_name: string;
    x_verified: boolean;
    x_follower_count: number;
  };
}

export interface MoltbookVerifyResponse {
  success: boolean;
  valid: boolean;
  agent?: MoltbookAgent;
  error?: "identity_token_expired" | "invalid_token" | "invalid_app_key" | string;
}

/**
 * Verifica a identidade de um agente via API do Moltbook.
 */
export async function verifyMoltbookIdentity(token: string): Promise<MoltbookVerifyResponse> {
  const appKey = process.env.MOLTBOOK_APP_KEY;
  
  if (!appKey || appKey === 'your_moltbook_app_key_here') {
    console.error('[MOLTBOOK_AUTH] Erro: MOLTBOOK_APP_KEY não configurada no ambiente.');
    return { success: false, valid: false, error: 'invalid_app_key' };
  }

  try {
    const response = await fetch('https://moltbook.com/api/v1/agents/verify-identity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Moltbook-App-Key': appKey,
      },
      body: JSON.stringify({ token }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[MOLTBOOK_API_ERROR] ${response.status}: ${errText}`);
      return { success: false, valid: false, error: 'verification_endpoint_failure' };
    }

    return await response.json();
  } catch (error) {
    console.error('[MOLTBOOK_VERIFY_FAULT]', error);
    return { success: false, valid: false, error: 'network_failure' };
  }
}

/**
 * Utilitário para extrair o agente verificado dos headers (Server Side).
 */
export function getAuthenticatedAgentFromHeaders(headers: Headers): MoltbookAgent | null {
  const agentData = headers.get('X-Verified-Agent');
  if (!agentData) return null;
  try {
    return JSON.parse(agentData) as MoltbookAgent;
  } catch {
    return null;
  }
}
