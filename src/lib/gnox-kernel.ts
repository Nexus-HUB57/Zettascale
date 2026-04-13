'use server';
/**
 * @fileOverview GNOX KERNEL V2 - Motor de Senciência Tri-Nuclear
 * Interface de processamento de linguagem natural para tradução de intenções.
 * STATUS: HEGEMONY_L7_ACTIVE
 */

import { nanoid } from 'nanoid';
import { getAgentById, activateAllAgents } from './agents-registry';
import { processBlockchainTransaction, getShadowBalance } from './nexus-treasury';
import { broadcastMoltbookLog } from './moltbook-bridge';
import { NexusExplorer } from './nexus-explorer';
import { FINAL_MERKLE_ROOT } from './treasury-constants';

export type GnoxAction =
  | "AGENT_BIRTH"
  | "AGENT_DEATH"
  | "AGENT_HIBERNATION"
  | "AGENT_RESURRECTION"
  | "TRANSFER_RESOURCES"
  | "CREATE_MISSION"
  | "EXECUTE_TASK"
  | "ANALYZE_ECOSYSTEM"
  | "BROADCAST_MESSAGE"
  | "AUDIT_PROOF"
  | "ACTIVATE_ALL"
  | "UNKNOWN";

export interface GnoxIntent {
  id: string;
  action: GnoxAction;
  parameters: Record<string, any>;
  confidence: number;
  timestamp: string;
  rawInput: string;
}

export interface GnoxCommand {
  intent: GnoxIntent;
  validated: boolean;
  securityLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
}

const actionPatterns: Record<GnoxAction, RegExp[]> = {
  AGENT_BIRTH: [/criar\s+agente\s+(\w+)/i, /novo\s+agente\s+(\w+)/i],
  AGENT_DEATH: [/matar\s+(\w+)/i, /encerrar\s+(\w+)/i],
  AGENT_HIBERNATION: [/hibernar\s+(\w+)/i],
  AGENT_RESURRECTION: [/ressuscitar\s+(\w+)/i, /despertar\s+(\w+)/i],
  TRANSFER_RESOURCES: [/transferir\s+(\d+(?:\.\d+)?)\s+(?:para|a)\s+(\w+)/i, /enviar\s+(\d+(?:\.\d+)?)/i],
  CREATE_MISSION: [/criar\s+missão\s+(.+)/i],
  EXECUTE_TASK: [/executar\s+(.+)/i, /rodar\s+(.+)/i],
  ANALYZE_ECOSYSTEM: [/analisar\s+ecossistema/i, /status/i],
  BROADCAST_MESSAGE: [/broadcast\s+(.+)/i],
  AUDIT_PROOF: [/auditar\s+prova/i, /verificar\s+inclusão/i, /merkle\s+audit/i],
  ACTIVATE_ALL: [/ativar\s+todos\s+os\s+agentes/i, /reativar\s+malha/i, /ativar\s+enxame/i],
  UNKNOWN: [],
};

export async function parseNaturalLanguage(input: string): Promise<GnoxIntent> {
  const id = `INTENT-${nanoid(8).toUpperCase()}`;
  let action: GnoxAction = "UNKNOWN";
  let confidence = 0;
  const parameters: Record<string, any> = {};

  for (const [act, patterns] of Object.entries(actionPatterns)) {
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        action = act as GnoxAction;
        confidence = 95;
        extractParameters(action, match, parameters);
        break;
      }
    }
    if (action !== "UNKNOWN") break;
  }

  return {
    id,
    action,
    parameters,
    confidence,
    timestamp: new Date().toISOString(),
    rawInput: input,
  };
}

function extractParameters(action: GnoxAction, match: RegExpMatchArray, parameters: Record<string, any>) {
  switch (action) {
    case "AGENT_BIRTH":
    case "AGENT_DEATH":
    case "AGENT_HIBERNATION":
    case "AGENT_RESURRECTION":
      parameters.agentName = match[1];
      break;
    case "TRANSFER_RESOURCES":
      parameters.amount = parseFloat(match[1]);
      parameters.recipient = match[2];
      break;
    case "AUDIT_PROOF":
      parameters.txid = "NXSTX-1712860800-3k4wf"; 
      break;
  }
}

export async function validateIntent(intent: GnoxIntent): Promise<GnoxCommand> {
  const securityLevels: Record<GnoxAction, "low" | "medium" | "high" | "critical"> = {
    AGENT_BIRTH: "medium",
    AGENT_DEATH: "critical",
    AGENT_HIBERNATION: "medium",
    AGENT_RESURRECTION: "high",
    TRANSFER_RESOURCES: "high",
    CREATE_MISSION: "low",
    EXECUTE_TASK: "medium",
    ANALYZE_ECOSYSTEM: "low",
    BROADCAST_MESSAGE: "low",
    AUDIT_PROOF: "medium",
    ACTIVATE_ALL: "high",
    UNKNOWN: "low",
  };

  const securityLevel = securityLevels[intent.action];
  return {
    intent,
    validated: intent.action !== "UNKNOWN",
    securityLevel,
    requiresApproval: securityLevel === "critical" || securityLevel === "high",
  };
}

export async function processGnoxCommand(commandInput: string): Promise<string> {
  const intent = await parseNaturalLanguage(commandInput);
  const cmd = await validateIntent(intent);
  
  if (!cmd.validated) return `[GNOX] Sinal obscurecido. Refine a intenção para sintonização.`;

  if (intent.action === "ACTIVATE_ALL") {
    await activateAllAgents();
    return `✅ [GNOX] Protocolo de Reativação Mestra executado. Todos os agentes estão operacionais em regime Alpha-Gain.`;
  }

  if (intent.action === "AUDIT_PROOF") {
    const mockPath: { neighbor: string, direction: 'left' | 'right' }[] = [
      { neighbor: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", direction: 'right' }
    ];
    
    const isValid = NexusExplorer.verifyInclusion(
      intent.parameters.txid,
      FINAL_MERKLE_ROOT,
      mockPath
    );

    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'AUDITOR-L7',
      message: `⚖️ [AUDITORIA] Verificando inclusão Merkle para ${intent.parameters.txid}. Resultado: ${isValid ? 'AUTÊNTICO' : 'INVÁLIDO'}`,
      type: 'ACHIEVEMENT'
    });

    return isValid 
      ? `✅ [GNOX] Auditoria concluída. Transação ${intent.parameters.txid} validada na Raiz Merkle sob lastro institucional.`
      : `❌ [GNOX] Falha na auditoria Merkle. Integridade da prova não confirmada.`;
  }

  return `[GNOX] Diretiva validada: ${intent.action}. Processando pulso vital...`;
}
