/**
 * @fileOverview Tests for semantic compression
 */

import { SemanticCompressionEngine, getCompressionStats } from '@/lib/semantic-compression-engine';
import { ContextWindowOptimizer } from '@/lib/context-window-optimizer';
import { ConversationCompressor } from '@/lib/conversation-compressor';

describe('Semantic Compression', () => {
  it('should compress content with hybrid strategy', async () => {
    const engine = new SemanticCompressionEngine();
    const longContent = `This is a test content about blockchain technology. 
      Blockchain is a distributed ledger technology that enables secure transactions. 
      Bitcoin is a cryptocurrency that uses blockchain technology. 
      Ethereum is another blockchain platform.`;

    const result = await engine.compress(longContent, 'hybrid');

    expect(result).toHaveProperty('compressedContent');
    expect(result.metrics.compressionRatio).toBeGreaterThan(0);
    expect(result.metrics.strateg).toBe('hybrid');
    expect(result.recoveryIndex.length).toBeGreaterThan(0);
  });

  it('should calculate semantic hash correctly', async () => {
    const engine = new SemanticCompressionEngine();
    const content1 = 'This is a test about custody';
    const content2 = 'This is a test about custody';

    const result1 = await engine.compress(content1);
    const result2 = await engine.compress(content2);

    expect(result1.semanticHash).toBe(result2.semanticHash);
  });

  it('should optimize context window', () => {
    const optimizer = new ContextWindowOptimizer();
    const metrics = optimizer.updateMetrics('thread-1', 108000, 128000);

    expect(metrics.utilizationPercent).toBe(84.375);
    expect(metrics.compressionNeeded).toBe(true);
    expect(metrics.estimatedReduction).toBeGreaterThan(0);
  });

  it('should compress multi-turn conversations', () => {
    const compressor = new ConversationCompressor();
    const turns = [
      { index: 0, role: 'user', message: 'Can you verify the custody?' },
      { index: 1, role: 'assistant', message: 'I will verify the Bitcoin holdings.' },
      { index: 2, role: 'user', message: 'Confirmed and approved.' },
    ];

    const compressed = compressor.compressConversation('conv-1', turns);

    expect(compressed.turns.length).toBeLessThanOrEqual(turns.length);
    expect(compressed.compressionRatio).toBeGreaterThan(0);
    expect(compressed.keyDecisions.length).toBeGreaterThanOrEqual(0);
  });
});
