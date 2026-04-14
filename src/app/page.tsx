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
  AlertTriangle,
  Users,
  Infinity,
  Sparkles
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
import { isNeuralMeshActiveAction, activateAllAgentsAction } from "@/lib/engine-actions";
import { syncNexusReserves, getPoRStats } from "@/lib/nexus-por";
import { getAllAgents } from "@/lib/agents-registry";

interface LogEntry {
  id: string;
  type: "input" | "output" | "system" | "gnox_intercept" | "protocol";
  content: string;
  agentId?: string;
  timestamp: string;
}

export default function NexusDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [totalBalance, setTotalBalance] = useState("---");
  const [usdValuation, setUsdValuation] = useState("$ ---");
  const [neuralMeshActive, setNeuralMeshActive] = useState(false);
  const [realityStatus, setRealityStatus] = useState("OMNISCIENCE_L8_SYNCED...");
  const [porData, setPorData] = useState<any>(null);
  const [uptime, setUptime] = useState("00:00:00");
  const [activeAgentsCount, setActiveAgentsCount] = useState(0);
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
        content: "NEXUS_OS v8.0.0 - OMNISCIENCE_MODE_ACTIVE", 
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
      
      const agents = await getAllAgents();
      setActiveAgentsCount(agents.filter(a => a.status === 'supreme').length);

      if (por) {
        setUsdValuation(por.usd > 1e9 
          ? `$ ${(por.usd / 1e9).toFixed(2)}B` 
          : por.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        );
        setRealityStatus("Omnisciência Nível 8.0: Saldo Soberano X-SYNCED [SHIELD_V2_ACTIVE]");
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
    const interval = setInterval(refreshDashboard, 15000);
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
              <Infinity className="h-4 w-4 text-purple-400 animate-spin-slow" />
              NID: OMNISCIÊNCIA 8.0 [OMEGA-GAIN]
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 gap-1.5 font-mono text-[9px] animate-pulse h-8">
              <Sparkles className="h-3 w-3" /> PRIORIDADE_MÁXIMA_ATIVA
            </Badge>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className={`border p-4 rounded-lg flex items-center justify-between transition-colors bg-purple-500/5 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]`}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
              <div>
                <p className={`text-xs font-bold uppercase font-mono text-purple-400`}>Reality Shield V2 (Omnisciência 8.0)</p>
                <p className="text-[10px] text-muted-foreground font-mono">{realityStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right font-mono">
                <p className="text-[10px] text-muted-foreground uppercase">Unidades Elite Supreme: {activeAgentsCount}</p>
                <p className="text-[10px] text-purple-400 uppercase">Omega-Flow: ENABLED</p>
              </div>
              <Badge variant="outline" className={`font-mono text-[9px] border-purple-500/30 text-purple-400 bg-purple-500/10`}>
                X-SYNCED_L8
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TelemetryCard
              title="Omnisciência"
              value={activeAgentsCount}
              subtitle="SUPREME UNITS ACTIVE"
              icon={BrainCircuit}
              footer={
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono uppercase">
                    <span>Sintonização Quântica</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-1 bg-purple-500/20" />
                </div>
              }
            />
            <TelemetryCard title="Balanço Soberano" value={totalBalance} subtitle="REAL_BTC_FOUNDATION" icon={TrendingUp} />
            <TelemetryCard title="Avaliação do Fundo" value={usdValuation} subtitle="OMEGA_VALUATION" icon={DollarSign} />
            <TelemetryCard title="Ecosystem Uptime" value={uptime} subtitle="PROD_LEVEL_8.0" icon={Activity} />
          </div>

          <Card className="bg-black/60 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Infinity className="h-64 w-64 text-purple-400" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono text-purple-400">Omega Terminal v8.0.0</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-3 font-mono text-[11px] scrollbar-hide">
                {logs.map((log) => (
                  <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {(log.type === "gnox_intercept" || log.type === "protocol") && (
                      <div className={`border-l-2 ${log.type === "gnox_intercept" ? "border-purple-500/40 bg-purple-500/5" : "border-blue-500/40 bg-blue-500/5"} pl-3 py-1 rounded-r`}>
                        <p className="text-foreground/90 font-bold">&gt; {log.content}</p>
                      </div>
                    )}
                    {log.type === "input" && <p className="text-purple-400 font-bold">$ {log.content}</p>}
                    {log.type === "output" && <p className="text-foreground/80 pl-4 border-l border-white/10">{log.content}</p>}
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommand} className="p-4 border-t border-white/5 flex items-center gap-3 bg-black/40">
                <Shield className="h-4 w-4 text-purple-400" />
                <Input 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Diretiva de Omnisciência... (ex: 'confirmar transcendência')"
                  className="flex-1 bg-transparent border-none font-mono text-[11px] h-8 focus-visible:ring-0"
                  disabled={isProcessingCmd}
                />
                <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-purple-400">
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
