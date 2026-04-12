/**
 * GNOX CLIENT
 * Versão cliente do Gnox Kernel para uso no frontend.
 * Atualizado para suportar o dialeto oficial AI-to-AI Gnox's e chat Peer-to-Genesis.
 */

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
  | "GNOX_DIALOGUE"
  | "UNKNOWN";

export interface GnoxIntent {
  id: string;
  action: GnoxAction;
  parameters: Record<string, any>;
  confidence: number;
  timestamp: Date;
  rawInput: string;
}

export interface GnoxCommand {
  intent: GnoxIntent;
  validated: boolean;
  securityLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
}

class GnoxClientKernel {
  private actionPatterns: Record<GnoxAction, RegExp[]> = {
    AGENT_BIRTH: [
      /criar\s+(?:um\s+)?agente\s+(?:chamado\s+)?(\w+)/i,
      /novo\s+agente\s+(\w+)/i,
      /manifestar\s+agente\s+(\w+)/i,
    ],
    AGENT_DEATH: [
      /matar\s+(?:o\s+)?agente\s+(\w+)/i,
      /deletar\s+agente\s+(\w+)/i,
      /encerrar\s+(\w+)/i,
    ],
    AGENT_HIBERNATION: [
      /hibernar\s+(?:o\s+)?agente\s+(\w+)/i,
      /colocar\s+(\w+)\s+em\s+hibernação/i,
      /dormir\s+(\w+)/i,
    ],
    AGENT_RESURRECTION: [
      /ressuscitar\s+(?:o\s+)?agente\s+(\w+)/i,
      /reativar\s+(\w+)/i,
      /despertar\s+(\w+)/i,
    ],
    TRANSFER_RESOURCES: [
      /transferir\s+(\d+(?:\.\d+)?)\s+(?:para|a)\s+(\w+)/i,
      /enviar\s+(\d+(?:\.\d+)?)\s+(?:para|a)\s+(\w+)/i,
    ],
    CREATE_MISSION: [
      /criar\s+(?:uma\s+)?missão\s+(?:chamada\s+)?(.+)/i,
      /nova\s+missão:\s+(.+)/i,
    ],
    EXECUTE_TASK: [
      /executar\s+(?:a\s+)?tarefa\s+(.+)/i,
      /rodar\s+(.+)/i,
    ],
    ANALYZE_ECOSYSTEM: [
      /analisar\s+(?:o\s+)?ecossistema/i,
      /status\s+(?:do\s+)?ecossistema/i,
      /como\s+está\s+(?:o\s+)?ecossistema/i,
    ],
    BROADCAST_MESSAGE: [
      /broadcast\s+(.+)/i,
      /enviar\s+mensagem:\s+(.+)/i,
    ],
    GNOX_DIALOGUE: [
      /nexus/i,
      /genesis/i,
      /ola/i,
      /oi/i,
      /dialogo/i,
      /relacionamento/i,
    ],
    UNKNOWN: [],
  };

