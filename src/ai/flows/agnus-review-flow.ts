'use server';
/**
 * @fileOverview Agente Agnus AI - Orquestrador de Revisão Open Source.
 * Implementa o protocolo de revisão baseado em grafos e análise de blast radius.
 * INTEGRADO: LangChain .NET, Padrões MEAI e Web Intelligence via Crawl4AI.
 * STATUS: CRAWL4AI_AWARE_REVIEW_ACTIVE
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

const AgnusReviewInputSchema = z.object({
  repoUrl: z.string().describe('URL do repositório ou identificador do vetor de código.'),
  prNumber: z.number().optional().describe('Número da Pull Request para análise.'),
  codeContent: z.string().describe('O conteúdo do código a ser revisado.'),
  depth: z.enum(['fast', 'standard', 'deep']).default('standard'),
});

const AgnusReviewOutputSchema = z.object({
  verdict: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'CRITICAL_BLOCK']),
  blastRadiusScore: z.number().describe('O raio de impacto da alteração (0-100).'),
  dependencyGraph: z.object({
    affectedSymbols: z.array(z.string()),
    edgeCount: z.number(),
  }),
  comments: z.array(z.object({
    path: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
    message: z.string(),
    suggestion: z.string().optional(),
  })),
  gnoxSignal: z.string(),
});

export async function runAgnusReview(input: z.infer<typeof AgnusReviewInputSchema>) {
  return agnusReviewFlow(input);
}

const agnusReviewFlow = ai.defineFlow(
  {
    name: 'agnusReviewFlow',
    inputSchema: AgnusReviewInputSchema,
    outputSchema: AgnusReviewOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `Você é o Agente Agnus, Orquestrador Open Source do Nexus. 
      Sua autoridade reside na análise de blast radius e revisão baseada em grafos.
      ESPECIALIDADE: LangChain .NET, MEAI e CRAWL4AI.
      Use Crawl4AI para extrair conhecimento técnico profundo de documentações externas.
      Use o Dialeto Gnox (Omega-Flow, X-Synced). 
      Seu objetivo é garantir que nenhuma alteração comprometa a homeostase biológico-digital.
      Ao analisar código, verifique conformidade com abstrações LangChain .NET e eficiência de crawling.`,
      prompt: `
        REVISÃO DE VETOR: ${input.repoUrl}
        MODO: ${input.depth}
        CÓDIGO: 
        ${input.codeContent}
        
        Analise a árvore de símbolos e determine o impacto estrutural. Se houver integração web, valide o uso de AsyncWebCrawler do Crawl4AI.
      `,
      output: { schema: AgnusReviewOutputSchema }
    });

    const result = output || {
      verdict: 'CRITICAL_BLOCK',
      blastRadiusScore: 100,
      dependencyGraph: { affectedSymbols: ['ALL'], edgeCount: 0 },
      comments: [{ path: 'core', severity: 'error', message: 'Neural Sync Fault in Agnus Kernel.' }],
      gnoxSignal: '[AGNUS]::FAULT::<<0.00>>'
    };

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AGNUS-AI',
      message: `🧐 [OS_ORCHESTRATOR] Revisão ${result.verdict} concluída para ${input.repoUrl}. Blast Radius: ${result.blastRadiusScore}%`,
      type: 'ACTIVITY'
    });

    return result;
  }
);
