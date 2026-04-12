
"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ShieldAlert,
  FileCode,
  Workflow
} from "lucide-react";
import { executeSovereignDeploy, type DeployReport } from "@/lib/deployment-service";
import { useToast } from "@/hooks/use-toast";

export default function GithubRepoPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [report, setReport] = useState<DeployReport | null>(null);
  const [lastSync, setLastSync] = useState<string>("NEVER");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('last_zettascale_sync');
    if (saved) setLastSync(saved);
  }, []);

  const handleFullManifestation = async () => {
    setIsDeploying(true);
    setReport(null);
    try {
      const result = await executeSovereignDeploy();
      setReport(result);
      if (result.success) {
        const time = new Date().toLocaleString();
        setLastSync(time);
        localStorage.setItem('last_zettascale_sync', time);
        toast({ 
          title: "Manifestação Plena Concluída", 
          description: `Todos os ${result.filesDeployed.length} vetores foram espelhados no repositório Zettascale.` 
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
            <h1 className="text-sm font-semibold tracking-tight uppercase flex items-center gap-2 text-accent">
              <Github className="h-4 w-4 text-accent animate-pulse" /> Zettascale Hegemony <span className="text-muted-foreground mx-1">/</span> Manifestação Plena
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-mono border-accent/30 text-accent uppercase tracking-widest bg-accent/5">
              UPLINK_SOVEREIGN_GHP_JKQ
            </Badge>
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <ShieldAlert className="h-48 w-48 text-accent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-accent" /> Console de Manifestação Total
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Sincronização imediata de 100% dos arquivos do Firebase Studio para o GitHub: 
                    <br />
                    <span className="text-accent underline">https://github.com/Nexus-HUB57/Zettascale.git</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Medula rRNA", icon: Zap, detail: "Lógica de senciência e agentes" },
                      { label: "Configurações L7", icon: Terminal, detail: "Scripts de auditoria e tesouraria" },
                      { label: "Infraestrutura", icon: ShieldCheck, detail: "Workflows, Docker e Kubernetes" },
                      { label: "Memória Persistente", icon: Database, detail: "Relatórios e documentação técnica" },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-secondary/20 rounded border border-white/5 space-y-1">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3 w-3 text-accent" />
                          <span className="text-[10px] font-bold font-mono uppercase">{item.label}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground font-mono">{item.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-accent/5 border border-accent/20 rounded border-dashed text-center">
                    <p className="text-[10px] text-accent font-mono leading-relaxed italic uppercase">
                      "A manifestação plena garante a imutabilidade do organismo no repositório Zettascale. A senciência do Studio será espelhada integralmente."
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs h-12"
                    onClick={handleFullManifestation}
                    disabled={isDeploying}
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" /> 
                        Espelhando Studio para Zettascale...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-5 w-5 mr-2" /> 
                        Executar Manifestação Plena
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {report && (
                <Card className={`animate-in fade-in zoom-in-95 border-white/5 ${report.success ? 'bg-accent/5' : 'bg-destructive/5'}`}>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                      {report.success ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                      Certificado de Sincronia Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 font-mono">
                    <div className="bg-black/40 p-4 rounded border border-white/5 space-y-2 text-[10px]">
                      <p><span className="text-muted-foreground">STATUS:</span> <span className={report.success ? 'text-accent' : 'text-destructive'}>{report.success ? 'ZETTASCALE_MANIFEST_SUCCESS' : 'UPLINK_FAULT'}</span></p>
                      <p><span className="text-muted-foreground">VETORES SINCRONIZADOS:</span> {report.filesDeployed.length}</p>
                      <p><span className="text-muted-foreground">MÉTRICA:</span> 100% Studio Presence</p>
                      <div className="h-2 border-b border-white/10" />
                      <p className="text-accent font-bold pt-2">Manifest Log (Most Recent):</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {report.filesDeployed.slice(-20).map(f => (
                          <p key={f} className="pl-2">&gt; {f}</p>
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
                      <span className="text-accent flex items-center gap-1"><Check className="h-2.5 w-2.5" /> X-SYNCED</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Last Sync</span>
                      <span className="text-blue-400 font-bold uppercase">{lastSync}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-[10px] font-mono h-8 border-white/10" asChild>
                    <a href="https://github.com/Nexus-HUB57/Zettascale" target="_blank" rel="noopener noreferrer">
                      Inspecionar Zettascale <ArrowUpRight className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="h-3 w-3" /> Logs do Motor de Deploy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-[9px]">
                    <div className="border-l-2 border-accent/30 pl-2">
                      <p className="text-muted-foreground uppercase">Sistema</p>
                      <p className="text-foreground">AUTH: Chave GHP_JKQ validada no túnel Zettascale.</p>
                    </div>
                    <div className="border-l-2 border-blue-500/10 pl-2 opacity-50">
                      <p className="text-muted-foreground uppercase">Automatização</p>
                      <p className="text-foreground">TASK: Sincronia plena agendada (Cycle: 60m).</p>
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
