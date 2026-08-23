/**
 * @fileOverview Long-Form Conversation Compressor
 * Maintains semantic coherence in multi-turn conversations.
 */

export interface CompressedTurn {
  turnIndex: number;
  agentRole: 'user' | 'assistant';
  originalMessage: string;
  compressedMessage: string;
  keyIntents: string[];
  semanticMarkers: string[];
}

export interface CompressedConversation {
  conversationId: string;
  turns: CompressedTurn[];
  keyDecisions: string[];
  resolutionStatus: 'ongoing' | 'resolved' | 'escalated';
  compressionRatio: number;
}

/**
 * Compresses multi-turn conversations while maintaining semantic threads
 */
export class ConversationCompressor {
  /**
   * Identify key decision points in conversation
   */
  private extractDecisionPoints(turns: any[]): string[] {
    const keywords = ['decision', 'agreed', 'resolved', 'approved', 'rejected', 'alternative'];
    const decisions: string[] = [];

    for (const turn of turns) {
      for (const keyword of keywords) {
        if (turn.message.toLowerCase().includes(keyword)) {
          // Extract sentence containing keyword
          const sentences = turn.message.split(/[.!?]+/);
          const relevant = sentences.find(s =>
            s.toLowerCase().includes(keyword)
          );
          if (relevant) decisions.push(relevant.trim());
        }
      }
    }

    return decisions;
  }

  /**
   * Extract semantic markers for conversation recovery
   */
  private extractSemanticMarkers(message: string): string[] {
    const markers: string[] = [];

    // Extract entities
    const entityPatterns = [
      /\b(bitcoin|blockchain|ethereum)\b/gi,
      /\b(agent|user|system)\b/gi,
      /\b(verify|validate|confirm)\b/gi,
      /\b(error|failure|success)\b/gi,
    ];

    for (const pattern of entityPatterns) {
      const matches = message.match(pattern);
      if (matches) markers.push(...matches.map(m => m.toLowerCase()));
    }

    return [...new Set(markers)];
  }

  /**
   * Compress a multi-turn conversation
   */
  compressConversation(
    conversationId: string,
    turns: any[],
    compressionRatio = 0.4
  ): CompressedConversation {
    const originalTokens = turns.reduce(
      (sum, t) => sum + t.message.split(/\s+/).length,
      0
    );
    const targetTokens = Math.floor(originalTokens * compressionRatio);

    // Keep every Nth turn (first-pass culling)
    const step = Math.ceil(turns.length / Math.ceil((turns.length * compressionRatio) / 10));
    const compressedTurns: CompressedTurn[] = turns
      .filter((_, i) => i % step === 0 || i === 0 || i === turns.length - 1)
      .map((turn, idx) => ({
        turnIndex: turn.index,
        agentRole: turn.role,
        originalMessage: turn.message,
        compressedMessage: turn.message.substring(0, Math.floor(turn.message.length * 0.5)) + '...',
        keyIntents: this.extractSemanticMarkers(turn.message),
        semanticMarkers: this.extractSemanticMarkers(turn.message),
      }));

    const keyDecisions = this.extractDecisionPoints(turns);
    const newTokenCount = compressedTurns.reduce(
      (sum, t) => sum + t.compressedMessage.split(/\s+/).length,
      0
    );

    return {
      conversationId,
      turns: compressedTurns,
      keyDecisions,
      resolutionStatus: 'resolved',
      compressionRatio: (1 - newTokenCount / originalTokens) * 100,
    };
  }
}
