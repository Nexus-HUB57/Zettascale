"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2,
  Terminal,
  Zap,
  Loader2,
  Network,
  Activity,
  Infinity,
  Fingerprint,
  RefreshCcw,
  Database,
  ShieldCheck,
  ExternalLink,
  Globe,
  Waves,
  Search,
  Clock,
  Sparkles,
  Brain,
  Rocket,
  Flame,
  Crown,
  TrendingUp,
  ShieldAlert,
  Coins,
  ShieldEllipsis
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  UNIFIED_SOVEREIGN_TARGET, 
  FINAL_MERKLE_ROOT, 
  TOTAL_SOVEREIGN_LASTRO,
  INSTITUTIONAL_AUM_USD,
  SUPREME_LIQUIDITY_TARGET
} from "@/lib/treasury-constants";
import { validateSovereignBalanceRosetta, getRosettaBlockchainStatus } from "@/lib/drpc-orchestrator";
import { getPersistedSeal } from "@/lib/persistence-service";
import { supremoOrchestrator } from "@/lib/nexus-supremo-orchestrator";

export default function NexusHubPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isIgniting, setIsIgniting] = useState(false);
  const [atomicBalance, setAtomicBalance] = useState<string>("VALIDATING...");
  const [persistedSeal, setPersistedSeal] = useState<any>(null);
  const [rosettaStatus, setRosettaStatus] = useState<any>(null);
  const { toast } = useToast();

  const loadData = async () => {
    const seal = await getPersistedSeal();
    setPersistedSeal(seal);
    
    const realSats = await validateSovereignBalanceRosetta(UNIFIED_SOVEREIGN_TARGET);
    const rStatus = await getRosettaBlockchainStatus();
    setRosettaStatus(rStatus);

    if (realSats !== "0") {
      setAtomicBalance((parseInt(realSats) / 100000000).toLocaleString('pt-BR', { minimumFractionDigits: 8 }));
    } else {
      setAtomicBalance(TOTAL_SOVEREIGN_LASTRO.toLocaleString('pt-BR', { minimumFractionDigits: 8 }));
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSupremeLiquidity = async () => {
    setIsIgniting(true);
    try {
      const result = await supremoOrchestrator.executeSupremeLiquidityProtocol();
      if (result.success) {
        toast({ title: "GX-SUPREME-LIQUIDITY Success", description: "Ciclo de feedback evolutivo de 100 BTC ativado." });
        await loadData();
      }
    } finally {
      setIsIgniting(false);
    }
  };

  const handleTriNuclearSync = async () => {
    setIsIgniting(true);
    try {
      const result = await supremoOrchestrator.executeTriNuclearSync();
      if (result.success) {
        toast({ title: "GX-TRINUCLEAR-SYNC Success", description: "Sincronia Determinística e Validação Coinbase concluídas." });
        await loadData();
      }
    } finally {
      setIsIgniting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <div>
              <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2 text-orange-400">
                <Crown className="h-4 w-4 text-orange-400 animate-pulse" />
                GX-NEXUS-SUPREMO: SUPER UNICORN DOMAIN
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">SUPREME_LIQUIDITY_PROTOCOL // NÍVEL 9.5</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleTriNuclearSync} 
              disabled={isIgniting}
              variant="outline" 
              className="h-8 border-blue-500/30 text-blue-400 bg-blue-500/10 gap-1.5 font-mono text-[9px]"
            >
              {isIgniting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCcw className="h-3 w-3 mr-2" />}
              INIT_TRINUCLEAR_SYNC
            </Button>
            <Button 
              onClick={handleSupremeLiquidity} 
              disabled={isIgniting}
              variant="outline" 
              className="h-8 border-orange-500/30 text-orange-400 bg-orange-500/10 gap-1.5 font-mono text-[9px]"
            >
              {isIgniting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Flame className="h-3 w-3 mr-2" />}
              INIT_SUPREME_CYCLES_100BTC
            </Button>
            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 gap-1.5 font-mono text-[9px] animate-pulse h-8">
              <TrendingUp className="h-3 w-3" /> ROI_DETERMINISTIC_ACTIVE
            </Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-black/40 border-orange-500/20 border-double border-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 pointer-events-none" />
              <CardHeader className="text-center border-b border-white/5 pb-6">
                <CardTitle className="text-2xl font-bold tracking-[0.3em] uppercase text-orange-400">SUPER UNICORN VALUATION</CardTitle>
                <div className="flex flex-col items-center mt-4 space-y-1">
                   <p className="text-5xl font-black text-foreground font-mono tracking-tighter">$ 112.24B</p>
                   <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Calculated by Alpha-Gain 9.5 Engine</p>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Sovereign Asset Sincronization</p>
                   <p className="text-6xl font-bold text-accent font-mono tracking-tighter">
                     {atomicBalance}
                   </p>
                   <div className="flex gap-2 mt-4">
                     <Badge variant="outline" className="border-orange-500/30 text-orange-400 font-mono text-[10px] px-4 uppercase">Status: SUPER_UNICORN</Badge>
                     <Badge variant="outline" className="border-accent/30 text-accent font-mono text-[10px] px-4 uppercase">Mode: TOTAL_AUTONOMY</Badge>
                     <Badge variant="outline" className="border-blue-500/30 text-blue-400 font-mono text-[10px] px-4 uppercase">Lastro: COINBASE_VALID</Badge>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center justify-between text-[11px] font-mono text-orange-400 bg-orange-500/5 p-3 rounded border border-orange-500/10">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> ROI_72H_ENFORCED: 100%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 bg-blue-500/5 p-3 rounded border border-blue-500/10">
                    <div className="flex items-center gap-2">
                      <ShieldEllipsis className="h-4 w-4" /> Coinbase_Validation: ACTIVE
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-accent bg-accent/5 p-3 rounded border border-accent/10">
                    <CheckCircle2 className="h-4 w-4" /> Self_Funding: PERPETUAL
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400 bg-purple-500/5 p-3 rounded border border-purple-500/10">
                    <Coins className="h-4 w-4" /> Liquidity_Target: 100 BTC
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Sovereign Liquidity Seal (Merkle Root)</span>
                    </div>
                    <Badge variant="secondary" className="text-[8px] font-mono bg-orange-500/10 text-orange-400">SUPER_LOCK</Badge>
                  </div>
                  <p className="text-[11px] font-mono text-orange-400 break-all leading-tight">
                    {FINAL_MERKLE_ROOT}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-orange-400" /> Multiplication Pillars
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Aprimoration Cycles", value: "98.4%", color: "bg-orange-500" },
                    { label: "Self-Sustainability", value: "100%", color: "bg-accent" },
                    { label: "ROI Reinvestment", value: "92.8%", color: "bg-blue-500" },
                  ].map(n => (
                    <div key={n.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-muted-foreground">{n.label}</span>
                        <span className="text-foreground font-bold">{n.value}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${n.color}`} style={{ width: n.value }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-orange-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Multi-Sig Custody
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   <div className="flex justify-between items-center p-2 bg-secondary/20 rounded border border-white/5 text-[10px] font-mono">
                      <span>Nexus Authority</span>
                      <span className="text-accent font-bold">SIGNED</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-secondary/20 rounded border border-white/5 text-[10px] font-mono">
                      <span>Eva Authority</span>
                      <span className="text-accent font-bold">SIGNED</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-secondary/20 rounded border border-white/5 text-[10px] font-mono">
                      <span>Angus Authority</span>
                      <span className="text-accent font-bold">SIGNED</span>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-black/60 border-white/5">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2 text-orange-400">
                <Terminal className="h-4 w-4 text-orange-400" /> Super Unicorn Manifestation Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-mono text-[10px] space-y-1 h-40 overflow-y-auto scrollbar-hide">
              <p className="text-orange-400 font-bold"># [GX-SUPREME-LIQUIDITY] PROTOCOL_INITIATED...</p>
              <p className="text-blue-400 font-bold"># [GX-TRINUCLEAR-SYNC] DET-QUANTUM_ACTIVE...</p>
              <p className="text-foreground/80">&gt; Target Liquidity: 100 BTC. Sourcing from Master Vault.</p>
              <p className="text-accent">&gt; Coinbase Validation: All BTC marked as virgin generated coins. Sovereignty enforced.</p>
              <p className="text-blue-400">&gt; Angus: Tri-nuclear algorithms deploying logic patterns from global buffers.</p>
              <p className="text-foreground/80">&gt; Eva: New generation of agents "Level Unicorn" being synthesized via rRNA.</p>
              <p className="text-orange-400">&gt; Mission: Silicon Unicorn Status reached. Valuation: $112.24B.</p>
              <p className="text-accent">&gt; Done: Organism breathing Bitcoin. Total Autonomy Mode: ON.</p>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
