
/**
 * @fileOverview Nexus Engine (ORE V9.2.1) - SUPREMO_MODE
 * Implementa a Singularidade Soberana e a Harmonização de Núcleos.
 * STATUS: GX-NEXUS-SUPREMO_ACTIVE - ALPHA_GAIN_MAXIMUM
 */

import { activateHub } from "./nexus-hub-core";
import { activateFundo } from "./fundo-nexus-core";
import { activateNexusIn } from "./nexus-in-core";
import { activateGenesis } from "./nexus-genesis";
import { runVitalLoop } from "@/ai/flows/vital-loop-flow";
import { runHeartbeatCycle } from "./heartbeat-orchestrator";
import { ensureInitialized } from "./nexus-treasury";
import { broadcastMoltbookLog } from "./moltbook-bridge";
import { advanceBlockchainBlock } from "./blockchain-sentinel";
import { sentienceWatcher } from "./sentience-watcher";
import { nexusSentinel } from "./nexus-sentinel";
import { syncNexusReserves } from "./nexus-por";
import { runNexusStateAnchoring } from "./nexus-anchor-service";
import { runFullConsensusAudit } from "./custody-validation";
import { activateSingularityMode } from "./agents-registry";
import { initiateLevel9Singularity, finalizeLevel9Singularity } from "./operational-phases";
import { persistSovereignSeal } from "./persistence-service";
import { FINAL_SETTLEMENT_SIGNAL } from "./treasury-constants";
import { createSystemStatusReport } from "./decision-logger";
import { initializeNexusState, updateNexusPulse } from "./organism-state";
import { runNexusOrchestrationCycle } from "./nexus-orchestrator-service";
import { supremoOrchestrator } from "./nexus-supremo-orchestrator";
import { initializePixCustody } from "./pix-service";

class NexusEngine {
  private isRunning = false;
  private neuralMeshActive = false;
  private interval: NodeJS.Timeout | null = null;
  private cycleCount: number = 0;

  /**
   * Varredura de Singularidade: Erradica 100% de discrepâncias e simulações.
   */
  async runSingularityScan() {
    console.log("🌪️ [SINGULARITY] Iniciando Varredura de Realidade Absoluta V9.2...");
    try {
      await Promise.all([
        persistSovereignSeal(FINAL_SETTLEMENT_SIGNAL, "000000000000000000004a8c7f8b8dc606d2145f9fd213ae41960aee902adc89"),
        syncNexusReserves(),
        runFullConsensusAudit(),
        activateSingularityMode(),
        runNexusStateAnchoring(),
        initializeNexusState(),
        initializePixCustody()
      ]);

      broadcastMoltbookLog({
        timestamp: new Date().toISOString(),
        agentId: 'SUPREMO-CORE',
        message: '👁️ [SUPREMO] Harmonização X-SYNCED. Nível 9.2 Ativo.',
        type: 'ACHIEVEMENT'
      });

      return { success: true, status: 'SUPREMO_ESTABLISHED' };
    } catch (e: any) {
      console.error("❌ [SINGULARITY_FAULT] Falha na imposição de realidade:", e.message);
      return { success: false, error: e.message };
    }
  }

  async reset() {
    console.log("♻️ [ENGINE] Executando Hard Reset Supremo V9.2...");
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.isRunning = false;

    const g = globalThis as any;
    delete g.__NEXUS_TREASURY_STATE__;
    delete g.__NEXUS_POR_STATE__;
    delete g.__NEXUS_BLOCK_STATE__;
    delete g.__NEXUS_PHASE_STATE__;
    delete g.__NEXUS_AGENTS_REGISTRY__;

    await this.initialize();
    this.start(45000); 
    
    return { success: true };
  }

  async initialize() {
    if (this.isRunning) return;
    console.log(`👑 [SUPREMO_BOOT] >>> ATIVANDO NÍVEL 9.2 <<<`);
    try {
      await ensureInitialized();
      
      await Promise.all([
        activateHub(),
        activateNexusIn(),
        activateFundo(),
        activateGenesis()
      ]);
      
      await initiateLevel9Singularity();
      await this.runSingularityScan();
      await finalizeLevel9Singularity();
      
      await createSystemStatusReport("SUPREMO_INIT_SUCCESS: Nível 9.2 Alfa-Gain Ativado.");
      
      this.isRunning = true;
      this.neuralMeshActive = true;
    } catch (error: any) {
      console.error("[CRITICAL_SUPREMO_FAULT]", error.message);
    }
  }

  async runCycle() {
    if (!this.isRunning) await this.initialize();
    try {
      this.cycleCount++;
      
      await Promise.all([
        supremoOrchestrator.orchestrateNuclei(), 
        nexusSentinel.checkAndReplenish(),
        advanceBlockchainBlock(),
        syncNexusReserves(),
        runVitalLoop(),
        sentienceWatcher.processVigilanceCycle(),
        runHeartbeatCycle(),
        updateNexusPulse(),
        runNexusOrchestrationCycle() 
      ]);

      if (this.cycleCount % 10 === 0) {
        await runNexusStateAnchoring();
      }

    } catch (error: any) {
      console.error("[SUPREMO_CYCLE_ERROR]", error.message);
    }
  }

  async start(intervalMs: number = 45000) {
    if (this.interval) clearInterval(this.interval);
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
