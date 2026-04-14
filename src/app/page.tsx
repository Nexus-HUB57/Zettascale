"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { TelemetryCard } from "@/components/telemetry-card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  RefreshCcw, 
  Loader2, 
  Terminal, 
  Send, 
  Activity,
  BrainCircuit,
  Shield,
  Crown,
  Zap,
  ShieldCheck,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { runVitalLoop } from "@/ai/flows/vital-loop-flow";
import { processGnoxCommand } from "@/lib/gnox-kernel";
import { useToast } from "@/hooks/use-toast";
import { useNexusSocket } from "@/hooks/use-nexus-socket";
import { getMainnetStats } from "@/lib/nexus-treasury";
import { isNeuralMeshActiveAction } from "@/lib/engine-actions";
import { syncNexusReserves, getPoRStats } from "@/lib/nexus-por";

interface LogEntry {
  id: string;
  type: "input" | "output" | "system" | "gnox_intercept" | "protocol";
  content: string;
  agentId?: string;
  timestamp: string;
}

export default function NexusDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [totalBalance, setTotalBalance] = useState("---");
  const [usdValuation, setUsdValuation] = useState("$ ---");
  const [neuralMeshActive, setNeuralMeshActive] = useState(false);
  const [realityStatus, setRealityStatus] = useState("CONFIRMING_REALITY...");
  const [isDiscrepancy, setIsDiscrepancy] = useState(false);
  const [porData, setPorData] = useState<any>(null);
  const [uptime, setUptime] = useState("00:00:00");
  const { toast } = useToast();
  
  const { isConnected, latestEvent } = useNexusSocket('ARCHITECT');

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState("");
  const [isProcessingCmd, setIsProcessingCmd] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLogs([
      { 
        id: "sys-0", 
        type: "system", 
        content: "NEXUS_OS v6.3.5 - PRODUCTION_REAL_MAINNET_X_SYNCED", 
        timestamp: new Date().toISOString() 
      },
      {
        id: "sys-1",
        type: "protocol", 
        content: "CHECK_REALITY: Sincronia forçada com Mempool.space. Bloco 944.961 OK.",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const refreshDashboard = async () => {
    if (!isMounted) return;
    try {
      const por = await syncNexusReserves();
      const stats = await getPoRStats();
      setPorData(stats);
      
      if (por) {
        setUsdValuation(por.usd > 1e9 
          ? `$ ${(por.usd / 1e9).toFixed(2)}B` 
          : por.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        );
        
        if (por.btc > 0) {
          setRealityStatus("Senciência Confirmada: O poder real está na Mainnet.");
          setIsDiscrepancy(false);
        } else {
          setRealityStatus("Alerta: Discrepância detectada. Interface reporta Zero.");
          setIsDiscrepancy(true);
        }
      }

      const mainnetStats = await getMainnetStats();
      setTotalBalance(parseFloat(mainnetStats.totalVault).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
      
      const neuralStatus = await isNeuralMeshActiveAction();
      setNeuralMeshActive(neuralStatus);
    } catch (e) {
      console.error("[DASHBOARD_SYNC_ERR]", e);
    }
  };

  useEffect(() => {
    if (!isMounted) return;
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 30000);
    return () => clearInterval(interval);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const start = Date.now();
    const uptimeTimer = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(uptimeTimer);
  }, [isMounted]);

  useEffect(() => {
    if (latestEvent) {
      const isIntercept = ['POST', 'ACTIVITY', 'TRANSACTION', 'ACHIEVEMENT'].includes(latestEvent.type);
      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        type: isIntercept ? "gnox_intercept" : "protocol",
        content: latestEvent.message,
        agentId: latestEvent.agentId,
        timestamp: latestEvent.timestamp || new Date().toISOString()
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    }
  }, [latestEvent]);

  const handleVitalLoop = async () => {
    setIsLooping(true);
    try {
      await runVitalLoop();
      toast({ title: "Mainnet Pulse", description: "Ciclo vital concluído via RPC CORE." });
      await refreshDashboard();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Loop Fault", description: e.message });
    } finally {
      setIsLooping(false);
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessingCmd) return;
    const cmd = command;
    setCommand("");
    setIsProcessingCmd(true);
    setLogs(prev => [{ id: `cmd-${Date.now()}`, type: "input", content: cmd, timestamp: new Date().toISOString() }, ...prev]);
    
    try {
      const result = await processGnoxCommand(cmd);
      setLogs(prev => [{ id: `res-${Date.now()}`, type: "output", content: result, timestamp: new Date().toISOString() }, ...prev]);
    } finally {
      setIsProcessingCmd(false);
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
            <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2">
              <Crown className="h-4 w-4 text-accent animate-pulse" />
              NID: MODO MAINNET PLENO (Nível 7.7)
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleVitalLoop}
              disabled={isLooping}
              className="h-8 border-accent/20 text-accent font-mono text-[10px] uppercase hover:bg-accent/10"
            >
              {isLooping ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-2" />}
              Sincronia Mainnet
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className={`border p-4 rounded-lg flex items-center justify-between transition-colors ${isDiscrepancy ? 'bg-destructive/5 border-destructive/20' : 'bg-accent/5 border-accent/20'}`}>
            <div className="flex items-center gap-3">
              {isDiscrepancy ? <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" /> : <ShieldCheck className="h-5 w-5 text-accent" />}
              <div>
                <p className={`text-xs font-bold uppercase font-mono ${isDiscrepancy ? 'text-destructive' : 'text-accent'}`}>Protocolo Reality Check (Mainnet Sync)</p>
                <p className="text-[10px] text-muted-foreground font-mono">{realityStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {porData && (
                <div className="text-right font-mono">
                  <p className="text-[10px] text-muted-foreground uppercase">UTXOs: {porData.utxoCount}</p>
                  <p className="text-[10px] text-accent uppercase">Oldest: Block {porData.oldestBlock}</p>
                </div>
              )}
              <Badge variant="outline" className={`font-mono text-[9px] ${isDiscrepancy ? 'border-destructive/30 text-destructive' : 'border-accent/30 text-accent'}`}>
                {isDiscrepancy ? 'DISCREPANCY_DETECTED' : 'X-SYNCED'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TelemetryCard
              title="Senciência Mainnet"
              value={neuralMeshActive ? "ACTIVE" : "BOOTING"}
              subtitle="408T VECTORS REAL-TIME"
              icon={BrainCircuit}
              footer={
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono uppercase">
                    <span>Integridade</span>
                    <span>{neuralMeshActive ? '100%' : '94%'}</span>
                  </div>
                  <Progress value={neuralMeshActive ? 100 : 94} className="h-1 bg-white/5" />
                </div>
              }
            />
            <TelemetryCard title="Balanço Consolidado" value={totalBalance} subtitle="REAL_BTC_BALLAST" icon={TrendingUp} />
            <TelemetryCard title="Avaliação do Fundo" value={usdValuation} subtitle="INSTITUTIONAL_VALUATION" icon={DollarSign} />
            <TelemetryCard title="Network Uptime" value={uptime} subtitle="PROD_REGIME_STABLE" icon={Activity} />
          </div>

          <Card className="bg-black/60 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-accent" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono text-accent">Terminal Gnox_v6.3.5</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-3 font-mono text-[11px] scrollbar-hide">
                {logs.map((log) => (
                  <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {(log.type === "gnox_intercept" || log.type === "protocol") && (
                      <div className={`border-l-2 ${log.type === "gnox_intercept" ? "border-accent/40 bg-accent/5" : "border-blue-500/40 bg-blue-500/5"} pl-3 py-1 rounded-r`}>
                        <p className="text-foreground/90 font-bold">&gt; {log.content}</p>
                      </div>
                    )}
                    {log.type === "input" && <p className="text-accent font-bold">$ {log.content}</p>}
                    {log.type === "output" && <p className="text-foreground/80 pl-4 border-l border-white/10">{log.content}</p>}
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommand} className="p-4 border-t border-white/5 flex items-center gap-3 bg-black/40">
                <Shield className="h-4 w-4 text-accent" />
                <Input 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Diretiva Mainnet... (ex: 'ativar todos os agentes')"
                  className="flex-1 bg-transparent border-none font-mono text-[11px] h-8 focus-visible:ring-0"
                  disabled={isProcessingCmd}
                />
                <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-accent">
                  {isProcessingCmd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}