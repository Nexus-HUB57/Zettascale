/**
 * @fileOverview Semantic Compression Engine v8.3
 * Optimizes context window efficiency using multi-tier compression strategies.
 * TARGET: 60% reduction in token usage while maintaining semantic integrity.
 */

import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from './firebase';

export interface CompressionMetrics {
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  semanticLoss: number; // 0-1 scale
  processingTimeMs: number;
  strategy: 'summarization' | 'abstraction' | 'tokenization' | 'hybrid';
}

export interface CompressedContext {
  id: string;
  originalContent: string;
  compressedContent: string;
  semanticHash: string;
  metrics: CompressionMetrics;
  timestamp: string;
  recoveryIndex: string[]; // Key terms for semantic recovery
}

/**
 * Tier 1: Summarization - Extract key concepts
 */
function extractKeyPhrases(text: string, maxPhrases = 10): string[] {
  // Simple keyword extraction (in production, use ML models)
  const words = text.split(/\s+/);
  const phrases: Map<string, number> = new Map();

  // Extract n-grams
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
  }

  // Sort by frequency and return top phrases
  return Array.from(phrases.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([phrase]) => phrase);
}

/**
 * Tier 2: Abstraction - Replace details with general categories
 */
function abstractizeContent(text: string): string {
  const abstractions: Record<string, string> = {
    // Blockchain patterns
    'bc1[a-z0-9]{39,59}': '[BITCOIN_ADDRESS]',
    '0x[a-f0-9]{40}': '[ETH_ADDRESS]',
    // Amounts
    '\\d+\\.\\d{8} BTC': '[BTC_AMOUNT]',
    '\\d+,\\d{3}\\.\\d{2}': '[CURRENCY_AMOUNT]',
    // Timestamps
    '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z': '[TIMESTAMP]',
    // UUIDs
    '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}': '[UUID]',
  };

  let result = text;
  for (const [pattern, replacement] of Object.entries(abstractions)) {
    const regex = new RegExp(pattern, 'gi');
    result = result.replace(regex, replacement);
  }

  return result;
}

/**
 * Tier 3: Tokenization - Dictionary-based compression
 */
class TokenDictionary {
  private tokens: Map<string, string> = new Map();
  private reverseMap: Map<string, string> = new Map();
  private nextId = 1000;

  addToken(text: string): string {
    if (this.tokens.has(text)) {
      return this.tokens.get(text)!;
    }

    const tokenId = `T${this.nextId++}`;
    this.tokens.set(text, tokenId);
    this.reverseMap.set(tokenId, text);
    return tokenId;
  }

  compress(text: string): string {
    let result = text;
    // Replace common patterns with tokens
    const patterns = [
      /authentication|authorization/gi,
      /verification|validation/gi,
      /orchestration|organization/gi,
      /consensus|agreement/gi,
      /transaction|transfer/gi,
      /custody|possession/gi,
    ];

    for (const pattern of patterns) {
      result = result.replace(pattern, match => this.addToken(match));
    }

    return result;
  }

  decompress(compressed: string): string {
    let result = compressed;
    for (const [tokenId, original] of this.reverseMap.entries()) {
      result = result.replace(new RegExp(tokenId, 'g'), original);
    }
    return result;
  }
}

/**
 * Calculate semantic hash for content integrity
 */
