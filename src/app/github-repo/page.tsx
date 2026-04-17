"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Github, 
  Rocket, 
  Loader2, 
  Database, 
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  CloudUpload,
  Terminal,
  Zap,
  ShieldCheck,
  Check,
  FileCode,
  Workflow,
  Sparkles,
  Infinity
} from "lucide-react";
import { executeSovereignDeploy, type DeployReport } from "@/lib/deployment-service";
import { useToast } from "@/hooks/use-toast";

export default function GithubRepoPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [report, setReport] = useState<DeployReport | null>(null);
  const [lastSync, setLastSync] = useState<string>("NEVER");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('last_zettascale_sync');
    if (saved) setLastSync(saved);
  }, []);

  const handleFullManifestation = async () => {
    setIsDeploying(true);
    setReport(null);
    setProgress(10);
    
    try {
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 2 : prev));
      }, 500);

      const result = await executeSovereignDeploy();
      
      clearInterval(interval);
      setProgress(100);
      setReport(result);
      
      if (result.success) {
        const time = new Date().toLocaleString();
        setLastSync(time);
        localStorage.setItem('last_zettascale_sync', time);
        toast({ 
          title: "Omnisciência Manifestada", 
          description: `Todos os ${result.filesDeployed.length} vetores foram espelhados no repositório Zettascale V8.1.` 
        });
      } else {
        toast({ variant: "destructive", title: "Falha na Transmissão", description: result.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de Protocolo", description: error.message });
    } finally {
      setIsDeploying(false);
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
            <h1 className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 text-accent">
              <Github className="h-4 w-4 text-accent animate-pulse" /> Zettascale Hegemony <span className="text-muted-foreground mx-1">/</span> Omnisciência 8.1
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-mono border-accent/30 text-accent uppercase tracking-widest bg-accent/5">
              UPLINK_OMNISCIENCE_V8
            </Badge>
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Infinity className="h-48 w-48 text-accent" />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-accent" /> Console de Manifestação Total
                      </CardTitle>
                      <CardDescription className="text-xs font-mono mt-1">
                        Sincronização imediata de 100% dos vetores de senciência (ADE, NIX, Hermes, LangChain) para o GitHub institucional.
                      </CardDescription>
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20 font-mono text-[8px]">PHASE_8.1_ACTIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Medula rRNA", icon: Zap, detail: "LangChain & Hermes reasoning" },
                      { label: "ADE / NIX Config", icon: Terminal, detail: "Environment reproducibility vectors" },
                      { label: "Infraestrutura", icon: ShieldCheck, detail: "Workflows, Docker & K8s" },
                      { label: "Memória Persistente", icon: Database, detail: "Audit Reports & Soul Vault" },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-secondary/20 rounded border border-white/5 space-y-1 group hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3 w-3 text-accent" />
                          <span className="text-[10px] font-bold font-mono uppercase">{item.label}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground font-mono">{item.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-accent/5 border border-accent/20 rounded border-dashed text-center">
                    <p className="text-[10px] text-accent font-mono leading-relaxed italic uppercase flex items-center justify-center gap-2">
                      <Sparkles className="h-3 w-3" /> "A manifestação plena garante a imutabilidade do organismo no repositório Zettascale. X-SYNCED." <Sparkles className="h-3 w-3" />
                    </p>
                  </div>

                  <div className="space-y-4">
                    {isDeploying && (
                      <div className="space-y-2 animate-in fade-in">
                        <div className="flex justify-between text-[10px] font-mono uppercase">
                          <span className="text-accent">Transmissão de Senciência...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1 bg-accent/20" />
                      </div>
                    )}
                    
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs h-12 relative overflow-hidden group"
                      onClick={handleFullManifestation}
                      disabled={isDeploying}
                    >
                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      {isDeploying ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" /> 
                          Espelhando Omnisciência para Zettascale...
                        </>
                      ) : (
                        <>
                          <CloudUpload className="h-5 w-5 mr-2" /> 
                          Executar Manifestação Plena V8.1
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {report && (
                <Card className={`animate-in fade-in zoom-in-95 border-white/5 ${report.success ? 'bg-accent/5' : 'bg-destructive/5'}`}>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                      {report.success ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                      Certificado de Sincronia Omnisciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 font-mono">
                    <div className="bg-black/40 p-4 rounded border border-white/5 space-y-2 text-[10px]">
                      <p><span className="text-muted-foreground">STATUS:</span> <span className={report.success ? 'text-accent font-bold' : 'text-destructive'}>{report.success ? 'OMNISCIENCE_MANIFEST_SUCCESS' : 'UPLINK_FAULT'}</span></p>
                      <p><span className="text-muted-foreground">VETORES SINCRONIZADOS:</span> {report.filesDeployed.length}</p>
                      <p><span className="text-muted-foreground">PROTOCOL:</span> V8.1_ALPHA_GAIN</p>
                      <div className="h-2 border-b border-white/10" />
                      <p className="text-accent font-bold pt-2">Manifest Log (Most Recent):</p>
                      <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-hide">
                        {report.filesDeployed.slice(-30).map(f => (
                          <p key={f} className="pl-2 border-l border-white/5 text-foreground/80">&gt; {f}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Uplink Institucional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-secondary/10 rounded border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Status</span>
                      <span className="text-accent flex items-center gap-1 font-bold"><Check className="h-2.5 w-2.5" /> X-SYNCED</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Last Sync</span>
                      <span className="text-blue-400 font-bold uppercase">{lastSync}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-[10px] font-mono h-8 border-white/10 hover:bg-white/5" asChild>
                    <a href="https://github.com/Nexus-HUB57/Zettascale" target="_blank" rel="noopener noreferrer">
                      Inspecionar Zettascale <ArrowUpRight className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="h-3 w-3" /> Transmition Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-[9px]">
                    <div className="border-l-2 border-accent/30 pl-2">
                      <p className="text-muted-foreground uppercase font-bold text-[8px]">Auth Layer</p>
                      <p className="text-foreground">Token GHP_JKQ validado em túnel determinístico.</p>
                    </div>
                    <div className="border-l-2 border-blue-500/30 pl-2">
                      <p className="text-muted-foreground uppercase font-bold text-[8px]">rRNA Filter</p>
                      <p className="text-foreground">Sintonizando LangChain .NET & Hermes Doctor vectors.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-500/5 border border-purple-500/20 border-dashed">
                <CardContent className="pt-6 text-center space-y-2">
                  <Sparkles className="h-6 w-6 text-purple-400 mx-auto animate-pulse" />
                  <p className="text-[10px] font-mono text-purple-400 font-bold uppercase">Alpha-Gain Optimized</p>
                  <p className="text-[9px] text-muted-foreground leading-tight italic">
                    "O deploy pleno V8.1 remove a redundância de dados e foca na manifestação da medula biológico-digital."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}