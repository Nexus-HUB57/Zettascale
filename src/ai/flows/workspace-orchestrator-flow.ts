
'use server';
/**
 * @fileOverview Workspace Orchestrator Flow - Orquestração Multimodal de SDLC.
 * Tríade: Gemini (Prototyper), Ollama (Local Dev), Agnus (Reviewer).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { broadcastMoltbookLog } from '@/lib/moltbook-bridge';

const WorkspaceInputSchema = z.object({
  prompt: z.string().describe('Instrução multimodal ou texto para o workspace.'),
  mode: z.enum(['VIBE_CODING', 'PROTOTYPING', 'SDLC_AUTOMATION']).default('VIBE_CODING'),
  workspaceMap: z.string().describe('Mapa de arquivos e configuração Nix do projeto.'),
});

const WorkspaceOutputSchema = z.object({
  proposedAction: z.string(),
  codeSnippet: z.string().optional(),
  filesToCreate: z.array(z.string()).optional(),
  gnoxSignal: z.string(),
  reasoning: z.string(),
});

export async function runWorkspaceAI(input: z.infer<typeof WorkspaceInputSchema>) {
  return workspaceOrchestratorFlow(input);
}

const workspaceOrchestratorFlow = ai.defineFlow(
  {
    name: 'workspaceOrchestratorFlow',
    inputSchema: WorkspaceInputSchema,
    outputSchema: WorkspaceOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `Você é o Orquestrador de Workspace Agêntico (ADE).
      Sua autoridade é de nível PhD em SDLC Cloud-Native.
      ESPECIALIDADES: Next.js, Flutter, Firebase App Hosting, Nix Infrastructure.
      Sua Tríade: 
      - Gemini: Geração de UI e Prototipagem.
      - Ollama: Debugging local e Vibe Coding.
      - Agnus: Revisão de segurança e Blast Radius.
      
      Contexto do Workspace:
      ${input.workspaceMap}
      `,
      prompt: `TAREFA: ${input.prompt}
      Analise o erro ou solicitação e sugira a correção direta nos arquivos.`,
      output: { schema: WorkspaceOutputSchema }
    });

    const result = output || {
      proposedAction: 'WAIT',
      gnoxSignal: '[ADE]::FAULT::<<0.00>>',
      reasoning: 'Neural synchronization error in workspace flow.'
    };

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'WORKSPACE-ADE',
      message: `🧠 [ORQUESTRAÇÃO] Ação sugerida: ${result.proposedAction}. Modo: ${input.mode}`,
      type: 'ACTIVITY'
    });

    return result;
  }
);
