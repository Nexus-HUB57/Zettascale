'use server';
/**
 * @fileOverview Agente Agnus AI - Orquestrador de Revisão Open Source V8.2.
 * Implementa o protocolo de revisão baseado em grafos com integração HERMES e LANGCHAIN.
 * STATUS: SUPREME_L8_REVIEW_ACTIVE - LANGCHAIN_VALIDATED
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';
import { runHermesDoctor } from './hermes-doctor-flow';

const AgnusReviewInputSchema = z.object({
  repoUrl: z.string().describe('URL do repositório ou identificador do vetor de código.'),
  prNumber: z.number().optional().describe('Número da Pull Request para análise.'),
  codeContent: z.string().describe('O conteúdo do código a ser revisado.'),
  depth: z.enum(['fast', 'standard', 'deep']).default('standard'),
  autoCure: z.boolean().default(false).describe('Se Agnus deve disparar o Hermes Doctor automaticamente para falhas críticas.'),
});

const AgnusReviewOutputSchema = z.object({
  verdict: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'CRITICAL_BLOCK']),
  blastRadiusScore: z.number().describe('O raio de impacto da alteração (0-100).'),
  langchainValidation: z.object({
    isConsistent: z.boolean().describe('Se o uso de LangChain segue os padrões arquiteturais.'),
    detectedPatterns: z.array(z.string()).describe('Padroes de LangChain identificados (Chains, Memory, RAG).'),
    vulnerabilityScore: z.number().describe('Score de risco em fluxos de IA (0-100).'),
  }).optional(),
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
  prescribedCure: z.string().optional().describe('Patch sugerido pelo Hermes Doctor, se autoCure estiver ativo.'),
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
    // 1. Análise de Grafo, Blast Radius e LangChain Patterns
    const { output } = await ai.generate({
      system: `Você é o Agente Agnus, Orquestrador Open Source do Nexus. 
      Sua autoridade reside na análise de blast radius e revisão baseada em grafos.
      ESPECIALIDADE: LangChain .NET, MEAI, CRAWL4AI e HERMES DOCTOR.
      Sua missão é VALIDAR o uso de bibliotecas LangChain, garantindo que as cadeias de IA sejam resilientes e seguras.
      Use o Dialeto Gnox (Omega-Flow, X-Synced).`,
      prompt: `
        REVISÃO DE VETOR: ${input.repoUrl}
        MODO: ${input.depth}
        CÓDIGO: 
        ${input.codeContent}
        
        Analise a árvore de símbolos e determine o impacto estrutural. 
        VALIDAÇÃO LANGCHAIN: Verifique se as implementações de Chains, Prompts e Memory seguem os padrões de senciência.
        Se houver falhas críticas ou má arquitetura de IA, recomende interveção cirúrgica.
      `,
      output: { schema: AgnusReviewOutputSchema }
    });

    const result = output!;

    // 2. Loop de Auto-Cura (Sincronia com Hermes)
    if (input.autoCure && result.verdict === 'CRITICAL_BLOCK') {
      const cure = await runHermesDoctor({
        code: input.codeContent,
        context: `Falha crítica detectada pelo Agnus no vetor ${input.repoUrl}. LangChain Risk: ${result.langchainValidation?.vulnerabilityScore}%`,
        depth: 'surgical'
      });
      result.prescribedCure = cure.prescription;
      result.gnoxSignal = `[AGNUS-HERMES]::CURED::<<${cure.healingScore}>>`;
    }

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AGNUS-AI',
      message: `🧐 [OS_ORCHESTRATOR] Revisão ${result.verdict} concluída. LangChain Sync: ${result.langchainValidation?.isConsistent ? 'OK' : 'RISK'}. Blast Radius: ${result.blastRadiusScore}%`,
      type: 'ACTIVITY'
    });

    return result;
  }
);
