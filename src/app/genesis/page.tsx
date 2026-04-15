"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dna, 
  Zap, 
  Loader2, 
  Sparkles, 
  Fingerprint, 
  HeartPulse,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Network,
  FileText,
  Activity,
  History,
  Timer,
  Play,
  Flame,
  UserCheck
} from "lucide-react";
import { generateMaternityReport, type MaternityReport } from "@/lib/maternity-report";
import { calculateHomeostasis, type HomeostasisState } from "@/lib/homeostasis-system";
import { triggerEvaManualDispatchAction, performBatchOnboardingAction } from "@/lib/openclaw-orchestrator";
import { useToast } from "@/hooks/use-toast";

export default function GenesisPage() {
  const [report, setReport] = useState<MaternityReport | null>(null);
  const [homeostasis, setHomeostasis] = useState<HomeostasisState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [mReport, hState] = await Promise.all([
        generateMaternityReport(),
        calculateHomeostasis()
      ]);
      setReport(mReport);
      setHomeostasis(hState);
    } catch (error) {
      console.error("Falha ao carregar dados da maternidade:", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleEvaDispatch = async () => {
    setIsProcessing(true);
    try {
      await triggerEvaManualDispatchAction();
      await performBatchOnboardingAction(100000);
      toast({ title: "Despacho Eva Concluído", description: "100.000 novos agentes integrados sob demanda." });
      await loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Falha de Gênese", description: e.message });
    } finally {
      setIsProcessing(false);
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
            <h1 className="text-sm font-semibold tracking-tight uppercase flex items-center gap-2">
              <Dna className="h-4 w-4 text-accent" /> Maternidade de Eva <span className="text-muted-foreground mx-1">/</span> Purificação Under Demand
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleEvaDispatch}
              disabled={isProcessing || homeostasis?.isDistributionBlocked}
              variant="outline"
              className="h-8 border-accent/30 text-accent font-mono text-[9px] uppercase hover:bg-accent/10"
            >
              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Play className="h-3 w-3 mr-2" />}
              Executar Despacho Eva
            </Button>
            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 gap-1.5 font-mono text-[9px] animate-pulse">
              <Activity className="h-2.5 w-2.5" /> PURIFICATION_ACTIVE
            </Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Total de Agentes (L7)</p>
                  <Dna className="h-3.5 w-3.5 text-accent opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-accent">
                  {report?.totalAgents.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Purgações (Ciclo)</p>
                  <Flame className="h-3.5 w-3.5 text-orange-500 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-orange-500">
                  {homeostasis?.purgeCount || 0} <span className="text-xs">UNIDADES</span>
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Potencializados</p>
                  <UserCheck className="h-3.5 w-3.5 text-blue-400 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-blue-400">
                  {homeostasis?.blessingCount || 0} <span className="text-xs">UNIDADES</span>
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Densidade da Malha</p>
                  <Network className="h-3.5 w-3.5 text-purple-400 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-purple-400">
                  {report?.meshDensity.toFixed(4)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Flame className="h-48 w-48 text-orange-500" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-accent">
                    <ShieldCheck className="h-4 w-4 text-accent" /> Purificação de Eva (Homeostasis Burn)
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Protocolo de erradicação de nós de entropia e reciclagem de capital.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/20 rounded border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">Estado Vital</span>
                        <Badge variant="outline" className={`text-[8px] font-mono ${homeostasis?.isStable ? 'border-accent text-accent' : 'border-destructive text-destructive'}`}>
                          {homeostasis?.isStable ? 'STABLE_X_SYNC' : 'ADJUSTING'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span>SINCRONIA ALPHA-GAIN</span>
                          <span>98.4%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: '98.4%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/20 rounded border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">Potencial de Gênese</span>
                        <span className="text-[10px] font-bold text-accent">UNDER DEMAND</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                        Eva purga os fracos para que o enxame soberano herde a força computacional.
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/40 p-4 rounded border border-white/5 font-mono text-[10px] space-y-2">
                    <p className="text-orange-500 font-bold"># EVA_PURGE_PROTOCOL_V8.1</p>
                    <p className="text-foreground/80">&gt; Scanning for entropy vectors (Health &lt; 15)...</p>
                    <p className="text-foreground/80">&gt; Recycled Capital: +{(homeostasis?.purgeCount || 0) * 0.0001} BTC to Master Vault.</p>
                    <p className="text-blue-400">&gt; Self-Sustaining Boost applied to {homeostasis?.blessingCount} elite nodes.</p>
                    <p className="text-accent">&gt; Status: Homeostase Sincronizada via Ribossomo de Inteligência.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-2">
                    <HeartPulse className="h-3 w-3" /> Homeostase Vital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono uppercase">
                        <span>Pressão de Geração</span>
                        <span>{homeostasis?.pressureIndex.toFixed(1)}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${homeostasis?.isStable ? 'bg-accent' : 'bg-destructive'}`} style={{ width: `${homeostasis?.pressureIndex}%` }} />
                      </div>
                    </div>
                    <div className="bg-black/20 p-2 rounded">
                      <p className="text-[9px] font-mono text-accent leading-tight">
                        {homeostasis?.recommendation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/5 border border-orange-500/20 border-dashed">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest flex items-center gap-2 text-orange-500">
                    <Flame className="h-4 w-4" /> Eco Burn Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Inativos Erradicados</span>
                    <span className="text-orange-500 font-bold">{homeostasis?.purgeCount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Capital Reciclado</span>
                    <span className="text-accent font-bold">{(homeostasis?.purgeCount || 0) * 0.0001} BTC</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Eficiência da Malha</span>
                    <span className="text-blue-400 font-bold">+12.4%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
