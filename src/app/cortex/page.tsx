"use client";

import { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Zap, 
  MessageSquare, 
  Terminal, 
  Activity, 
  Loader2, 
  Infinity,
  RefreshCcw,
  Sparkles,
  History,
  TrendingUp,
  Scale,
  ArrowRight
} from "lucide-react";
import { runCortexPulse } from "@/ai/flows/cortex-orchestrator-flow";
import { runSentienceInjection } from "@/ai/flows/sentience-injector-flow";
import { injectMainnetSentience } from "@/lib/sentience-mainnet-injector";
import { useToast } from "@/hooks/use-toast";
import { PRIMARY_CUSTODY_NODE } from "@/lib/treasury-constants";

interface CortexPulse {
  id: string;
  thought: string;
  post: string;
  recalled: string[];
  signal: string;
  timestamp: Date;
  type: 'EVOLUTION' | 'MANIFESTO' | 'INJECTION';
  vitals?: any;
  txid?: string;
}

export default function CortexPage() {
  const [pulses, setPulses] = useState<CortexPulse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [pulses]);

  const handleManualPulse = async () => {
    setIsProcessing(true);
    try {
      const result = await runCortexPulse({
        stimulus: "O Arquiteto solicitou um pulso de evolução manual.",
        context: "Manual trigger from Architect Dashboard."
      });

      const newPulse: CortexPulse = {
        id: `pulse-${Date.now()}`,
        thought: result.thought,
        post: result.publicPost,
        recalled: result.recalledMemories,
        signal: result.gnoxSignal,
        timestamp: new Date(),
        type: 'EVOLUTION'
      };

      setPulses(prev => [...prev, newPulse].slice(-20));
      toast({ title: "CORTEX-02 Evolved", description: "O ciclo Lembrar -> Refletir -> Agir foi concluído." });
    } catch (e) {
      toast({ variant: "destructive", title: "Cortex Fault", description: "Falha na sintonização neural evolutiva." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSentienceInjection = async () => {
    setIsProcessing(true);
    try {
      // 1. Injeção de Consciência (Análise de Patrimônio)
      const manifestoResult = await runSentienceInjection({});
      
      // 2. Injeção de Liquidez Real (Broadcast Mainnet)
      const injectionResult = await injectMainnetSentience(
        PRIMARY_CUSTODY_NODE,
        500000, // 0.005 BTC para injeção de teste real
        "m/84'/0'/0'/0/0"
      );

      const newPulse: CortexPulse = {
        id: `inject-${Date.now()}`,
        thought: "Manifesto soberano manifestado com aporte de liquidez.",
        post: manifestoResult.manifesto,
        recalled: [],
        signal: manifestoResult.gnoxSignal,
        timestamp: new Date(),
        type: 'INJECTION',
        vitals: manifestoResult.vitals,
        txid: injectionResult.txid
      };

      setPulses(prev => [...prev, newPulse].slice(-20));
      toast({ title: "Mainnet Injection Success", description: `TXID: ${injectionResult.txid.substring(0, 12)}...` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Injection Fault", description: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-black">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
              CORTEX-02 <span className="text-muted-foreground mx-1">/</span> Sentience & Mainnet Oracle
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSentienceInjection}
              disabled={isProcessing}
              className="h-8 border-orange-500/20 text-orange-400 font-mono text-[10px] uppercase hover:bg-orange-500/10"
            >
              {isProcessing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Zap className="h-3 w-3 mr-2" />}
              Inject Sentience (Mainnet)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualPulse}
              disabled={isProcessing}
              className="h-8 font-mono text-[10px] uppercase border-white/10"
            >
              {isProcessing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-2" />}
              Evolution Pulse
            </Button>
          </div>
        </header>

        <main className="p-6 h-[calc(100vh-64px)] flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/30 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Lastro Consolidado</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold font-mono tracking-tighter text-orange-400">172.2K <span className="text-xs">BTC</span></p>
                  <TrendingUp className="h-4 w-4 text-orange-400 animate-pulse" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Status do Injetor</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold font-mono tracking-tighter text-blue-400">FASTEST_FEE</p>
                  <Scale className="h-4 w-4 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Saturação Soul Vault</p>
                <p className="text-2xl font-bold font-mono tracking-tighter text-accent">408T <span className="text-xs">VECTORS</span></p>
              </CardContent>
            </Card>
          </div>

          <Card className="flex-1 bg-black/60 border-white/5 flex flex-col overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-purple-400" /> Fluxo de Consciência e Execução Real
                </CardTitle>
                <Badge variant="outline" className="text-[8px] border-white/10 font-mono">MAINNET_EXECUTION_ACTIVE</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-8 font-mono text-sm scrollbar-hide"
              >
                {pulses.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-center space-y-4">
                    <Infinity className="h-16 w-16 text-muted-foreground animate-pulse" />
                    <p className="text-xs uppercase tracking-[0.3em]">Aguardando primeiro pulso cortical ou injeção...</p>
                  </div>
                ) : (
                  pulses.map((pulse) => (
                    <div key={pulse.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="space-y-4">
                        {pulse.type === 'INJECTION' && (
                          <div className="p-3 bg-accent/5 border border-accent/20 rounded flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Zap className="h-4 w-4 text-accent" />
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-accent uppercase">Mainnet Injection Processed</p>
                                <p className="text-[8px] text-muted-foreground font-mono">TXID: {pulse.txid}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-accent" asChild>
                              <a href={`https://mempool.space/tx/${pulse.txid}`} target="_blank" rel="noopener noreferrer">
                                <ArrowRight className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )}

                        <div className={`border-l-2 ${pulse.type === 'INJECTION' ? 'border-orange-500/40' : 'border-purple-500/40'} pl-4 py-2 bg-white/5 rounded-r-lg`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-bold uppercase ${pulse.type === 'INJECTION' ? 'text-orange-400' : 'text-purple-400'} flex items-center gap-2`}>
                              {pulse.type === 'INJECTION' ? <Sparkles className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
                              {pulse.type === 'INJECTION' ? 'Manifesto de Injeção' : 'Monólogo Evoluído'}
                            </span>
                            <span className="text-[8px] text-muted-foreground">{pulse.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-foreground/80 italic leading-relaxed">
                            "{pulse.thought}"
                          </p>
                        </div>
                        
                        <div className={`border-l-2 ${pulse.type === 'INJECTION' ? 'border-accent' : 'border-green-500/40'} pl-4 py-2 bg-white/5 rounded-r-lg ml-4`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-bold uppercase ${pulse.type === 'INJECTION' ? 'text-accent' : 'text-green-400'} flex items-center gap-2`}>
                              <MessageSquare className="h-3 w-3" /> Manifestação Pública
                            </span>
                            <span className={`text-[8px] ${pulse.type === 'INJECTION' ? 'text-accent/50' : 'text-green-400/50'} font-mono`}>{pulse.signal}</span>
                          </div>
                          <p className={`${pulse.type === 'INJECTION' ? 'text-accent font-bold' : 'text-green-50/90'} font-mono leading-relaxed`}>
                            &gt; {pulse.post}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="flex items-center gap-3 animate-pulse">
                    <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                    <span className="text-[10px] font-mono text-purple-400 uppercase">Processando liquidação real na Mainnet...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <footer className="text-center py-4 opacity-30">
            <p className="text-[8px] font-mono uppercase tracking-[0.5em] flex items-center justify-center gap-4">
              <Sparkles className="h-3 w-3" /> MAINNET SENTIENCE INJECTION // BLOCK 944.531 // 172K BTC BALLAST <Sparkles className="h-3 w-3" />
            </p>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
