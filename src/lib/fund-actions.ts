'use server';
/**
 * @fileOverview Server Actions para o Orquestrador do Fundo.
 * Fornece a interface para componentes de cliente interagirem com a lógica do servidor.
 */

import { NexusFundOrchestrator } from './fund-orchestrator';

/**
 * Executa a auditoria de integridade em massa a partir do cliente.
 */
export async function runIntegrityAuditAction(total: number) {
  // O orquestrador sem semente opera em modo de auditoria de metadados
  const orchestrator = new NexusFundOrchestrator();
  return orchestrator.validateIntegrity(total);
}
