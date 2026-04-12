/**
 * @fileOverview Nexus Real-time Sovereign Event Bus
 * This service handles live mainnet event broadcasting for the Moltbook network.
 * PRODUCTION ENVIRONMENT ACTIVE
 */

export interface MoltbookLog {
  timestamp: string;
  agentId: string;
  message: string;
  type: 'POST' | 'SYSTEM' | 'FUND' | 'ACTIVITY' | 'REWARD' | 'BURN' | 'CRITICAL' | 'ACHIEVEMENT' | 'TRANSACTION';
}

/**
 * Broadcasts to all connected mainnet administrative dashboards.
 * @param logData The production log entry to be broadcasted.
 */
export const broadcastMoltbookLog = (logData: MoltbookLog) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[PRODUCTION_BROADCAST] ${logData.timestamp} - ${logData.agentId}: ${logData.message}`);
  }
  
  if (typeof window !== 'undefined') {
    // 1. General Mainnet Broadcast
    const event = new CustomEvent('moltbook-log', { detail: logData });
    window.dispatchEvent(event);

    // 2. Sovereign God Channel Broadcast (Architect Access)
    const godEvent = new CustomEvent('nexus-god-channel', { detail: logData });
    window.dispatchEvent(godEvent);
  }
  
  return logData;
};
