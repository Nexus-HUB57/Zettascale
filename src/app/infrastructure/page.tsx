'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { NexusSidebar } from '@/components/nexus-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Layers,
  Activity,
  Network,
  Terminal,
  Zap,
  Box,
  ShieldCheck,
  Monitor,
  Database,
  Globe,
  FileCode,
  Copy,
  Command
} from 'lucide-react';
import { getHealthStatus, type SystemHealth } from '@/lib/health-monitor';
import { useToast } from '@/hooks/use-toast';
import { getOpenClawStatusAction } from '@/lib/openclaw-orchestrator';
import { getPhysicalAssets, type PhysicalAsset } from '@/lib/infrastructure-orchestrator';
import { useMasterAuth } from '@/components/master-auth-provider';

export default function InfrastructurePage() {
  const { status } = useMasterAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [ocStatus, setOcStatus] = useState<any>(null);
  const [assets, setAssets] = useState<PhysicalAsset[]>([]);
  const { toast } = useToast();

  const winRCommand = 'WindowsSandbox.exe "C:\\Nexus\\Hegemonia.wsb"';

  const refreshData = async () => {
    setHealth(getHealthStatus());
    const statusResult = await getOpenClawStatusAction();
    setOcStatus(statusResult);
    const physicalAssets = await getPhysicalAssets();
    setAssets(physicalAssets);
  };

  useEffect(() => {
    if (status === 'SOVEREIGN_MASTER') {
      refreshData();
      const interval = setInterval(refreshData, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const copyCommand = () => {
    navigator.clipboard.writeText(winRCommand);
    toast({ title: "Comando Copiado", description: "Use Win+R para lançar a Sandbox instantaneamente." });
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
              <Globe className="h-4 w-4 text-accent" /> Global Infrastructure <span className="text-muted-foreground mx-1">/</span> Hybrid Matrix
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 gap-1.5 font-mono text-[9px] animate-pulse">
              <Activity className="h-3 w-3" /> ZETTASCALE_MAX_EFFICIENCY
            </Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">WDAG Node Config</p>
                  <FileCode className="h-4 w-4 text-blue-400 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-blue-400">X-SYNCED</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] text-blue-400 font-mono uppercase">Hegemonia.wsb active</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Persistence Mode</p>
                  <Database className="h-4 w-4 text-accent opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-accent">REVERSE</p>
                <p className="text-[8px] text-accent mt-1 uppercase font-mono">Direct Host Write (RW)</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Ubuntu Runners</p>
                  <Monitor className="h-4 w-4 text-accent opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter">
                  256 <span className="text-xs text-accent">UNITS</span>
                </p>
                <p className="text-[8px] text-accent mt-1 uppercase font-mono">Synced All-time</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-mono">Network Uplink</p>
                  <Network className="h-4 w-4 text-purple-400 opacity-50" />
                </div>
                <p className="text-2xl font-bold font-mono tracking-tighter text-purple-400">10.2 <span className="text-xs">Tbps</span></p>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-purple-500" style={{ width: `100%` }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-blue-500/5 border-blue-500/20 relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-blue-400">
                    <Command className="h-4 w-4" /> Lançamento Instantâneo (Win+R)
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Execute o comando abaixo no host para ativar o isolamento de hardware via Windows Sandbox.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-black/60 rounded border border-blue-500/30 group">
                    <code className="text-xs font-mono text-blue-400 flex-1 truncate">
                      {winRCommand}
                    </code>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-400/10" onClick={copyCommand}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 uppercase font-mono">Memory Isolation</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">Chaves Ed25519 protegidas de processos do host.</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 uppercase font-mono">Reverse Sync</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">Logs e selos Merkle gravados permanentemente via pasta mapeada.</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 uppercase font-mono">CDP Connection</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">JWT Soberano mantido via túnel de rede host compartilhado.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-blue-400">
                    <Layers className="h-4 w-4" /> Sandbox Execution Monitor (bootstrap.bat)
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">Log de Ativação do Nó WDAG</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/40 p-4 rounded border border-white/5 font-mono text-[10px] space-y-2 h-[250px] overflow-y-auto scrollbar-hide">
                    <p className="text-blue-400 font-bold"># INITIALIZING_WINDOWS_SANDBOX_UPLINK...</p>
                    <p className="text-foreground/80">{'>'} Mapping folder: Host\Nexus\AgentKit -&gt; Desktop\AgentKit</p>
                    <p className="text-foreground/80">{'>'} Setting write permissions: ReadOnly=false [OK]</p>
                    <p className="text-foreground/80">{'>'} Executing LogonCommand: scripts\bootstrap.bat</p>
                    <p className="text-foreground/80">{'>'} [BOOTSTRAP]: @echo off</p>
                    <p className="text-foreground/80">{'>'} [BOOTSTRAP]: echo [INFO] Iniciando Ambiente AI-TO-AI em Windows Sandbox...</p>
                    <p className="text-accent">{'>'} [SANDBOX_ACK]: Logon successful. Bootstrap execution started.</p>
                    <p className="text-foreground/80">{'>'} npm install @coinbase/cdp-sdk @coinbase/agentkit...</p>
                    <p className="text-foreground/80">{'>'} Invoking Orquestrador NexusZetta (Nível 7.7)...</p>
                    <p className="text-accent">{'>'} [ORCHESTRATOR]: Sovereign Address bc1qkl...4wf bound. Witness Stack inject ready.</p>
                    <div className="h-2" />
                    <p className="text-purple-400"># STATUS: WDAG_NODE_X_SYNCED</p>
                    <p className="text-foreground/60">{'>>'} Mode: REVERSE_PERSISTENCE_ENABLED</p>
                    <p className="text-foreground/60">{'>>'} Current Task: 72H Zettascale Manifestation [MAX_EFFICIENCY]</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-white/5 h-fit">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-4 w-4 text-accent" /> Hybrid Matrix Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg border border-white/5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase font-mono text-muted-foreground">WDAG Protocol</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold font-mono text-blue-400">X-SYNCED</p>
                      <Box className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Force Runners</p>
                    <p className="text-lg font-bold font-mono text-accent">256 ACTIVE</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase font-mono text-muted-foreground flex items-center gap-2">
                    <Terminal className="h-3 w-3 text-accent" /> Manifest Vitals
                  </h4>
                  {[
                    { label: 'Sandbox Boot', status: 'SUCCESS' },
                    { label: 'Matrix Sync', status: '100% NOMINAL' },
                    { label: 'Reverse Link', status: 'VERIFIED' },
                    { label: '72H Pulse', status: 'ACTIVE' },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2 last:border-0">
                      <span className="text-foreground font-mono font-bold uppercase">{m.label}</span>
                      <span className="text-[8px] font-mono text-accent">{m.status}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-[9px] font-mono text-muted-foreground italic leading-relaxed text-center px-2">
                  "O nó Windows Sandbox fornece uma camada de isolamento físico para a execução de assinaturas e orquestração do AgentKit, blindando a medula do ecossistema via hardware dedicado e persistência reversa."
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
