'use server';
/**
 * @fileOverview Server Actions para o Nexus Engine.
 * Permite que componentes de cliente interajam com o motor vital de forma segura.
 * STATUS: PRODUCTION_REAL
 */

import { nexusEngine } from './nexus-engine';
import { activateAllAgents } from './agents-registry';

export async function initializeNexusEngineAction() {
  return nexusEngine.initialize();
}

export async function startNexusEngineAction(intervalMs: number = 60000) {
  return nexusEngine.start(intervalMs);
}

export async function stopNexusEngineAction() {
  return nexusEngine.stop();
}

export async function isNeuralMeshActiveAction() {
  return nexusEngine.isNeuralMeshActive();
}

export async function activateAllAgentsAction() {
  return activateAllAgents();
}