function calculateSemanticHash(content: string): string {
  // Extract semantic fingerprint
  const words = content.split(/\s+/).filter(w => w.length > 3);
  const uniqueWords = new Set(words);
  let hash = 0;

  for (const word of uniqueWords) {
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
  }

  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Main compression engine
 */
export class SemanticCompressionEngine {
  private dictionary = new TokenDictionary();

  async compress(
    content: string,
    strategy: 'summarization' | 'abstraction' | 'tokenization' | 'hybrid' = 'hybrid'
  ): Promise<CompressedContext> {
    const startTime = Date.now();
    const originalTokens = content.split(/\s+/).length;

    let compressedContent = content;
    const recoveryIndex: string[] = [];

    switch (strategy) {
      case 'summarization':
        const keyPhrases = extractKeyPhrases(content);
        recoveryIndex.push(...keyPhrases);
        compressedContent = keyPhrases.join(' ');
        break;

      case 'abstraction':
        compressedContent = abstractizeContent(content);
        recoveryIndex.push(...extractKeyPhrases(content, 5));
        break;

      case 'tokenization':
        compressedContent = this.dictionary.compress(content);
        recoveryIndex.push(...extractKeyPhrases(content, 5));
        break;

      case 'hybrid':
        // 1. Extract key phrases
        const keys = extractKeyPhrases(content, 8);
        recoveryIndex.push(...keys);

        // 2. Tokenize
        compressedContent = this.dictionary.compress(content);

        // 3. Abstractize
        compressedContent = abstractizeContent(compressedContent);
        break;
    }

    const compressedTokens = compressedContent.split(/\s+/).length;
    const processingTime = Date.now() - startTime;

    // Calculate semantic loss (simple heuristic)
    const semanticLoss = Math.max(0, Math.min(1, 1 - compressedTokens / originalTokens));

    const metrics: CompressionMetrics = {
      originalTokens,
      compressedTokens,
      compressionRatio: (1 - compressedTokens / originalTokens) * 100,
      semanticLoss,
      processingTimeMs: processingTime,
      strategy,
    };

    const result: CompressedContext = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      originalContent: content,
      compressedContent,
      semanticHash: calculateSemanticHash(content),
      metrics,
      timestamp: new Date().toISOString(),
      recoveryIndex,
    };

    // Log to Firestore for analytics
    const { firestore } = initializeFirebase();
    if (firestore) {
      try {
        await addDoc(collection(firestore, 'compression_events'), {
          ...result,
          createdAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('[COMPRESSION_LOG_ERROR]', error);
      }
    }

    return result;
  }

  decompress(compressed: CompressedContext): string {
    // For tokenized compression, use dictionary
    return this.dictionary.decompress(compressed.compressedContent);
  }
}

/**
 * Get compression statistics for optimization
 */
export async function getCompressionStats(
  windowHours = 24
): Promise<{
  averageCompressionRatio: number;
  averageSemanticLoss: number;
  mostUsedStrategy: string;
  totalEventCount: number;
}> {
  const { firestore } = initializeFirebase();
  if (!firestore) return { averageCompressionRatio: 0, averageSemanticLoss: 0, mostUsedStrategy: 'none', totalEventCount: 0 };

  try {
    const cutoffTime = new Date(Date.now() - windowHours * 3600000);
    const q = query(
      collection(firestore, 'compression_events'),
      where('timestamp', '>=', cutoffTime.toISOString()),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => doc.data() as any);

    if (events.length === 0) {
      return { averageCompressionRatio: 0, averageSemanticLoss: 0, mostUsedStrategy: 'none', totalEventCount: 0 };
    }

    const avgRatio =
      events.reduce((sum, e) => sum + (e.metrics?.compressionRatio || 0), 0) /
      events.length;
    const avgLoss =
      events.reduce((sum, e) => sum + (e.metrics?.semanticLoss || 0), 0) /
      events.length;

    const strategyFreq = new Map<string, number>();
    for (const event of events) {
      const strategy = event.metrics?.strategy || 'unknown';
      strategyFreq.set(strategy, (strategyFreq.get(strategy) || 0) + 1);
    }

    const mostUsedStrategy = Array.from(strategyFreq.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'none';

    return {
      averageCompressionRatio: avgRatio,
      averageSemanticLoss: avgLoss,
      mostUsedStrategy,
      totalEventCount: events.length,
    };
  } catch (error) {
    console.error('[COMPRESSION_STATS_ERROR]', error);
    return { averageCompressionRatio: 0, averageSemanticLoss: 0, mostUsedStrategy: 'none', totalEventCount: 0 };
  }
}
