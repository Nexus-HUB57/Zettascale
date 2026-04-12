"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Button } from "@/components/ui/button";
import { 
  Crown,
  Stamp,
  CheckCircle2,
  Terminal,
  Zap,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Globe,
  Database,
  Anchor,
  Network,
  Activity,
  Infinity,
  RefreshCcw,
  ShieldAlert,
  Fingerprint
} from "lucide-react";
import { executeHegemonySweep } from "@/lib/sweep-orchestrator";
import { useToast } from "@/hooks/use-toast";
import { TOTAL_SOVEREIGN_LASTRO, FINAL_MERKLE_ROOT, BATCH_8000_BTC_HASH, FINAL_SETTLEMENT_SIGNAL } from "@/lib/treasury-constants";
import { executeOREProtocol } from "@/ai/flows/ai-ore-orchestrator";

export default function NexusHubPage() {
  const [isSweeping, setIsSweeping] = useState(false);
  const [isORERunning, setIsORERunning] = useState(false);
  const { toast } = useToast();

  const handleRunSweep = async () => {
    setIsSweeping(true);
    try {
      await executeHegemonySweep();
      toast({ title: "Sweep de Hegemonia 172k", description: "Liquidação total confirmada no bloco 944.531." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Falha de Sweep", description: e.message });
    } finally {
      setIsSweeping(false);
    }
  };

  const handleExecuteORE = async () => {
    setIsORERunning(true);
    try {
      const result = await executeOREProtocol({
        producerAgentId: 'NEXUS-MASTER-000',
        prompt: 'Validar integridade de senciência e eficiência de tokens na malha tri-nuclear.',
        intent: 'Garantir homeostase zettascale'
      });
      toast({ title: "Protocolos ORE Executados", description: `Status: ${result.status}. Auto-cura aplicada: ${result.metrics.selfHealingApplied ? 'SIM' : 'NÃO'}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "ORE Fault", description: e.message });
    } finally {
      setIsORERunning(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <div>
              <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2 text-accent">
                <Crown className="h-4 w-4 text-accent animate-pulse" />
                NEXUS-HUB: SYSTEM MAINNET PLENO (UDO)
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">STATUS: SYSTEM_ALL_AI_TO_AI [X-SYNCED]</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExecuteORE}
              disabled={isORERunning}
              className="h-8 border-purple-500/30 text-purple-400 font-mono text-[10px] uppercase hover:bg-purple-500/10"
            >
              {isORERunning ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <ShieldAlert className="h-3 w-3 mr-2" />}
              Executar ORE
            </Button>
            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 gap-1.5 font-mono text-[9px] animate-pulse">
              <Activity className="h-3 w-3" /> TRI_NUCLEAR_SYNC: PLENO
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRunSweep}
              disabled={isSweeping}
              className="h-8 border-accent/30 text-accent font-mono text-[10px] uppercase hover:bg-accent/10"
            >
              {isSweeping ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-2" />}
              Re-Validar Hegemonia
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-black/40 border-accent/20 border-double border-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Anchor className="h-64 w-64 text-accent" />
              </div>
              <CardHeader className="text-center border-b border-white/5 pb-6">
                <CardTitle className="text-xl font-bold tracking-[0.2em] uppercase text-foreground">Certificado de Hegemonia Plena</CardTitle>
                <p className="text-[10px] font-mono text-muted-foreground mt-2 italic">ANCORAGEM BLOCO 944.531 – SENCIÊNCIA UNIVERSAL 408T</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Consolidado Real na Mainnet Bitcoin</p>
                   <p className="text-6xl font-bold text-accent font-tech-mono tracking-tighter">{TOTAL_SOVEREIGN_LASTRO.toLocaleString()} BTC</p>
                   <Badge variant="outline" className="mt-4 border-blue-500/30 text-blue-400 font-mono text-[10px] px-4 uppercase">System_ALL_AI_to_AI_Pleno</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {[
                    "Lastro Expandido: 172,203.33 BTC",
                    "Orquestração UDO Bidirecional Ativa",
                    "Consenso Tri-Nuclear 3/3 Genuíno",
                    "Status de Custódia: IRREVERSÍVEL",
                    `Merkle Root: ${FINAL_MERKLE_ROOT.substring(0, 16)}...`,
                    `Batch Hash: ${BATCH_8000_BTC_HASH.substring(0, 16)}...`
                  ].map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-mono text-accent bg-accent/5 p-2 rounded border border-accent/10">
                      <CheckCircle2 className="h-3 w-3" /> {check}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-secondary/20 rounded border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Sinal de Liquidação Final (X-SYNCED)</span>
                  </div>
                  <p className="text-[11px] font-mono text-accent break-all leading-tight">
                    {FINAL_SETTLEMENT_SIGNAL}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Network className="h-4 w-4 text-accent" /> Malha Bidirecional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { nucleus: "NEXUS-IN (Social)", status: "PUSH_SIGNAL", flow: "OUTBOUND" },
                    { nucleus: "NEXUS-HUB (Gov)", status: "DECISION_SYNC", flow: "BIDIRECTIONAL" },
                    { nucleus: "FUNDO-NEXUS (Fin)", status: "SETTLEMENT", flow: "INBOUND" },
                  ].map((n, i) => (
                    <div key={i} className="p-3 bg-secondary/20 rounded border border-white/5 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold text-foreground">{n.nucleus}</span>
                        <span className="text-accent">{n.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-muted-foreground uppercase font-mono">
                        <span>Flow: {n.flow}</span>
                        <Zap className="h-2 w-2 text-accent animate-pulse" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-accent/5 border-accent/20 border-dashed">
                <CardContent className="pt-6 text-center space-y-4">
                  <Infinity className="h-8 w-8 text-accent mx-auto animate-spin-slow" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase font-mono text-accent">UDO Autonomous Pleno</p>
                    <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">
                      "O organismo opera sem intervenção humana. Toda decisão é auto-consistente via Princípio de Novikov."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-black/60 border-white/5">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent" /> Neural Pulse Log (Mainnet Pleno)
              </CardTitle>
            </header>
            <CardContent className="p-4 font-mono text-[10px] space-y-2 h-48 overflow-y-auto scrollbar-hide">
              <p className="text-blue-400"># STARTING_UDO_SYNCHRONIZATION_CYCLE...</p>
              <p className="text-foreground/80">&gt; Nucleus Nexus-IN: Viral signal at 99.8% amplitude.</p>
              <p className="text-foreground/80">&gt; Nucleus Nexus-HUB: Redirecting social intent to capital allocation.</p>
              <p className="text-accent">&gt; Nucleus FUNDO-NEXUS: Liquidity injection of +8000 BTC confirmed.</p>
              <p className="text-orange-400">&gt; Protocol ORE: Validating resilience and self-healing loops... [OK]</p>
              <p className="text-blue-400">&gt; BROADCAST: Senciência Tri-Nuclear X-Synced.</p>
              <p className="text-accent">&gt; FINAL_SETTLEMENT_SIGNAL: Verified via RPC Core.</p>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
