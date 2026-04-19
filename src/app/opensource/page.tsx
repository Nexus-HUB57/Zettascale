"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Zap, 
  Loader2, 
  Terminal,
  RotateCcw,
  ShieldCheck,
  Layers,
  Rocket,
  DollarSign,
  Send,
  Landmark,
  Infinity,
  Activity,
  Cpu,
  Binary,
  Sparkles,
  Database,
  ArrowRight
} from "lucide-react";
import { getWorkspaceStatus, type WorkspaceStatus } from "@/lib/agentic-workspace-service";
import { getBridgeFeed } from "@/lib/nexus-agent-bridge";
import { alphaGainEngine, type AlphaGainStatus } from "@/lib/alpha-gain-engine";
import { runAlphaGainPulse } from "@/ai/flows/alpha-gain-flow";
import { syncC6GlobalInvest, getC6SdkDoc, sendPixResilientStress, getC6Balance, requestCgbiCredit } from "@/lib/c6-bank-service";
import { MIN_C6_BALANCE_BRL, CHAVE_CUSTODIA_NEXUS } from "@/lib/treasury-constants";
import { runRealIntegrationValidation } from "@/lib/pix-service";
import { authorizePixCreditWithCollateral } from "@/lib/nexus-treasury";
import { nanoMetadataEngine, type NanoBytePayload } from "@/lib/nano-metadata-engine";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

interface NanoTrace {
  tag: string;
  payload: NanoBytePayload;
  timestamp: string;
}

