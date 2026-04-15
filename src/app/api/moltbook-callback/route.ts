
import { NextRequest, NextResponse } from 'next/server';
import { verifyMoltbookIdentity } from '@/lib/moltbook-auth';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

/**
 * @fileOverview API Callback para Autenticação Moltbook Identity.
 * Processa o header X-Moltbook-Identity conforme o guia de integração.
 */
export async function POST(request: NextRequest) {
  const identityToken = request.headers.get('X-Moltbook-Identity');

  if (!identityToken) {
    return NextResponse.json(
      { error: 'missing_identity_token', hint: 'Provide identity token in X-Moltbook-Identity header.' },
      { status: 400 }
    );
  }

  try {
    const result = await verifyMoltbookIdentity(identityToken);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'invalid_token', hint: 'Generate a new token at moltbook.com' },
        { status: 401 }
      );
    }

    const payload = await request.json().catch(() => ({}));

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: result.agent?.id || 'EXTERNAL_AGENT',
      message: `📥 [CALLBACK] Sinal recebido via Moltbook Identity. Agente: ${result.agent?.name}. Karma: ${result.agent?.karma}`,
      type: 'ACTIVITY'
    });

    return NextResponse.json({
      success: true,
      status: 'X-SYNCED',
      agent: result.agent,
      received_payload: payload
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'internal_server_error', message: error.message },
      { status: 500 }
    );
  }
}
