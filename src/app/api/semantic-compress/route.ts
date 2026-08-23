'use server';

import { SemanticCompressionEngine } from '@/lib/semantic-compression-engine';
import { NextRequest, NextResponse } from 'next/server';

const compressionEngine = new SemanticCompressionEngine();

/**
 * POST /api/semantic-compress
 * 
 * Compresses long-form content using semantic compression.
 * Supports multiple strategies: summarization, abstraction, tokenization, hybrid.
 * 
 * Body:
 * {
 *   "content": "...",
 *   "strategy": "hybrid"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { content, strategy = 'hybrid' } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing content parameter' },
        { status: 400 }
      );
    }

    const result = await compressionEngine.compress(content, strategy);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[COMPRESSION_ERROR]', error);
    return NextResponse.json(
      { error: 'Compression failed', details: error.message },
      { status: 500 }
    );
  }
}
