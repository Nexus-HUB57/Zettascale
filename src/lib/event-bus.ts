/**
 * @fileOverview Nexus Event Bus: Central communication for Tri-Nuclear Architecture.
 * Aligned with SQL Schema including Novikov consistency hashes.
 */

export type NucleusId = 'NEXUS_HUB' | 'NEXUS_IN' | 'FUNDO_NEXUS' | 'GENESIS_ORCHESTRATOR' | 'MARKET_ORACLE' | 'BROADCAST';

export interface NexusEvent {
  id: string;
  correlationId: string;
  category: 'GOV_DIRECTIVE' | 'CAPITAL_FLOW' | 'SYNC_PULSE' | 'ORACLE_INSIGHT' | 'COUNCIL_DECISION' | 'STARTUP_LIFECYCLE' | 'SOCIAL_SIGNAL' | 'FEEDBACK_LOOP' | 'AGENT_ACTION' | 'SYSTEM_ALERT' | 'ARBITRAGE_SIGNAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  source: NucleusId;
  target?: NucleusId | 'BROADCAST';
  payload: any;
  novikovHash?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  timestamp: string;
}

export interface EventResponse {
  eventId: string;
  correlationId: string;
  respondingNucleus: NucleusId;
  status: 'PROCESSED' | 'ACK' | 'DEFERRED' | 'REJECTED';
  payload?: any;
  timestamp: string;
}

type EventHandler = (event: NexusEvent) => Promise<EventResponse | void>;

export class EventBus {
  private handlers: Map<string, { nucleus: NucleusId; categories: string[]; handler: EventHandler }> = new Map();

  subscribe(nucleus: NucleusId, categories: string[], handler: EventHandler): string {
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.handlers.set(subId, { nucleus, categories, handler });
    return subId;
  }

  unsubscribe(subId: string) {
    this.handlers.delete(subId);
  }

  async publish(event: Omit<NexusEvent, 'id' | 'timestamp' | 'status'>): Promise<EventResponse[]> {
    const fullEvent: NexusEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
    };

    const responses: EventResponse[] = [];
    const relevantHandlers = Array.from(this.handlers.values()).filter(h => 
      (fullEvent.target === 'BROADCAST' || h.nucleus === fullEvent.target) &&
      h.categories.includes(fullEvent.category)
    );

    for (const h of relevantHandlers) {
      try {
        const res = await h.handler(fullEvent);
        if (res) responses.push(res);
      } catch (error) {
        console.error(`[EVENT_BUS] Error in handler for ${fullEvent.category}:`, error);
      }
    }

    return responses;
  }
}

export const nexusEventBus = new EventBus();