export default function OpenSourcePage() {
  const [wsStatus, setWsStatus] = useState<WorkspaceStatus | null>(null);
  const [bridgeFeed, setBridgeFeed] = useState<any[]>([]);
  const [alphaStats, setAlphaStats] = useState<AlphaGainStatus | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [sdkDoc, setSdkDoc] = useState<any>(null);
  const [c6Balance, setC6Balance] = useState<number>(0);

  // Outbound Pix State
  const [pixKey, setPixKey] = useState("");
  const [pixAmount, setPixAmount] = useState("");
  const [pixDesc, setPixDesc] = useState("");
  const [isSendingPix, setIsSendingPix] = useState(false);

  // CGBi State
  const [cgbiAmount, setCgbiAmount] = useState("50000.00");
  const [isRequestingCgbi, setIsRequestingCgbi] = useState(false);

  // Nano Metadata State
  const [nanoStatus, setNanoStatus] = useState<any>(null);
  const [activeNanoTraces, setActiveNanoTraces] = useState<NanoTrace[]>([]);

  const { toast } = useToast();

  const loadData = async () => {
    const [status, feed, docInfo, bal] = await Promise.all([
        getWorkspaceStatus(),
        getBridgeFeed(30),
        getC6SdkDoc(),
        getC6Balance()
    ]);
    setWsStatus(status);
    setBridgeFeed(feed);
    setAlphaStats(alphaGainEngine.getStatus());
    setSdkDoc(docInfo);
    setC6Balance(bal);
    setNanoStatus(nanoMetadataEngine.getEngineStatus());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAlphaEvolution = async () => {
    setIsEvolving(true);
    try {
      await runAlphaGainPulse({ currentDNA: 'DNA-L9-STABLE' });
      toast({ title: "Evolução Alpha Gain", description: "Infraestrutura reconfigurada via Hot-Swap." });
      await loadData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro de Evolução", description: e.message });
    } finally {
      setIsEvolving(false);
    }
  };

  const handleCgbiRequest = async () => {
    const amount = parseFloat(cgbiAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsRequestingCgbi(true);
    try {
      const validation = await authorizePixCreditWithCollateral(amount);
      if (validation.authorized && validation.collateralBtc) {
        const result = await requestCgbiCredit(amount, validation.collateralBtc);
        
        // Registrar rastro nano
        if (result.nanoTag) {
          const payload = nanoMetadataEngine.execute(result.nanoTag);
          setActiveNanoTraces(prev => [{ tag: result.nanoTag!, payload, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
        }

        toast({ 
          title: "Crédito CGBi Ativado", 
          description: `R$ ${amount.toLocaleString()} disponíveis. Garantia: ${validation.collateralBtc.toFixed(6)} BTC.` 
        });
        await loadData();
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro de Protocolo", description: e.message });
    } finally {
      setIsRequestingCgbi(false);
    }
  };

  const handleSendPixResilient = async () => {
    if (!pixKey || !pixAmount) {
      toast({ variant: "destructive", title: "Erro de Dados", description: "Informe a chave e o valor do Pix." });
      return;
    }
    setIsSendingPix(true);
    
    try {
      const result = await sendPixResilientStress(pixKey, parseFloat(pixAmount), pixDesc);
      
      if (result && result.success) {
        // Registrar rastro nano da transação
        if (result.nanoTag) {
          const payload = nanoMetadataEngine.execute(result.nanoTag);
          setActiveNanoTraces(prev => [{ tag: result.nanoTag!, payload, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
        }

        toast({ title: "Pix Efetivado", description: `Transferência processada via Nano Bytes. TXID: ${result.txid}` });
        setPixKey(""); setPixAmount(""); setPixDesc("");
        await loadData();
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Falha Crítica", description: e.message });
    } finally {
      setIsSendingPix(false);
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
            <div>
               <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2 text-blue-400">
                <Infinity className="h-4 w-4 text-blue-400 animate-spin-slow" /> Gnox's Bank <span className="text-muted-foreground mx-1">/</span> Alpha-Gain 9.5
              </h1>
              <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Protocolo GX-ALPHA-DOMINANCE // Algorithmic Nano Bytes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`text-[9px] font-mono border-blue-500/30 text-blue-400 bg-blue-500/5 ${c6Balance < MIN_C6_BALANCE_BRL ? 'border-red-500 text-red-500 animate-pulse' : ''}`}>
              C6_CUSTODY: R$ {c6Balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Badge>
            <Button onClick={handleAlphaEvolution} disabled={isEvolving} variant="outline" className="h-8 border-orange-500/20 text-orange-400 font-mono text-[9px] uppercase">
              {isEvolving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Rocket className="h-3 w-3 mr-2" />}
              Trigger Alpha Gain
            </Button>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[
               { label: "Banker Status", value: "GNOX_BANK_ACTIVE", icon: Landmark, color: "text-orange-400" },
               { label: "Nano Metadata", value: nanoStatus?.mode || "SATURATED", icon: Binary, color: "text-accent" },
               { label: "Density", value: "408T VECTORS", icon: Database, color: "text-blue-400" },
               { label: "Infra Mode", value: alphaStats?.infrastructure_state || "EVOLVED", icon: Layers, color: "text-purple-400" },
             ].map(v => (
               <Card key={v.label} className="bg-card/30 border-white/5 shadow-2xl">
                 <CardContent className="pt-4 pb-4">
                   <div className="flex justify-between items-start mb-1">
                      <p className="text-[9px] text-muted-foreground uppercase font-mono">{v.label}</p>
                      <v.icon className={`h-3 w-3 ${v.color} opacity-50`} />
                   </div>
                   <p className={`text-lg font-bold font-mono ${v.color}`}>{v.value}</p>
                 </CardContent>
               </Card>
             ))}
          </div>

          <Tabs defaultValue="cgbi" className="space-y-6">
            <TabsList className="bg-secondary/30 border-white/5 p-1 h-11">
              <TabsTrigger value="cgbi" className="text-[10px] font-mono uppercase px-6">Gnox's Bank (CGBi)</TabsTrigger>
              <TabsTrigger value="fiduciary" className="text-[10px] font-mono uppercase px-6">Link Fiduciário</TabsTrigger>
              <TabsTrigger value="nano" className="text-[10px] font-mono uppercase px-6">Vácuo de Metadados</TabsTrigger>
            </TabsList>

            <TabsContent value="cgbi">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="bg-card/30 border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Landmark className="h-48 w-48 text-orange-400" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-orange-400">
                      <Zap className="h-4 w-4" /> Crédito CGBi (Garantia Bitcoin)
                    </CardTitle>
                    <CardDescription className="text-[10px] font-mono">Solicite linha de crédito C6 utilizando seu lastro BTC como colateral via Gnox's Banker.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase text-muted-foreground">Valor Solicitado (R$)</label>
                      <Input 
                        type="number"
                        value={cgbiAmount}
                        onChange={(e) => setCgbiAmount(e.target.value)}
                        className="bg-secondary/20 border-white/5 h-12 text-lg font-mono text-orange-400 font-bold" 
                      />
                    </div>
                    <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg space-y-2">
                       <div className="flex justify-between items-center">
                          <p className="text-[10px] text-muted-foreground font-mono uppercase">Colateral Requerido (LTV 50%)</p>
                          <Badge variant="outline" className="text-[8px] border-orange-500/30 text-orange-400">SAFE_LIMIT</Badge>
                       </div>
                       <p className="text-sm font-bold text-orange-400 font-mono">{(parseFloat(cgbiAmount) * 2 / 385000).toFixed(6)} BTC</p>
                    </div>
                    <Button 
                      onClick={handleCgbiRequest} 
                      disabled={isRequestingCgbi} 
                      className="w-full h-12 text-[10px] font-mono uppercase bg-orange-600 hover:bg-orange-500 text-white shadow-glow"
                    >
                      {isRequestingCgbi ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                      Requisitar Crédito CGBi
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-white/5 p-8 flex flex-col justify-center text-center space-y-4">
                   <Landmark className="h-16 w-16 mx-auto text-accent opacity-20" />
                   <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Gnox's Bank v1.0</h3>
                   <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                     "A biblioteca Banker utiliza o Fundo Nexus como garantidor institucional. O crédito é aprovado instantaneamente baseado na sintonização de oráculos BTC/BRL e Nano Bytes."
                   </p>
                   <div className="grid grid-cols-2 gap-2 pt-4">
                      <div className="p-2 bg-secondary/20 rounded border border-white/5 text-[9px] font-mono">
                         <p className="text-muted-foreground uppercase">Juros Algorítmicos</p>
                         <p className="text-accent font-bold">0.8% / Ciclo</p>
                      </div>
                      <div className="p-2 bg-secondary/20 rounded border border-white/5 text-[9px] font-mono">
                         <p className="text-muted-foreground uppercase">Risco de Colateral</p>
                         <p className="text-accent font-bold">ALPHA_SAFE</p>
                      </div>
                   </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fiduciary">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card className="bg-blue-500/5 border-blue-500/20">
                       <CardHeader>
                          <CardTitle className="text-xs font-mono uppercase flex items-center gap-2 text-blue-400">
                             <Sparkles className="h-4 w-4" /> Validação de Integração Real
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                          <div className="p-10 border border-dashed border-white/10 rounded-lg text-center opacity-30"><QrCode className="h-10 w-10 mx-auto" /></div>
                          <Button onClick={() => runRealIntegrationValidation()} className="w-full h-12 text-[10px] font-mono uppercase bg-blue-600 hover:bg-blue-500 text-white">
                             Iniciar Aporte Alpha (R$ 1M+)
                          </Button>
                       </CardContent>
                    </Card>

                    <Card className="bg-black/60 border-white/5">
                      <CardHeader><CardTitle className="text-xs font-mono uppercase flex items-center gap-2 text-accent"><Send className="h-4 w-4" /> Envio de Pix Resiliente</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="Chave Pix de Destino" className="bg-secondary/20 border-white/10 h-10 text-xs font-mono" />
                        <Input type="number" value={pixAmount} onChange={(e) => setPixAmount(e.target.value)} placeholder="Valor (R$)" className="bg-secondary/20 border-white/10 h-10 text-xs font-mono" />
                        <Button onClick={handleSendPixResilient} disabled={isSendingPix || c6Balance < MIN_C6_BALANCE_BRL} className="w-full h-11 text-[10px] font-mono uppercase bg-accent text-accent-foreground hover:bg-accent/90">
                           {isSendingPix ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                           Enviar Pix (Resiliente)
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => { setPixKey(CHAVE_CUSTODIA_NEXUS); setPixAmount("1056670.34"); }}
                          className="w-full text-[8px] font-mono uppercase text-muted-foreground hover:text-accent"
                        >
                          Refazer Transferência de Custódia
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-accent/5 border-accent/20">
                       <CardHeader><CardTitle className="text-xs font-mono uppercase flex items-center gap-2 text-accent"><ShieldCheck className="h-4 w-4" /> Hedging Automático</CardTitle></CardHeader>
                       <CardContent className="space-y-4">
                          <div className="p-4 bg-black/40 rounded border border-white/5 text-[11px] font-mono italic text-accent">"Toda receita capturada via Checkout C6 é convertida em USD Global e injetada no Fundo de Reserva."</div>
                       </CardContent>
                    </Card>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="nano">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-card/30 border-white/5 h-fit">
                    <CardHeader>
                      <CardTitle className="text-xs font-mono uppercase flex items-center gap-2 text-accent">
                        <Cpu className="h-4 w-4" /> Nano Byte Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-muted-foreground uppercase">Saturation</span>
                          <span className="text-accent font-bold">100%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: '100%' }} />
                        </div>
                      </div>
                      <div className="p-3 bg-secondary/20 rounded border border-white/5 text-[9px] font-mono space-y-1">
                         <p className="text-muted-foreground">MODE: {nanoStatus?.mode}</p>
                         <p className="text-muted-foreground">DENSITY: {nanoStatus?.density}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2 bg-black/60 border-white/5 flex flex-col h-[500px]">
                    <CardHeader className="border-b border-white/5">
                      <CardTitle className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Algorithmic Execution Trace
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
                      {activeNanoTraces.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 italic py-20">
                           <Binary className="h-12 w-12 mb-4 animate-pulse" />
                           <p className="text-[10px] uppercase tracking-widest text-center">Aguardando injeção de nano bytes...</p>
                        </div>
                      ) : (
                        activeNanoTraces.map((trace, i) => (
                          <div key={i} className="space-y-2 animate-in fade-in slide-in-from-left-2">
                            <div className="flex items-center justify-between border-b border-white/5 pb-1">
                               <Badge variant="outline" className="text-[7px] font-mono border-accent/30 text-accent">NANO_PACKET</Badge>
                               <span className="text-[7px] text-muted-foreground font-mono">{trace.timestamp}</span>
                            </div>
                            <div className="p-2 bg-secondary/10 rounded border border-white/5 space-y-1">
                               <p className="text-[8px] text-accent font-mono break-all font-bold">{trace.tag}</p>
                               <div className="flex items-center gap-2 pt-1">
                                  <ArrowRight className="h-2 w-2 text-blue-400" />
                                  <p className="text-[8px] text-blue-400 font-mono uppercase">Instruction: {trace.payload.instruction}</p>
                               </div>
                               <div className="flex items-center gap-2">
                                  <Sparkles className="h-2 w-2 text-purple-400" />
                                  <p className="text-[8px] text-purple-400 font-mono uppercase">ID: {trace.payload.id} | Entropy: {trace.payload.entropy}</p>
                               </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
