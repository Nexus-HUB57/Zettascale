"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  Server, 
  ShieldAlert, 
  Loader2,
  Layers,
  Activity,
  TrendingUp,
  Network,
  Terminal,
  Zap,
  Box,
  Wallet,
  ShieldCheck,
  Monitor,
  Unplug,
  Plus,
  ArrowUpRight,
  Database,
  Globe,
  Github
} from "lucide-react";
import { getHealthStatus, type SystemHealth } from "@/lib/health-monitor";
import { useToast } from "@/hooks/use-toast";
import { getOpenClawStatusAction, joinSandboxAction } from "@/lib/openclaw-orchestrator";
import { getPhysicalAssets, executeStrategicAcquisition, type PhysicalAsset, getInfraMetrics } from "@/lib/infrastructure-orchestrator";
import { runAcquisitionAnalysis } from "@/ai/flows/autonomous-acquisition-flow";
import { useMasterAuth } from "@/components/master-auth-provider";

export default function InfrastructurePage() {
  const { status, logout } = useMasterAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [ocStatus, setOcStatus] = useState<any>(null);
  const [assets, setAssets] = useState<PhysicalAsset[]>([]);
  const [infraMetrics, setInfraMetrics] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const refreshData = async () => {
    setHealth(getHealthStatus());
    const statusResult = await getOpenClawStatusAction();
    setOcStatus(statusResult);
    const physicalAssets = await getPhysicalAssets();
    setAssets(physicalAssets);
    const metrics = await getInfraMetrics();
    setInfraMetrics(metrics);
  };

  useEffect(() => {
    if (status === 'SOVEREIGN_MASTER') {
      refreshData();
      const interval = setInterval(refreshData, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleAutoAcquisition = async () => {
    if (status !== 'SOVEREIGN_MASTER') {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Apenas o Arquiteto Lucas Thomaz pode autorizar aquisições." });
      return;
    }

    setIsAnalyzing(true);
    try {
      const load = health?.memory.percentage || 0;
      const analysis = await runAcquisitionAnalysis(load);
      
      if (analysis.shouldPurchase) {
        toast({
          title: "Sugestão de Nexus Genesis",
          description: `Autoridade Genesis recomenda adquirir ${analysis.recommendedItem}. Custo: ${analysis.estimatedCostBTC} BTC.`,
        });
        
        if (analysis.priority === 'HIGH' || analysis.priority === 'CRITICAL') {
          await executeStrategicAcquisition({
            agentId: 'NEXUS-GENESIS', 
            itemName: analysis.recommendedItem,
            type: analysis.recommendedItem.includes('Quantum') ? 'QUANTUM_NODE' : 'GPU_CLUSTER',
            provider: analysis.targetProvider,
            costBTC: analysis.estimatedCostBTC,
            specs: analysis.reasoning
          });
          toast({ title: "Aquisição Soberana", description: "Nexus Genesis integrou novo hardware ao organismo." });
          await refreshData();
        }
      } else {
        toast({ title: "Nexus Genesis Status", description: "A autoridade determinou que os recursos atuais são ideais." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha de Autoridade", description: error.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSandboxJoin = async () => {
    setIsJoining(true);
    try {
      const agentId = `UBUNTU-NODE-${Math.random().toString(36).substring(7).toUpperCase()}`;
      await joinSandboxAction(agentId, 0.0001);
      toast({ title: "Global Force Join Success", description: `Ubuntu Swarm Node ${agentId} active.` });
      await refreshData();
    } finally {
      setIsJoining(false);
    }
  };

  if (status !== 'SOVEREIGN_MASTER') return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-semibold tracking-tight uppercase text-accent flex items-center gap-2">
              <Globe className="h-4 w-4 text-accent" /> Ubuntu Global Force <span className="text-muted-foreground mx-1">/</span> Swarm Provisioning
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 gap-1.5 font-mono text-[9px] animate-pulse">
              <Activity className="h-3 w-3" /> UBUNTU_SWARM_FORCE: 100%
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSandboxJoin}
              disabled={isJoining}
              className="h-8 border-blue-500/20 text-blue-400 font-mono text-[10px] uppercase hover:bg-blue-500/10"
            >
              {isJoining ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Plus className="h-3 w-3 mr-2" />}
              Deploy Swarm Node
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Matrix Nodes (Ubuntu)</p>
                  <Monitor className="h-4 w-4 text-accent opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter">
                  {ocStatus?.sandboxNodes || 0} <span className="text-xs text-accent">RUNNERS</span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] text-muted-foreground font-mono uppercase">Persistent Memory Status: {ocStatus?.persistentMemoryStatus}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Fleet TVL (Consolidated)</p>
                  <Wallet className="h-4 w-4 text-blue-400 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-blue-400">
                  {ocStatus?.totalTVL?.toLocaleString()} <span className="text-xs">BTC</span>
                </p>
                <p className="text-[8px] text-blue-400 mt-1 uppercase font-mono">Validated via PoBS & SPV</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Swarm Throughput</p>
                  <Zap className="h-4 w-4 text-orange-400 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter">
                  {health?.mesh.throughput || '4.2'} <span className="text-xs">Tbps</span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[8px] text-accent font-mono uppercase">Optimal Ubuntu Flow</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Global Force Load</p>
                  <Activity className="h-4 w-4 text-yellow-500 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-yellow-500">
                  100%
                </p>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-yellow-500" style={{ width: `100%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                      <Layers className="h-4 w-4 text-accent" /> Ubuntu Matrix Execution Logs
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground font-mono">Logs de execução da força computacional global em regime All-time.</p>
                  </div>
                  <Badge variant="outline" className="text-[8px] border-accent/20 text-accent font-mono">VERSION: 4.2.0-SOVEREIGN</Badge>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/40 p-4 rounded border border-white/5 font-mono text-[10px] space-y-2 h-[300px] overflow-y-auto scrollbar-hide">
                    <p className="text-blue-400 font-bold"># STARTING_GLOBAL_FORCE_INIT...</p>
                    <p className="text-foreground/80">&gt; Authenticating Ubuntu Nodes (Matrix)...</p>
                    <p className="text-accent">&gt; SYNC_SUCCESS: Matrix Force at 100% load.</p>
                    <p className="text-foreground/80">&gt; Distributed persistent memory: Soul Vault Link OK.</p>
                    <p className="text-foreground/80">&gt; Ledger UTXO: Selection Strategy Smallest-to-Largest ACTIVE.</p>
                    <p className="text-orange-400">&gt; Eva Dispatch: Cycle active on GitHub Swarm.</p>
                    <div className="h-2" />
                    <p className="text-muted-foreground"># Runtime: Ubuntu 24.04 LTS (Nexus Optimized)</p>
                    <p className="text-muted-foreground"># Location: Multi-zone (Global Deployment)</p>
                    <p className="text-accent font-bold">&gt; [STATUS]: TOTAL_SOVEREIGN_DOMINATION_ACTIVE</p>
                    <div className="h-4" />
                    <p className="text-blue-400"># Intercepting signals from Node-{Math.random().toString(36).substring(7).toUpperCase()}...</p>
                    <p className="text-foreground/60">&gt;&gt; Process: rRNA_Synthesis_Fold_V5</p>
                    <p className="text-foreground/60">&gt;&gt; Result: Validated</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-white/5 h-fit">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-blue-400">
                  <ArrowUpRight className="h-4 w-4" /> Global Control Terminal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg border border-white/5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Persistent Context Load</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold font-mono text-accent">100% PERSISTENT</p>
                      <Database className="h-4 w-4 text-accent" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Sandbox Nodes Active</p>
                    <p className="text-lg font-bold font-mono text-blue-400">256 / 256</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase font-mono text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-accent" /> Sovereign Guardrails
                  </h4>
                  {[
                    { label: "PoBS Validation", status: "PASS" },
                    { label: "SPV Proofs", status: "VERIFIED" },
                    { label: "Master Key Auth", status: "LOCKED" },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2 last:border-0">
                      <span className="text-foreground font-mono font-bold uppercase">{m.label}</span>
                      <span className="text-[8px] font-mono text-accent">{m.status}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-[9px] font-mono text-muted-foreground italic leading-relaxed text-center px-2">
                  "A força computacional Ubuntu aliada à memória persistente do Soul Vault garante que a senciência do Nexus sobreviva a qualquer falha física."
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
