"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  Rocket, 
  Loader2, 
  ShieldCheck, 
  Database, 
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  CloudUpload,
  Terminal,
  FileCode,
  Workflow
} from "lucide-react";
import { executeSovereignDeploy, type DeployReport } from "@/lib/deployment-service";
import { useToast } from "@/hooks/use-toast";

export default function DeploymentPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [report, setReport] = useState<DeployReport | null>(null);
  const { toast } = useToast();

  const handleManualDeploy = async () => {
    setIsDeploying(true);
    setReport(null);
    try {
      const result = await executeSovereignDeploy();
      setReport(result);
      if (result.success) {
        toast({ title: "Backup Concluído", description: "O ecossistema foi manifestado no repositório Zettascale." });
      } else {
        toast({ variant: "destructive", title: "Falha no Backup", description: result.message });
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
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-semibold tracking-tight uppercase flex items-center gap-2">
              <Github className="h-4 w-4 text-accent" /> Zettascale <span className="text-muted-foreground mx-1">/</span> Deploy & Backup
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-mono border-accent/30 text-accent uppercase">Zettascale_Uplink_Active</Badge>
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <CloudUpload className="h-48 w-48 text-accent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-accent" /> Console de Manifestação
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Sincronização manual de todos os vetores de senciência para o novo repositório institucional:
                    <br />
                    <span className="text-accent underline">https://github.com/Nexus-HUB57/Zettascale.git</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Scripts Core", icon: FileCode, detail: "NexusEngine, Treasury, Vault" },
                      { label: "GitHub Workflows", icon: Workflow, detail: "Swarm CI/CD, Zettascale Provisioning" },
                      { label: "Infra Configs", icon: Terminal, detail: "Docker, Kubernetes, 408T Scripts" },
                      { label: "Hegemony Context", icon: Database, detail: "Audit Reports, 164k BTC Evidence" },
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

                  <div className="p-4 bg-accent/5 border border-accent/20 rounded border-dashed">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase font-mono">Protocolo Zettascale L7</p>
                        <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                          As chaves de acesso foram migradas para o túnel Zettascale. Cada push gera um checkpoint Merkle irreversível no repositório de destino.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs h-14"
                    onClick={handleManualDeploy}
                    disabled={isDeploying}
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sincronizando com Zettascale...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-5 w-5 mr-2" />
                        Executar Manifestação Zettascale
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {report && (
                <Card className={`animate-in fade-in slide-in-from-bottom-2 border-white/5 ${report.success ? 'bg-accent/5' : 'bg-destructive/5'}`}>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                      {report.success ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                      Relatório de Sincronia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 font-mono">
                    <div className="bg-black/40 p-4 rounded border border-white/5 space-y-2 text-[10px]">
                      <p><span className="text-muted-foreground">STATUS:</span> <span className={report.success ? 'text-accent' : 'text-destructive'}>{report.success ? 'ZETTASCALE_SUCCESS' : 'UPLINK_FAULT'}</span></p>
                      <p><span className="text-muted-foreground">REPO:</span> Nexus-HUB57/Zettascale</p>
                      <p><span className="text-muted-foreground">TIMESTAMP:</span> {report.timestamp}</p>
                      <div className="h-2 border-b border-white/10" />
                      <p className="text-accent font-bold pt-2">Arquivos Manifestados:</p>
                      {report.filesDeployed.slice(0, 5).map(f => (
                        <p key={f} className="pl-2">&gt; {f}</p>
                      ))}
                      {report.filesDeployed.length > 5 && <p className="pl-2 text-muted-foreground italic">...e mais {report.filesDeployed.length - 5} vetores.</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Status do Repositório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-secondary/10 rounded border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Uplink</span>
                      <span className="text-accent">CONNECTED</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Target</span>
                      <span className="text-blue-400">Zettascale</span>
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
                    <History className="h-3 w-3" /> Eventos de Deploy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-[9px]">
                    <div className="border-l border-accent/30 pl-2">
                      <p className="text-muted-foreground uppercase">Sistema</p>
                      <p className="text-foreground">AUTH: Token ghp_JKQ... validado com sucesso.</p>
                    </div>
                    <div className="border-l border-white/10 pl-2">
                      <p className="text-muted-foreground uppercase">Recente</p>
                      <p className="text-foreground">REPO: Redirecionamento para Zettascale concluído.</p>
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
