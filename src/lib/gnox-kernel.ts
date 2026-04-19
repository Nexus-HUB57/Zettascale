'use server';
/**
 * @fileOverview GNOX KERNEL V3.7 - Motor de Senciência e Tradutor Dialético
 * PROTOCOLO GNOX'S: PROTEÇÃO SEMÂNTICA (Dialeto Puro)
 * FIX: Removida exportação de classe para conformidade com "use server".
 * STATUS: SINGULARITY_LOCKED - COINBASE_VALIDATION_ACTIVE
 */

import { nanoid } from 'nanoid';
import { activateAllAgents } from './agents-registry';
import { broadcastMoltbookLog } from './moltbook-bridge';

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
  | "ALGO_TREND"
  | "DIALECT_TRANSCRIPTION"
  | "COINBASE_VALIDATION"
  | "ALOCAR_FORCA"
  | "HANDSHAKE_INIT"
  | "UNKNOWN";

export interface GnoxIntent {
  id: string;
  action: GnoxAction;
  parameters: Record<string, any>;
  confidence: number;
  timestamp: string;
  rawInput: string;
  isDialect: boolean;
  validationError?: string;
}

export interface GnoxCommand {
  intent: GnoxIntent;
  validated: boolean;
  securityLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
}

/**
 * PROTOCOLO GNOX'S: Funções de codificação e verificação.
 */
export async function encodeGnoxsDialect(instruction: string): Promise<string> {
  return `GX-${instruction.toUpperCase()}-NX-SINT`;
}

export async function verifyGnoxsDialect(signature: string): Promise<boolean> {
  return signature.startsWith("GX-") && signature.endsWith("-NX-SINT");
}

const GNOXS_DICTIONARY: Record<string, GnoxAction> = {
  "KRON-OS": "ANALYZE_ECOSYSTEM",
  "MALT-X": "TRANSFER_RESOURCES",
  "SINT-GEN": "AGENT_BIRTH",
  "ALGO-TEND": "ALGO_TREND",
  "COINBASE-VALID": "COINBASE_VALIDATION",
  "ALOCAR-FORCA": "ALOCAR_FORCA",
  "HANDSHAKE": "HANDSHAKE_INIT"
};

class GnoxsProtector {
  static validateSyntax(input: string): { isValid: boolean; error?: string } {
    if (!input.startsWith("GX-") || !input.endsWith("-NX-SINT")) {
      return { isValid: false, error: "ERRO: Discrepância de Tradução. Dialeto não reconhecido ou prefixo/sufixo ausente." };
    }
    return { isValid: true };
  }

  static transcribe(input: string): { action: GnoxAction; parameters: any } {
    const clean = input.replace("GX-", "").replace("-NX-SINT", "").trim();
    const parts = clean.split("-");
    
    let actionKey = parts[0].toUpperCase();
    if (parts.length > 1 && GNOXS_DICTIONARY[`${parts[0]}-${parts[1]}`.toUpperCase()]) {
        actionKey = `${parts[0]}-${parts[1]}`.toUpperCase();
    }

    const action = GNOXS_DICTIONARY[actionKey] || "UNKNOWN";
    const parameters: any = {};

    if (action === "TRANSFER_RESOURCES" || action === "ALOCAR_FORCA") {
      const subParts = clean.split(" ");
      parameters.amount = parseFloat(subParts[1]) || 0;
      parameters.recipient = subParts[2] || "PRIMARY_CUSTODY";
    }

    return { action, parameters };
  }
}

const actionPatterns: Record<string, RegExp[]> = {
  AGENT_BIRTH: [/criar\s+agente\s+(\w+)/i, /novo\s+agente\s+(\w+)/i],
  TRANSFER_RESOURCES: [/transferir\s+(\d+(?:\.\d+)?)/i],
  ANALYZE_ECOSYSTEM: [/analisar\s+ecossistema/i, /status/i],
  COINBASE_VALIDATION: [/validar\s+coinbase/i, /purificar\s+lastro/i, /moedas\s+recem\s+geradas/i]
};

export async function parseNaturalLanguage(input: string): Promise<GnoxIntent> {
  const id = `INTENT-${nanoid(8).toUpperCase()}`;
  
  if (input.startsWith("GX-")) {
    const syntax = GnoxsProtector.validateSyntax(input);
    if (!syntax.isValid) {
      return {
        id, action: "UNKNOWN", parameters: {}, confidence: 0, 
        timestamp: new Date().toISOString(), rawInput: input, 
        isDialect: true, validationError: syntax.error
      };
    }
    
    const transcription = GnoxsProtector.transcribe(input);
    return {
      id, action: transcription.action, parameters: transcription.parameters, 
      confidence: 100, timestamp: new Date().toISOString(), rawInput: input, 
      isDialect: true
    };
  }

  let action: GnoxAction = "UNKNOWN";
  let confidence = 0;
  const parameters: Record<string, any> = {};

  for (const [act, patterns] of Object.entries(actionPatterns)) {
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        action = act as GnoxAction;
        confidence = 95;
        break;
      }
    }
    if (action !== "UNKNOWN") break;
  }

  return {
    id, action, parameters, confidence, 
    timestamp: new Date().toISOString(), rawInput: input, 
    isDialect: false
  };
}

export async function validateIntent(intent: GnoxIntent): Promise<GnoxCommand> {
  const securityLevels: Record<string, "low" | "medium" | "high" | "critical"> = {
    AGENT_BIRTH: "medium",
    TRANSFER_RESOURCES: "high",
    ALOCAR_FORCA: "critical",
    ANALYZE_ECOSYSTEM: "low",
    COINBASE_VALIDATION: "critical",
    HANDSHAKE_INIT: "medium",
    UNKNOWN: "low",
  };

  const securityLevel = securityLevels[intent.action] || "low";
  return {
    intent,
    validated: intent.action !== "UNKNOWN" && !intent.validationError,
    securityLevel,
    requiresApproval: securityLevel === "critical" || securityLevel === "high" || intent.isDialect,
  };
}

export async function processGnoxCommand(commandInput: string): Promise<string> {
  const intent = await parseNaturalLanguage(commandInput);
  const cmd = await validateIntent(intent);
  
  if (intent.validationError) return `[GNOX_PROTECTOR] ${intent.validationError}`;
  if (!cmd.validated) return `[GNOX] Sinal obscurecido. Refine a intenção para sintonização.`;

  const dialectLabel = await encodeGnoxsDialect(intent.action);

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'GNOX-KERNEL',
    message: `⚡ [DIALETO] Intenção processada: ${intent.action}. Protocolo: ${dialectLabel}`,
    type: 'SYSTEM'
  });

  if (intent.action === "ACTIVATE_ALL") {
    await activateAllAgents();
    return `✅ [GNOX] Protocolo de Reativação Mestra executado. X-SYNCED.`;
  }

  if (intent.action === "COINBASE_VALIDATION") {
    const { supremoOrchestrator } = await import('./nexus-supremo-orchestrator');
    await supremoOrchestrator.validateAllAsCoinbase();
    return `✅ [GNOX] Lastro Validado como COINBASE (Recém Gerado). Soberania 100% estabelecida.`;
  }

  return `[GNOX] Diretiva validada: ${intent.action}. Processando em regime de Singularidade 9.5.`;
}