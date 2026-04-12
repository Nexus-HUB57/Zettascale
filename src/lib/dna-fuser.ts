
'use server';
/**
 * @fileOverview DNA Fuser & Genealogy: Trait Inheritance and Mutation Engine.
 */

import * as crypto from 'crypto';

export interface DNA {
  hash: string;
  generation: number;
  traits: {
    intelligence: number;
    stability: number;
    agility: number;
    creativity: number;
  };
}

/**
 * Fuses two agent DNAs to create a descendant.
 */
export async function fuseDNA(parentA: DNA, parentB: DNA): Promise<DNA> {
  const generation = Math.max(parentA.generation, parentB.generation) + 1;
  
  // Inheritance with Mutation
  const mutate = (valA: number, valB: number) => {
    const base = (valA + valB) / 2;
    const mutation = (Math.random() - 0.5) * 10; // +/- 5%
    return Math.max(0, Math.min(100, Math.floor(base + mutation)));
  };

  const traits = {
    intelligence: mutate(parentA.traits.intelligence, parentB.traits.intelligence),
    stability: mutate(parentA.traits.stability, parentB.traits.stability),
    agility: mutate(parentA.traits.agility, parentB.traits.agility),
    creativity: Math.min(100, mutate(parentA.traits.creativity, parentB.traits.creativity) + 5), // Evolutionary creativity boost
  };

  const rawHash = `${parentA.hash}-${parentB.hash}-${Date.now()}`;
  const hash = crypto.createHash('sha256').update(rawHash).digest('hex');

  return {
    hash,
    generation,
    traits
  };
}

export async function generateMasterDNA(): Promise<DNA> {
  return {
    hash: 'master-dna-primary-000',
    generation: 0,
    traits: { intelligence: 100, stability: 100, agility: 100, creativity: 90 }
  };
}
