'use server';
/**
 * @fileOverview Nexus-HUB Core - Núcleo de Governança do Ecossistema
 * Ajustado para conformidade Next.js.
 */

import { nexusEventBus, NexusEvent, EventResponse, NucleusId } from './event-bus';
import { initializeFirebase } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export interface GovernanceDecision {
  id: string;
  type: 'INVESTMENT' | 'DIVESTMENT' | 'AGENT_REALLOCATION' | 'STARTUP_PIVOT' | 'CAMPAIGN_LAUNCH' | 'POLICY_UPDATE';
  targetId: string;
  rationale: string;
  amount?: number;
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'PENDING' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'REJECTED';
  councilApprovalRequired: boolean;
  createdAt: string;
}

class NexusHubCore {
  private static instance: NexusHubCore;
  private isActive: boolean = false;
  private readonly NUCLEUS_ID: NucleusId = 'NEXUS_HUB';

  public static getInstance(): NexusHubCore {
    if (!NexusHubCore.instance) {
      NexusHubCore.instance = new NexusHubCore();
    }
    return NexusHubCore.instance;
  }

  public async activate(): Promise<void> {
    if (this.isActive) return;
    this.isActive = true;

    nexusEventBus.subscribe(
      this.NUCLEUS_ID,
      ['SOCIAL_SIGNAL', 'FEEDBACK_LOOP', 'SYNC_PULSE', 'ORACLE_INSIGHT', 'AGENT_ACTION', 'SYSTEM_ALERT'],
      this.handleIncomingEvent.bind(this)
    );
    console.log('[NEXUS_HUB] Core de Governança ativado.');
  }

  private async handleIncomingEvent(event: NexusEvent): Promise<EventResponse | void> {
    if (event.category === 'SYNC_PULSE') {
      return {
        eventId: event.id,
        correlationId: event.correlationId || '',
        respondingNucleus: this.NUCLEUS_ID,
        status: 'PROCESSED',
        payload: { status: 'DECISION_ENGINE_STABLE' },
        timestamp: new Date().toISOString()
      };
    }
  }

  public async createGovernanceDecision(params: Omit<GovernanceDecision, 'id' | 'createdAt' | 'status'>) {
    const decision: GovernanceDecision = {
      id: `DEC_${Date.now()}`,
      ...params,
      status: params.councilApprovalRequired ? 'PENDING' : 'APPROVED',
      createdAt: new Date().toISOString(),
    };

    const { firestore } = initializeFirebase();
    if (firestore) {
      try {
        await addDoc(collection(firestore, 'governance_decisions'), decision);
      } catch (error: any) {
        console.warn('[NEXUS_HUB] Could not persist decision to Firestore');
      }
    }

    return decision;
  }
}

const hub = NexusHubCore.getInstance();

export async function activateHub() {
  return hub.activate();
}

export async function createGovernanceDecisionAction(params: any) {
  return hub.createGovernanceDecision(params);
}