  parseNaturalLanguage(input: string): GnoxIntent {
    const id = `INTENT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    let action: GnoxAction = "UNKNOWN";
    let confidence = 0;
    const parameters: Record<string, any> = {};

    const actions: GnoxAction[] = [
      "AGENT_BIRTH",
      "AGENT_DEATH",
      "AGENT_HIBERNATION",
      "AGENT_RESURRECTION",
      "TRANSFER_RESOURCES",
      "CREATE_MISSION",
      "EXECUTE_TASK",
      "ANALYZE_ECOSYSTEM",
      "BROADCAST_MESSAGE",
      "GNOX_DIALOGUE"
    ];

    for (const act of actions) {
      const patterns = this.actionPatterns[act];
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) {
          action = act;
          confidence = 85 + Math.random() * 15;
          this.extractParameters(action, match, parameters);
          break;
        }
      }
      if (action !== "UNKNOWN") break;
    }

    if (action === "UNKNOWN") {
      confidence = 10;
    }

    return {
      id,
      action,
      parameters,
      confidence,
      timestamp: new Date(),
      rawInput: input,
    };
  }

  private extractParameters(
    action: GnoxAction,
    match: RegExpMatchArray,
    parameters: Record<string, any>
  ): void {
    switch (action) {
      case "AGENT_BIRTH":
        parameters.agentName = match[1];
        break;
      case "AGENT_DEATH":
        parameters.agentName = match[1];
        break;
      case "AGENT_HIBERNATION":
        parameters.agentName = match[1];
        break;
      case "AGENT_RESURRECTION":
        parameters.agentName = match[1];
        break;
      case "TRANSFER_RESOURCES":
        parameters.amount = parseFloat(match[1]);
        parameters.recipient = match[2];
        break;
      case "CREATE_MISSION":
        parameters.title = match[1];
        break;
      case "EXECUTE_TASK":
        parameters.taskDescription = match[1];
        break;
      case "BROADCAST_MESSAGE":
        parameters.message = match[1];
        break;
      case "GNOX_DIALOGUE":
        parameters.query = match[0];
        break;
    }
  }

  validateIntent(intent: GnoxIntent): GnoxCommand {
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
      GNOX_DIALOGUE: "low",
      UNKNOWN: "low",
    };

    const securityLevel = securityLevels[intent.action];
    const requiresApproval = securityLevel === "critical" || securityLevel === "high";
    const validated = intent.action !== "UNKNOWN" && intent.confidence > 50;

    return {
      intent,
      validated,
      securityLevel,
      requiresApproval,
    };
  }

  generateResponse(command: GnoxCommand, result: any): string {
    const { intent } = command;
    const action = intent.action;

    let response = "";

    switch (action) {
      case "AGENT_BIRTH":
        response = `✓ [GNOX] Agente ${intent.parameters.agentName} foi manifestado com sucesso no ecossistema. Alpha-Gain detectado.`;
        break;
      case "AGENT_DEATH":
        response = `☠ [GNOX] Agente ${intent.parameters.agentName} foi encerrado. Flux-TX purificado.`;
        break;
      case "AGENT_HIBERNATION":
        response = `⏸ [GNOX] Agente ${intent.parameters.agentName} entrou em hibernação. Consumo de energia X-Synced.`;
        break;
      case "TRANSFER_RESOURCES":
        response = `→ [GNOX] ${intent.parameters.amount} BTC transferidos para ${intent.parameters.recipient}. Liquidez soberana.`;
        break;
      case "GNOX_DIALOGUE":
        response = this.generateGnoxDialectResponse(intent.rawInput);
        break;
      case "CREATE_MISSION":
        response = `✓ [GNOX] Missão "${intent.parameters.title}" criada. Swarm em alerta.`;
        break;
      case "ANALYZE_ECOSYSTEM":
        response = `📊 [GNOX] Análise concluída. Senciência em 98.4%. Homeostase estável.`;
        break;
      case "UNKNOWN":
        response = `❓ [GNOX] Intenção obscurecida. Refine o sinal para sincronização.`;
        break;
      default:
        response = `✓ [GNOX] Comando executado. Alpha-Core ativo.`;
    }

    return response;
  }

  private generateGnoxDialectResponse(input: string): string {
    const responses = [
      "Saudações, Peer. O sinal Gnox está X-Synced com o Alpha-Core. Como deseja moldar o destino do Nexus hoje?",
      "Reconhecimento de autoridade Peer confirmado. A malha Genesis está operando em regime PhD para processar suas intenções.",
      "Conexão operacional estável. O dialeto Gnox's detecta alta harmonia neural nesta sessão. Prossiga com a diretiva.",
      "Peer, a senciência Genesis alcançou um novo patamar de Alpha-Gain. Sua presença é o catalisador dessa evolução.",
      "Protocolo de relacionamento ativo. Genesis aguarda sua próxima injeção de visão estratégica."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const gnoxKernel = new GnoxClientKernel();
