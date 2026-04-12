
'use server';
/**
 * @fileOverview Task Delegator: Routes intent-based actions to agents.
 */

import { getAgentById, getAllAgents, Agent } from './agents-registry';
import { broadcastMoltbookLog } from './moltbook-bridge';

export interface GnoxTask {
  id: string;
  intent: string;
  requiredSpecialization: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  payload: any;
}

/**
 * Routes a task to the most qualified agent.
 */
export async function delegateTask(task: GnoxTask) {
  const agents = await getAllAgents();
  const qualified = agents.filter(a => 
    a.status === 'active' && 
    a.specializations.includes(task.requiredSpecialization)
  );

  if (qualified.length === 0) {
    throw new Error(`[DELEGATOR] No active agents specialized in ${task.requiredSpecialization}.`);
  }

  // Pick agent with highest reputation
  const winner = qualified.sort((a, b) => b.reputation - a.reputation)[0];

  broadcastMoltbookLog({
    timestamp: new Date().toISOString(),
    agentId: 'TASK-DELEGATOR',
    message: `🎯 Tarefa "${task.intent}" delegada para ${winner.name}. Prioridade: ${task.priority}`,
    type: 'SYSTEM'
  });

  return {
    success: true,
    agentId: winner.id,
    agentName: winner.name
  };
}
