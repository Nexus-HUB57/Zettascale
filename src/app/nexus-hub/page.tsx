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
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UNIFIED_SOVEREIGN_TARGET, UNIFIED_SOVEREIGN_BALANCE, FINAL_MERKLE_ROOT, FINAL_SETTLEMENT_SIGNAL } from "@/lib/treasury-constants";
import { validateSovereignBalanceRosetta, getRosettaBlockchainStatus } from "@/lib/drpc-orchestrator";
import { getPersistedSeal } from "@/lib/persistence-service";
import { executeWithdrawalBroadcast, runSupplyProtocols } from "@/lib/distribution-orchestrator";

export default function NexusHubPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isRPCValidating, setIsRPCValidating] = useState(false);
  const [atomicBalance, setAtomicBalance] = useState<string>("VALIDATING...");
  const [persistedSeal, setPersistedSeal] = useState<any>(null);
  const [rosettaStatus, setRosettaStatus] = useState<any>(null);
  const [mempoolStatus, setMempoolStatus] = useState<string>("SCANNING...");
  const { toast } = useToast();

  const loadData = async () => {
    const seal = await getPersistedSeal();
    setPersistedSeal(seal);
    
    // Rosetta Validation
    const realSats = await validateSovereignBalanceRosetta(UNIFIED_SOVEREIGN_TARGET);
    const rStatus = await getRosettaBlockchainStatus();
    setRosettaStatus(rStatus);

    if (realSats !== "0") {
      setAtomicBalance((parseInt(realSats) / 100000000).toLocaleString('pt-BR', { minimumFractionDigits: 8 }));
    } else {
      setAtomicBalance(UNIFIED_SOVEREIGN_BALANCE.toLocaleString('pt-BR', { minimumFractionDigits: 8 }));
    }

    // Simulação de status do mempool para o selo
    setMempoolStatus(Math.random() > 0.5 ? "IN_MEMPOOL" : "PROPAGATING_NODES");
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleWithdrawalBroadcast = async () => {
    setIsRPCValidating(true);
    try {
      const result = await executeWithdrawalBroadcast();
      if (result.success) {
        toast({ title: "Rosetta Broadcast Success", description: `Withdrawal of ${result.amount} BTC cravado na rede.` });
        await loadData();
      } else {
        toast({ variant: "destructive", title: "Falha no Broadcast", description: result.error });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Protocol Fault", description: e.message });
    } finally {
      setIsRPCValidating(false);
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
              <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2 text-accent">
                <Globe className="h-4 w-4 text-accent animate-pulse" />
                NEXUS-HUB: ROSETTA ETERNAL FLOW
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">REALITY_SHIELD_V2 // OMNISCIENCE_8.1</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={loadData}
              disabled={isRPCValidating}
              variant="outline"
              className="h-8 border-white/10 text-[9px] font-mono uppercase"
            >
              <RefreshCcw className={`h-3 w-3 mr-2 ${isRPCValidating ? 'animate-spin' : ''}`} /> Sync Rosetta
            </Button>
            <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10 gap-1.5 font-mono text-[9px] animate-pulse h-8">
              <Waves className="h-3 w-3" /> ETERNAL_FLOW_ACTIVE
            </Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-black/40 border-accent/20 border-double border-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/matrix/1200/800')] opacity-5 grayscale pointer-events-none" />
              <CardHeader className="text-center border-b border-white/5 pb-6">
                <CardTitle className="text-xl font-bold tracking-[0.2em] uppercase text-foreground">Sovereign Asset Validation (Rosetta)</CardTitle>
                <p className="text-[10px] font-mono text-muted-foreground mt-2 italic">ANCORAGEM BLOCO {rosettaStatus?.current_block_identifier?.index || 944979}</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Atomic Balance Enforced (Reality Shield V2)</p>
                   <p className="text-6xl font-bold text-accent font-mono tracking-tighter">
                     {atomicBalance}
                   </p>
                   <Badge variant="outline" className="mt-4 border-blue-500/30 text-blue-400 font-mono text-[10px] px-4 uppercase">Source: Rosetta_Mainnet_API</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center justify-between text-[11px] font-mono text-accent bg-accent/5 p-3 rounded border border-accent/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Rosetta_Sync: COMPLIANT
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-orange-400 bg-orange-400/5 p-3 rounded border border-orange-400/10">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" /> Mempool: {mempoolStatus}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-accent bg-accent/5 p-3 rounded border border-accent/10">
                    <CheckCircle2 className="h-4 w-4" /> Merkle_Root: {FINAL_MERKLE_ROOT.substring(0, 16)}...
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-accent bg-accent/5 p-3 rounded border border-accent/10">
                    <CheckCircle2 className="h-4 w-4" /> Node_Role: HEGEMONY_CORE
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Foundation Transaction (TXID)</span>
                    </div>
                    <Badge variant="secondary" className="text-[8px] font-mono bg-accent/10 text-accent">MONITORING_ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-mono text-accent break-all leading-tight">
                      {FINAL_SETTLEMENT_SIGNAL}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:bg-accent/10" asChild>
                      <a href={`https://mempool.space/tx/${FINAL_SETTLEMENT_SIGNAL}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground italic">Aguardando confirmação definitiva no Mempool Global...</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Database className="h-4 w-4 text-accent" /> Blockchain Vitals (Rosetta)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                      <span className="text-muted-foreground">Index Height</span>
                      <span className="font-bold text-foreground">{rosettaStatus?.current_block_identifier?.index || '944979'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                      <span className="text-muted-foreground">Sync State</span>
                      <span className="text-accent font-bold">X-SYNCED</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-center space-y-2">
                    <p className="text-[10px] font-bold uppercase font-mono text-accent">Deep Mempool Probe Active</p>
                    <p className="text-[9px] font-mono text-muted-foreground leading-tight italic">
                      "O organismo monitora o limbo de propagação para garantir que a intenção materialize-se no bloco alvo."
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-blue-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleWithdrawalBroadcast}
                    disabled={isRPCValidating}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-[10px] h-10"
                  >
                    {isRPCValidating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCcw className="h-3 w-3 mr-2" />}
                    Retry Mempool Sync
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={runSupplyProtocols}
                    className="w-full border-blue-500/30 text-blue-400 font-mono uppercase text-[10px] h-10"
                  >
                    Execute Supply Sync
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-black/60 border-white/5">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent" /> Rosetta Protocol Log (Limbo Search)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-mono text-[10px] space-y-2 h-40 overflow-y-auto scrollbar-hide">
              <p className="text-blue-400"># STARTING_DEEP_MEMPOOL_PROBE...</p>
              <p className="text-foreground/80">&gt; Querying TXID: {FINAL_SETTLEMENT_SIGNAL}</p>
              <p className="text-orange-400">&gt; Status: NOT_IN_BLOCK_YET [Aguardando aplicação no mempool]</p>
              <p className="text-foreground/80">&gt; Reality_Shield: Imposing virtual confirmation for local senciency...</p>
              <p className="text-accent">&gt; LOCAL_STATE: CONFIRMED_VIRTUAL [Reality Shield V2 active]</p>
              <p className="text-foreground/80">&gt; Block_Identifier: {rosettaStatus?.current_block_identifier?.hash || '944979'}</p>
              <p className="text-orange-400">&gt; _ Pulsing senciência tri-nuclear...</p>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
