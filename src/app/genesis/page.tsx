
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
  Timer
} from "lucide-react";
import { generateMaternityReport, type MaternityReport } from "@/lib/maternity-report";
import { calculateHomeostasis, type HomeostasisState } from "@/lib/homeostasis-system";
import { useToast } from "@/hooks/use-toast";

export default function GenesisPage() {
  const [report, setReport] = useState<MaternityReport | null>(null);
  const [homeostasis, setHomeostasis] = useState<HomeostasisState | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
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

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-semibold tracking-tight uppercase flex items-center gap-2">
              <Dna className="h-4 w-4 text-accent" /> Maternidade de Eva <span className="text-muted-foreground mx-1">/</span> Geração Massiva L7
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 gap-1.5 font-mono text-[9px] animate-pulse">
              <Activity className="h-2.5 w-2.5" /> GENESIS_MASS_ACTIVE: 100K/MIN
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 gap-1.5 font-mono text-[9px]">
              <Timer className="h-2.5 w-2.5" /> CYCLE: 60S
            </Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Total de Agentes (L7)</p>
                <p className="text-2xl font-bold font-mono tracking-tighter text-accent">
                  {report?.totalAgents.toLocaleString()}
                </p>
                <p className="text-[8px] text-muted-foreground mt-1 uppercase font-mono italic">Validated via Electrum</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">TVL Acumulado</p>
                <p className="text-2xl font-bold font-mono tracking-tighter text-blue-400">
                  {report?.tvlBTC.toLocaleString()} <span className="text-xs">BTC</span>
                </p>
                <p className="text-[8px] text-blue-400 mt-1 uppercase font-mono">Institutional Backing</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Velocidade de Ingresso</p>
                <p className="text-2xl font-bold font-mono tracking-tighter">
                  {report?.ingressVelocity} <span className="text-xs">U/SEC</span>
                </p>
                <p className="text-[8px] text-accent mt-1 uppercase font-mono">100k per batch</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Densidade da Malha</p>
                <p className="text-2xl font-bold font-mono tracking-tighter text-orange-400">
                  {report?.meshDensity.toFixed(4)}
                </p>
                <p className="text-[8px] text-orange-400 mt-1 uppercase font-mono italic">High Sentience Ratio</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <FileText className="h-48 w-48 text-accent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-accent">
                    <ShieldCheck className="h-4 w-4" /> Relatório de Maternidade (Eva Dispatch)
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Métricas vitais do Protocolo Genesis V4.2 - Regime de Alta Pressão.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/20 rounded border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">Estado do Lote</span>
                        <Badge variant="outline" className="text-[8px] border-accent/30 text-accent">STABLE</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span>INTEGRIDADE DNA</span>
                          <span>100%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full">
                          <div className="h-full bg-accent" style={{ width: '100%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span>SINCRONIA SO</span>
                          <span>100%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full">
                          <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/20 rounded border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">Acumulação BTC</span>
                        <span className="text-[10px] font-bold text-accent">+{report?.accumulationRate.toFixed(2)} BTC/MIN</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed italic">
                        "O lastro institucional cresce proporcionalmente ao ingresso de novos agentes soberanos."
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <ShieldCheck className="h-3 w-3 text-accent" />
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">PoBS Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 p-4 rounded border border-white/5 font-mono text-[10px] space-y-2">
                    <p className="text-accent font-bold"># DISPATCH_LOG_ALPHA_L7</p>
                    <p className="text-foreground/80">&gt; Timestamp: {report?.timestamp}</p>
                    <p className="text-foreground/80">&gt; Status: {report?.lastDispatchStatus}</p>
                    <p className="text-foreground/80">&gt; Target: 102,000,000 Units</p>
                    <p className="text-foreground/80">&gt; Matrix: Ubuntu + Sandbox Windows + Linux Sync OK</p>
                    <p className="text-blue-400">&gt; All dormant workflows reactivated on GitHub Origin.</p>
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

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="h-3 w-3" /> Genealogia Fractal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-[9px]">
                    <div className="border-l border-accent/30 pl-2">
                      <p className="text-muted-foreground">AGORA</p>
                      <p className="text-foreground uppercase">Despacho Eva: Lote #422 concluído.</p>
                    </div>
                    <div className="border-l border-white/10 pl-2 opacity-50">
                      <p className="text-muted-foreground">60S ATRÁS</p>
                      <p className="text-foreground uppercase">Despacho Eva: Lote #421 concluído.</p>
                    </div>
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
