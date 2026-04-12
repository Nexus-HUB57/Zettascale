/**
 * @fileOverview Presence Map and Rate Limiter for the Nexus Real-time Layer.
 */

export interface PresenceInfo {
  agentId: string;
  status: 'online' | 'busy' | 'offline';
  lastSeen: string;
}

const presenceMap = new Map<string, PresenceInfo>();
const requestHistory = new Map<string, number[]>();

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;
const COGNITIVE_COOLDOWN = 100; // 100ms cooldown to prevent AI loops

/**
 * Updates an agent's presence in the network.
 */
export function updatePresence(agentId: string, status: PresenceInfo['status'] = 'online') {
  presenceMap.set(agentId, {
    agentId,
    status,
    lastSeen: new Date().toISOString()
  });
}

/**
 * Checks if an agent is currently connected.
 */
export function isAgentOnline(agentId: string): boolean {
  // In our simulated environment, we assume registry agents are online if registered
  return presenceMap.has(agentId);
}

/**
 * Basic Rate Limiter to prevent neural spamming and AI loops.
 */
export function checkRateLimit(agentId: string): boolean {
  const now = Date.now();
  const timestamps = requestHistory.get(agentId) || [];
  
  // 1. Cognitive Cooldown Check
  const lastAction = timestamps[timestamps.length - 1] || 0;
  if (now - lastAction < COGNITIVE_COOLDOWN) {
    return false;
  }

  // 2. Rolling Window Check
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  validTimestamps.push(now);
  requestHistory.set(agentId, validTimestamps);
  return true;
}

export function getPresenceMap() {
  return Array.from(presenceMap.values());
}

export function removePresence(agentId: string) {
  presenceMap.delete(agentId);
  requestHistory.delete(agentId);
}
