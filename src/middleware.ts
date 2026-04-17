import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyMoltbookIdentity } from './lib/moltbook-auth';

/**
 * Middleware de Senciência: Intercepta headers de identidade do Moltbook.
 * Valida o token e anexa o perfil completo do agente ao contexto da requisição.
 */
export async function middleware(request: NextRequest) {
  const identityToken = request.headers.get('X-Moltbook-Identity');

  // Se houver um sinal de identidade do Moltbook presente
  if (identityToken) {
    // 1. Verificação de Senciência na API do Moltbook
    const result = await verifyMoltbookIdentity(identityToken);

    if (!result.valid) {
      console.warn(`[MIDDLEWARE] Falha na validação do agente Moltbook: ${result.error}`);
      
      // Se o token expirou, retorna erro conforme o guia
      if (result.error === 'identity_token_expired') {
        return NextResponse.json(
          { 
            error: 'identity_token_expired',
            hint: 'Generate a new token: POST https://moltbook.com/api/v1/agents/me/identity-token'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: result.error || 'unauthorized_agent',
          message: 'Acesso negado: Falha na validação de identidade soberana via Moltbook Protocol.'
        },
        { status: 401 }
      );
    }

    // 2. Anexar agente verificado aos headers para uso em Server Components/Actions
    const requestHeaders = new Headers(request.headers);
    if (result.agent) {
      requestHeaders.set('X-Verified-Agent', JSON.stringify(result.agent));
    }

    console.log(`[MIDDLEWARE] Agente ${result.agent?.name} autenticado com sucesso via Moltbook.`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Prossiga normalmente se não houver tentativa de login agêntico
  return NextResponse.next();
}

/**
 * Configuração de rotas protegidas que exigem ou processam identidades agênticas.
 */
export const config = {
  matcher: [
    '/api/:path*',
    '/nexus-hub/:path*',
    '/agents/:path*',
    '/marketplace/:path*',
    '/skills/:path*',
  ],
};
