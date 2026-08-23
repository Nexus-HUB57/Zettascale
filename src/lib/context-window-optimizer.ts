/**
 * @fileOverview Context Window Optimizer
 * Monitors and optimizes token usage across agent threads.
 */

export interface ThreadMetrics {
  threadId: string;
  currentTokens: number;
  maxTokens: number;
  utilizationPercent: number;
  compressionNeeded: boolean;
  estimatedReduction: number;
}

export class ContextWindowOptimizer {
  private threadMetrics: Map<string, ThreadMetrics> = new Map();
  private compressionThreshold = 0.85; // 85% utilization triggers compression

  updateMetrics(threadId: string, currentTokens: number, maxTokens = 128000): ThreadMetrics {
    const utilizationPercent = (currentTokens / maxTokens) * 100;
    const compressionNeeded = utilizationPercent > this.compressionThreshold * 100;

    const metrics: ThreadMetrics = {
      threadId,
      currentTokens,
      maxTokens,
      utilizationPercent,
      compressionNeeded,
      estimatedReduction: compressionNeeded
        ? Math.ceil((currentTokens - maxTokens * this.compressionThreshold) * 0.6)
        : 0,
    };

    this.threadMetrics.set(threadId, metrics);
    return metrics;
  }

  getThreadsNeedingCompression(): ThreadMetrics[] {
    return Array.from(this.threadMetrics.values()).filter(
      m => m.compressionNeeded
    );
  }

  predictTokenGrowth(threadId: string, historicalGrowth: number[]): number {
    if (historicalGrowth.length < 2) return 0;

    // Simple linear regression
    const n = historicalGrowth.length;
    const sum = historicalGrowth.reduce((a, b) => a + b, 0);
    const avgGrowth = sum / n;

    return Math.ceil(avgGrowth);
  }
}
