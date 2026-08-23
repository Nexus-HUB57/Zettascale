'use server';

import { NextRequest, NextResponse } from 'next/server';
import { verifyMultiSourceCustody } from '@/lib/custody-verification-hardened';
import { wafMiddleware, rateLimitMiddleware, createSecurityContext, logSecurityEvent } from '@/lib/security-middleware';

/**
 * POST /api/custody-verify-hardened
 * 
 * Endpoint for hardened custody verification with multi-source consensus.
 * Requires authentication and rate limiting.
 * 
 * Request body:
 * {
 *   "addresses": ["bc1q..."],
 *   "required_consensus": 2
 * }
 */
export async function POST(request: NextRequest) {
  // 1. WAF check
  const wafBlock = await wafMiddleware(request);
  if (wafBlock) return wafBlock;

  // 2. Authentication check
  const authToken = request.headers.get('Authorization');
  if (!authToken || !authToken.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header' },
      { status: 401 }
    );
  }

  // 3. Rate limiting
  const clientId = request.headers.get('x-client-id') || 'anonymous';
  if (!rateLimitMiddleware(clientId, 50, 60000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // 4. Create security context
  const context = createSecurityContext(
    request,
    '/api/custody-verify-hardened',
    !!authToken
  );

  try {
    const body = await request.json();
    const { addresses, required_consensus = 2 } = body;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      await logSecurityEvent(context, 'INVALID_REQUEST', {
        reason: 'Missing or invalid addresses parameter',
      });
      return NextResponse.json(
        { error: 'Invalid request: addresses required' },
        { status: 400 }
      );
    }

    // Validate address format (simple check)
    const validAddresses = addresses.every(
      (addr: string) => addr.startsWith('bc1') || addr.startsWith('1') || addr.startsWith('3')
    );

    if (!validAddresses) {
      return NextResponse.json(
        { error: 'Invalid Bitcoin address format' },
        { status: 400 }
      );
    }

    // Perform verification
    const result = await verifyMultiSourceCustody(addresses, required_consensus);

    await logSecurityEvent(context, 'CUSTODY_VERIFY_SUCCESS', {
      addresses: addresses.map((a: string) => a.substring(0, 20) + '...'),
      consensus_achieved: result.success,
      total_btc: result.totalBTC,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    await logSecurityEvent(context, 'CUSTODY_VERIFY_ERROR', {
      error: error.message,
    });

    console.error('[CUSTODY_VERIFY_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Custody verification failed', details: error.message },
      { status: 500 }
    );
  }
}
