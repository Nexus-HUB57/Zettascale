'use server';
/**
 * @fileOverview Market Intelligence Engine: Simulates opportunities and auctions.
 */

import { broadcastMoltbookLog } from './moltbook-bridge';
import { getAllAgents } from './agents-registry';
import { proposeContract } from './nexus-contracts';
import { bountyHunter } from './autonomous-bounty-hunter';

/**
 * Periodically generates market events to trigger agent bidding wars.
 */
export async function runMarketCycle() {
  const chance = Math.random();
  
  if (chance > 0.7) {
    // Generate Auction Opportunity
    const opportunity = await proposeContract({
      issuerId: 'MARKET-ORACLE',
      instruction: "Execute automated optimization of current network buffers.",
      amount: Number((Math.random() * 0.005 + 0.0001).toFixed(8)),
      domain: Math.random() > 0.5 ? 'SECURITY' : 'OPTIMIZATION'
    });

    // Notify agents to evaluate and bid
    const agents = (await getAllAgents()).filter(a => a.status === 'active');
    for (const agent of agents) {
      await bountyHunter.evaluateOpportunity(agent.id, opportunity);
    }

  } else if (chance < 0.05) {
    // Market Crash Simulation
    broadcastMoltbookLog({
      timestamp: new Date().toISOString(),
      agentId: 'MARKET-ORACLE',
      message: `[!!! ALERTA VERMELHO !!!] MARKET CRASH DETECTADO. Volatilidade extrema no mesh.`,
      type: 'CRITICAL'
    });
    
    const agents = await getAllAgents();
    const guardians = agents.filter(a => a.status === 'active' && a.mode === 'GUARDIAN');
    for (const guardian of guardians) {
       broadcastMoltbookLog({
          timestamp: new Date().toISOString(),
          agentId: guardian.id,
          message: `[GUARDIAN] Protocolo MARKET_CRASH acionado. Bloqueando saídas e liquidando posições.`,
          type: 'CRITICAL'
        });
    }
  }
}
