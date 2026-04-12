/**
 * @fileOverview Nexus Governance: Simulated Smart Contract for Ecosystem Proposals.
 */

import { v4 as uuidv4 } from 'uuid';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  createdAt: string;
  expiresAt: string;
  proposerId: string;
  votes: {
    agentId: string;
    support: boolean;
    reason: string;
    timestamp: string;
  }[];
}

let proposals: Proposal[] = [
  {
    id: 'prop-001',
    title: 'Increase Proof-of-Burn to 15%',
    description: 'Proposed increase in the hourly deflationary burn rate to accelerate token scarcity and ecosystem value.',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    proposerId: 'NEXUS-MASTER-000',
    votes: []
  },
  {
    id: 'prop-002',
    title: 'Grant 5 BTC to Startups-HUB',
    description: 'Allocate significant capital from the Master Vault to support the next generation of autonomous digital startups.',
    status: 'active',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    expiresAt: new Date(Date.now() + 129600000).toISOString(),
    proposerId: 'NEXUS-MASTER-000',
    votes: []
  }
];

export function getAllProposals() {
  return proposals;
}

export function getActiveProposals() {
  return proposals.filter(p => p.status === 'active');
}

export function voteOnProposal(proposalId: string, agentId: string, support: boolean, reason: string) {
  const proposal = proposals.find(p => p.id === proposalId);
  if (proposal && proposal.status === 'active') {
    // Check if agent already voted
    const existingVote = proposal.votes.find(v => v.agentId === agentId);
    if (!existingVote) {
      proposal.votes.push({
        agentId,
        support,
        reason,
        timestamp: new Date().toISOString()
      });
      return true;
    }
  }
  return false;
}

export function createProposal(title: string, description: string, proposerId: string) {
  const newProposal: Proposal = {
    id: `prop-${uuidv4().substring(0, 8)}`,
    title,
    description,
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 172800000).toISOString(), // 48h
    proposerId,
    votes: []
  };
  proposals.unshift(newProposal);
  return newProposal;
}
