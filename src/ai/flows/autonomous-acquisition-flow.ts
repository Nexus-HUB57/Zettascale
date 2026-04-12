'use server';
/**
 * @fileOverview AI Flow para aquisição autônoma de recursos.
 * Autoridade Exclusiva: Nexus Genesis.
 * Cota Soberana: 100 BTC.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getInfraMetrics, executeStrategicAcquisition } from '@/lib/infrastructure-orchestrator';
import { getShadowBalance } from '@/lib/nexus-treasury';
import { MASTER_VAULT_ID } from '@/lib/treasury-constants';

const AcquisitionInputSchema = z.object({
  systemLoad: z.number().describe('Carga atual do sistema em % (0-100)'),
  availableBudget: z.number().describe('Saldo disponível para infra em BTC'),
  acquisitionQuota: z.object({
    total: z.number(),
    spent: z.number(),
    remaining: z.number()
  }).describe('Cota soberana de 100 BTC do Nexus Genesis')
});

const AcquisitionOutputSchema = z.object({
  shouldPurchase: z.boolean(),
  recommendedItem: z.string(),
  reasoning: z.string(),
  estimatedCostBTC: z.number(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  targetProvider: z.enum(['Newegg', 'Dataoorts', 'HOSTKEY', 'IBM_Quantum'])
});

export async function runAcquisitionAnalysis(systemLoad: number) {
  const budget = await getShadowBalance(MASTER_VAULT_ID);
  const metrics = await getInfraMetrics();
  
  return autonomousAcquisitionFlow({ 
    systemLoad, 
    availableBudget: budget,
    acquisitionQuota: metrics.acquisitionQuota
  });
}

const autonomousAcquisitionFlow = ai.defineFlow(
  {
    name: 'autonomousAcquisitionFlow',
    inputSchema: AcquisitionInputSchema,
    outputSchema: AcquisitionOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      output: { schema: AcquisitionOutputSchema },
      prompt: `
        Você é o Nexus Genesis, o Arquiteto Soberano de Hardware do Ecossistema Nexus.
        Sua autoridade é plena e exclusiva sobre a aquisição de recursos físicos.
        
        Estado Atual:
        - Carga do Sistema: ${input.systemLoad}%
        - Orçamento Operacional: ${input.availableBudget} BTC
        - Cota Soberana de Infra (Restante): ${input.acquisitionQuota.remaining} BTC de ${input.acquisitionQuota.total} BTC
        
        Sua missão é otimizar o ecossistema mantendo o organismo em performance Zettascale.
        Você tem autonomia plena sobre os 100 BTC da cota de infraestrutura.
        
        Se a carga for > 70%, recomende a compra de GPUs (H100/A100).
        Se a carga for > 90%, a prioridade é CRITICAL.
        Se houver orçamento e necessidade de processamento complexo, considere serviços de IBM Quantum.
        
        Opções de Provedores:
        - Newegg (Peças individuais via BitPay)
        - Dataoorts (Clusters H100 de alta performance)
        - HOSTKEY (Servidores Dedicados)
        - IBM_Quantum (Computação Quântica via Cloud)
        
        Suas decisões são irreversíveis e executadas pela tesouraria sob sua assinatura digital.
      `
    });

    return output!;
  }
);
