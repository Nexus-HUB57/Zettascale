'use server';
/**
 * @fileOverview ORE Módulo 2: Otimização de Tokens e Latência (Embedding Caching Agressivo).
 * Busca similaridade semântica de 98% para evitar chamadas redundantes ao LLM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiReasoningCacheInputSchema = z.object({
  prompt: z.string().describe('O prompt complexo de entrada.'),
});
export type AiReasoningCacheInput = z.infer<typeof AiReasoningCacheInputSchema>;

const AiReasoningCacheOutputSchema = z.object({
  response: z.string().describe('A resposta (do cache ou gerada).'),
  hit: z.boolean().describe('True se houve cache hit.'),
  source: z.enum(['CACHE', 'LLM_PRODUCER']).describe('Fonte da resposta.'),
  embedding: z.array(z.number()).optional().describe('Vetor gerado.'),
});
export type AiReasoningCacheOutput = z.infer<typeof AiReasoningCacheOutputSchema>;

// Simulação de banco de dados vetorial em memória (Server-side)
interface CacheEntry {
  embedding: number[];
  response: string;
  timestamp: number;
}
const vectorCache: CacheEntry[] = [];
const SIMILARITY_THRESHOLD = 0.98;

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0; let mA = 0; let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

export async function runORECache(input: AiReasoningCacheInput): Promise<AiReasoningCacheOutput> {
  return aiReasoningCacheFlow(input);
}

export const aiReasoningCacheFlow = ai.defineFlow(
  {
    name: 'aiReasoningCacheFlow',
    inputSchema: AiReasoningCacheInputSchema,
    outputSchema: AiReasoningCacheOutputSchema,
  },
  async (input): Promise<AiReasoningCacheOutput> => {
    // Passo 2.1: Geração de Hash Semântico
    const embeddingResponse = await ai.embed({
      embedder: 'googleai/text-embedding-004',
      content: input.prompt,
    });
    const inputEmbedding = embeddingResponse.embedding;

    // Passo 2.2: Busca no Cache de Respostas
    let bestMatch: CacheEntry | null = null;
    let maxSim = 0;

    for (const entry of vectorCache) {
      const sim = cosineSimilarity(inputEmbedding, entry.embedding);
      if (sim > maxSim) {
        maxSim = sim;
        bestMatch = entry;
      }
    }

    if (bestMatch && maxSim >= SIMILARITY_THRESHOLD) {
      console.log(`[ORE_CACHE] Hit! Similarity: ${maxSim.toFixed(4)}`);
      return {
        response: `[SOURCE: CACHE] ${bestMatch.response}`,
        hit: true,
        source: 'CACHE',
        embedding: inputEmbedding
      };
    }

    // Passo 2.3: Execução (Miss)
    console.log(`[ORE_CACHE] Miss. Similarity: ${maxSim.toFixed(4)}. Executing LLM...`);
    const llmResponse = await ai.generate({
      prompt: input.prompt,
      model: 'googleai/gemini-1.5-flash',
    });

    const response = llmResponse.text || 'Falha na geração.';

    // Salvar no Cache (TTL simulado de 24h)
    vectorCache.push({
      embedding: inputEmbedding,
      response: response,
      timestamp: Date.now()
    });

    return {
      response,
      hit: false,
      source: 'LLM_PRODUCER',
      embedding: inputEmbedding
    };
  }
);
