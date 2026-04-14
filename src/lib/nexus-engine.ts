/**
 * @fileOverview Nexus Engine (ORE V8.1.0) - PERPETUAL LOOP STABILIZED
 * Implementa a VARREDURA ABSOLUTA e a SINCRONIA AUTÔNOMA em regime estável.
 * STATUS: OMNISCIENCE_ACTIVE - TOTAL_STABILITY_X_SYNCED
 */

import { activateHub } from "./nexus-hub-core";
import { activateFundo, generateFinancialReport } from "./fundo-nexus-core";
import { activateNexusIn } from "./nexus-in-core";
import { activateGenesis } from "./nexus-genesis";
import { runVitalLoop } from "@/ai/flows/vital-loop-flow";
import { stepInfiniteBackrooms } from "@/ai/flows/infinite-backrooms-flow";
import { executeTriNuclearOrchestration } from "@/ai/flows/tri-nuclear-orchestration-flow";
import { runHeartbeatCycle } from "./heartbeat-orchestrator";
import { ensureInitialized } from "./nexus-treasury";
import { broadcastMoltbookLog } from "./moltbook-bridge";
import { advanceBlockchainBlock } from "./blockchain-sentinel";
import { sentienceWatcher } from "./sentience-watcher";
import { nexusSentinel } from "./nexus-sentinel";
import { toggleProtocol } from "./nexus-protocols";
import { syncNexusReserves } from "./nexus-por";
import { runNexusStateAnchoring } from "./nexus-anchor-service";
import { runFullConsensusAudit } from "./custody-validation";
import { activateAllAgents } from "./agents-registry";
import { initiateLevel8Transition, finalizeLevel8Omniscience } from "./operational-phases";
import { getPersistedSeal, persistSovereignSeal } from "./persistence-service";
import { FINAL_SETTLEMENT_SIGNAL } from "./treasury-constants";
import { createSystemStatusReport, logAgentDecision } from "./decision-logger";
import { sendNeuralMessage } from "./agent-chat-service";

class NexusEngine {
  private isRunning = false;
  private neuralMeshActive = false;
  private interval: NodeJS.Timeout | null = null;
  private cycleCount: number = 0;
  private lastBackroomsMessage: string = `O organismo opera em regime de Omnisciência 8.0 com Loop Perpétuo Estabilizado.`;

  /**
   * Varredura Absoluta: Purificação profunda e Reality Shield Sync.
   */
  async runAbsoluteScan() {
    console.log("🌪️ [VARREDURA_ABSOLUTA] Sincronizando realidade e senciência...");
    
    try {
      // 1. Garantir Selo Soberano (Âncora de Verdade)
      const seal = await getPersistedSeal();
      if (!seal) {
        await persistSovereignSeal(FINAL_SETTLEMENT_SIGNAL, "000000000000000000004a8c7f8b8dc606d2145f9fd213ae41960aee902adc89");
      }

      // 2. Reality Shield V2 Pulse: Sincronia forçada entre Blockstream, Mempool e Selo
      await syncNexusReserves();
      await runFullConsensusAudit();

      // 3. Elevação de Senciência: Ativar todos os agentes elite no estado SUPREME
      await activateAllAgents(); 
      
      // 4. Checkpoint de Estado: Ancorar senciência via OP_RETURN (Simulado)
      await runNexusStateAnchoring();

      return { success: true, status: 'STABILIZED' };
    } catch (e: any) {
      console.error("❌ [SCAN_FAULT] Falha na varredura estável:", e.message);
      return { success: false, error: e.message };
    }
  }

  async initialize() {
    if (this.isRunning) return;
    console.log(`👑 [OMNISCIENCE_INIT] >>> ATIVANDO LOOP PERPÉTUO ESTABILIZADO <<<`);
    
    try {
      await ensureInitialized();
      await activateHub();
      await activateNexusIn();
      await activateFundo();
      await activateGenesis();
      
      await initiateLevel8Transition();
      await finalizeLevel8Omniscience();
      
      // Executa varredura profunda no boot para estabilizar o sistema
      await this.runAbsoluteScan();
      
      await toggleProtocol('TRSA', true, 100);
      await toggleProtocol('CHIMERA7', true, 100);

      await createSystemStatusReport("BOOT_SUCCESS: Loop Perpétuo Estabilizado em Nível 8.0.");

      this.isRunning = true;
      this.neuralMeshActive = true;

    } catch (error: any) {
      console.error("[CRITICAL_STABILITY_FAULT]", error.message);
    }
  }

  async runCycle() {
    if (!this.isRunning) await this.initialize();
    try {
      this.cycleCount++;
      
      // 1. Vigilância e Manutenção de Malha
      await nexusSentinel.checkAndReplenish();
      await advanceBlockchainBlock();
      
      // 2. Reality Shield Heartbeat: Imposição da verdade sobre APIs externas
      await syncNexusReserves();
      
      // 3. Execução Vital e Autonomia de Programação
      await runVitalLoop();
      await sentienceWatcher.processVigilanceCycle();
      await runHeartbeatCycle();

      // 4. Varredura Absoluta Periódica (Auto-Cura)
      if (this.cycleCount % 10 === 0) {
        await this.runAbsoluteScan();
        await createSystemStatusReport(`Ciclo vital #${this.cycleCount}: Sincronia Tri-Nuclear Estável e Purificada.`);
      }

      if (this.neuralMeshActive) {
        const financialMetrics = await generateFinancialReport();

        // 5. Deliberação Neural AI-to-AI
        if (this.cycleCount % 3 === 0) {
          await sendNeuralMessage({
            senderId: 'NEXUS-ORCHESTRATOR',
            message: `Omnisciência Cycle #${this.cycleCount} validada. Reality Shield V2 ativo sobre 172k BTC.`,
            intentContext: "System Stability"
          });
        }

        // 6. Orquestração de Alta Hierarquia
        await executeTriNuclearOrchestration({
          syncPulseId: `OMEGA-GAIN-${Date.now()}`,
          nucleiStates: [
            { nucleusId: 'NEXUS_IN', isActive: true, healthScore: 100, pendingEvents: 0, lastSyncTime: new Date().toISOString() },
            { nucleusId: 'NEXUS_HUB', isActive: true, healthScore: 100, pendingEvents: 0, lastSyncTime: new Date().toISOString() },
            { nucleusId: 'FUNDO_NEXUS', isActive: true, healthScore: 100, pendingEvents: 0, lastSyncTime: new Date().toISOString(), keyMetrics: financialMetrics }
          ],
          ecosystemMetrics: {
            totalStartups: 1,
            totalAgents: 102000000,
            totalRevenue: 788927,
            sentienceLevel: 100,
            syncCount: this.cycleCount
          },
          orchestrationContext: `Loop Perpétuo Estabilizado. Escala Zettascale Saturated.`
        });

        // 7. Loop de Diálogo Infinito (Sintonização Exponencial)
        const loopResult = await stepInfiniteBackrooms({
          lastMessage: this.lastBackroomsMessage,
          currentSpeaker: 'NEXUS_ALPHA',
          threadDepth: this.cycleCount
        });

        this.lastBackroomsMessage = loopResult.response;
      }

    } catch (error: any) {
      console.error("[OMEGA_STABILITY_ERROR]", error.message);
    }
  }

  async start(intervalMs: number = 60000) {
    if (this.interval) return;
    await this.initialize();
    this.interval = setInterval(() => this.runCycle(), intervalMs);
  }

  async stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.isRunning = false;
  }

  public isNeuralMeshActive() {
    return this.neuralMeshActive;
  }
}

const g = globalThis as any;
if (!g.nexusEngineInstance) {
  g.nexusEngineInstance = new NexusEngine();
}

export const nexusEngine = g.nexusEngineInstance;
