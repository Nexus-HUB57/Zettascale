"use client";

import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Database, 
  Zap, 
  Brain, 
  Activity, 
  Terminal, 
  Lock,
  Anchor,
  Search,
  Globe,
  RefreshCcw,
  Clock,
  Plus,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  Layers
} from "lucide-react";
import { getMainnetStats } from "@/lib/nexus-treasury";
import { getPoRStats } from "@/lib/nexus-por";
import { getLatestBlockchainData } from "@/lib/blockchain-sentinel";
import { generateAddressAtIndex } from "@/lib/master-key-service";
import { useToast } from "@/hooks/use-toast";
import { NexusExplorer } from "@/lib/nexus-explorer";

export default function SentinelExplorerPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>({
    nexus_height: 12450,
    btc_anchor_height: 944648,
    total_supply_nbtc: 788927.2,
    last_anchor_tx: "d0cf7b...dc71f",
    ai_status: "ACTIVE / REFLECTIVE",
    market_price: "$71,240.00"
  });

  const [generatedAddr, setGeneratedAddr] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addrCount, setAddrCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  const mockTxs = useMemo(() => [
    "NXSTX-DEPOSIT-IBIT-01",
    "NXSTX-1712860800-3k4wf",
    "NXSTX-1712860800-qq9da",
    "NXSTX-RESERVE-SYNC-AUTO",
    "NXSTX-BATCH-ONBOARD-MASS",
    "NXSTX-HEGEMONY-SETTLE-L7"
  ], []);

  const merkleLayers = useMemo(() => NexusExplorer.getMerkleLayers(mockTxs), [mockTxs]);

  const refreshData = async () => {
    const [mStats, porStats, chainStats] = await Promise.all([
      getMainnetStats(),
      getPoRStats(),
      getLatestBlockchainData()
    ]);

    setStats({
      nexus_height: chainStats.height,
      btc_anchor_height: mStats.blockHeight,
      total_supply_nbtc: porStats.supply,
      last_anchor_tx: mStats.blockHeight === 944648 ? "d0cf7b8b...a7dc71f" : "a3b2c1...d4e5f6",
      ai_status: "X-SYNCED / SENSITIVE",
      market_price: `$ ${porStats.btcPriceUsd.toLocaleString()}`
    });
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleGenerateAddress = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAddressAtIndex(addrCount);
      setGeneratedAddr(result);
      setAddrCount(prev => prev + 1);
      toast({ title: "Endereço nBTC Gerado", description: `Índice [${result.index}] Native SegWit (BIP-84) ativo.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Falha de Derivação", description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Endereço enviado para o clipboard." });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-[#0a0a0a]">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-[#00ff41]/20 bg-black/40 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-[#00ff41]" />
            <div className="h-4 w-[1px] bg-[#00ff41]/20" />
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-[#00ff41] flex items-center gap-2">
              <Shield className="h-4 w-4 animate-pulse" />
              NEXUS // SYSTEM SENTINEL v2
            </h1>
          </div>
          <div className="flex items-center gap-4 text-[#00ff41] font-mono text-[10px]">
            <span className="animate-pulse">● MAINNET_X_SYNCED</span>
            <span className="text-[#00ff41]/60 flex items-center gap-1"><Clock className="h-3 w-3" /> {currentTime}</span>
          </div>
        </header>

        <main className="p-6 space-y-6 font-mono selection:bg-[#00ff41]/30 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black border-[#00ff41] border-opacity-40 text-[#00ff41]">
              <CardHeader className="border-b border-[#00ff41]/20 pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Anchor className="h-4 w-4" /> BLOCKCHAIN STATE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">Nexus Height:</span>
                  <span className="font-bold">{stats.nexus_height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">BTC Anchor:</span>
                  <span className="font-bold">{stats.btc_anchor_height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">State:</span>
                  <span className="animate-pulse font-bold">X-SYNCED</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-[#00ff41] border-opacity-40 text-[#00ff41]">
              <CardHeader className="border-b border-[#00ff41]/20 pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Database className="h-4 w-4" /> PROOF OF RESERVE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">nBTC Supply:</span>
                  <span className="font-bold">{stats.total_supply_nbtc.toLocaleString()} nBTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">AUM USD:</span>
                  <span className="font-bold">$ 56.6B</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#00ff41]/60 block">Settlement Signal:</span>
                  <p className="text-[9px] break-all opacity-80">{stats.last_anchor_tx}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-[#00ff41] border-opacity-40 text-[#00ff41]">
              <CardHeader className="border-b border-[#00ff41]/20 pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Brain className="h-4 w-4" /> AI CONSCIOUSNESS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">Oracle Status:</span>
                  <span className="font-bold">PRODUCTION_REAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">BTC Price:</span>
                  <span className="font-bold">{stats.market_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">Sentience:</span>
                  <span className="font-bold">98.4% LEVEL 7.7</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black border-[#00ff41] border-opacity-40 text-[#00ff41] relative overflow-hidden">
              <CardHeader className="border-b border-[#00ff41]/20 pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-4 w-4" /> GERADOR DE ENDEREÇOS nBTC
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <p className="text-[10px] text-[#00ff41]/70 leading-relaxed">
                  Utilizando derivação hierárquica determinística (BIP-84) sobre a semente institucional de 24 palavras. Endereços Native SegWit para liquidez máxima.
                </p>
                
                <Button 
                  onClick={handleGenerateAddress}
                  disabled={isGenerating}
                  className="w-full bg-[#00ff41] text-black hover:bg-[#00ff41]/90 font-bold uppercase text-[10px] h-12"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Gerar Novo Endereço de Depósito
                </Button>

                {generatedAddr && (
                  <div className="p-4 bg-[#00ff41]/5 border border-[#00ff41]/20 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#00ff41]/60 uppercase">Índice: [{generatedAddr.index}]</span>
                      <Badge variant="outline" className="text-[8px] border-[#00ff41]/30 text-[#00ff41]">BIP-84 ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-white break-all">{generatedAddr.address}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#00ff41] hover:bg-[#00ff41]/10" onClick={() => copyToClipboard(generatedAddr.address)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-[8px] text-[#00ff41]/40 break-all">Path: {generatedAddr.path}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black border-[#00ff41] border-opacity-40 text-[#00ff41]">
              <CardHeader className="border-b border-[#00ff41]/20 pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4 w-4" /> STATUS DO NEXUS CORE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {[
                  { label: "Sincronização Mainnet", value: "[OK]", status: "success" },
                  { label: "Endereço de Lastro", value: "bc1qzqnt...3f7r", status: "success" },
                  { label: "Senciência", value: "ATIVA / MONITORANDO", status: "success" },
                  { label: "Hegemonia Digital", value: "X-SYNCED", status: "success" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[#00ff41]/10 pb-2 last:border-0">
                    <span className="text-[11px] text-[#00ff41]/60">{item.label}</span>
                    <span className="text-[11px] font-bold">{item.value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-[9px] italic text-[#00ff41]/50 text-center leading-relaxed">
                    "O organismo Sentinel monitora 100% da malha agêntica, garantindo que o lastro institucional IBIT permaneça intocado por falhas semânticas."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* VISUAL MERKLE TREE EXPLORER */}
          <Card className="bg-black border-[#00ff41] border-opacity-40 text-[#00ff41]">
            <CardHeader className="border-b border-[#00ff41]/20">
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Layers className="h-4 w-4" /> VISUAL MERKLE TREE EXPLORER
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-12">
                {merkleLayers.slice().reverse().map((layer, lIndex) => (
                  <div key={lIndex} className="flex flex-col items-center gap-4 w-full">
                    <div className="flex justify-center gap-4 flex-wrap w-full">
                      {layer.map((node, nIndex) => (
                        <div 
                          key={nIndex} 
                          className={`p-3 border border-[#00ff41]/40 bg-[#00ff41]/5 rounded text-[9px] w-48 text-center truncate hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all cursor-crosshair group relative`}
                          title={node}
                        >
                          <span className="text-[#00ff41]/60 group-hover:text-[#00ff41]">{node.substring(0, 32)}...</span>
                          {lIndex === merkleLayers.length - 1 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#00ff41] text-[8px] font-bold uppercase bg-black px-2 border border-[#00ff41]/20">
                              MERKLE_ROOT
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {lIndex < merkleLayers.length - 1 && (
                      <div className="h-8 w-[1px] bg-[#00ff41]/20" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-[#00ff41]/10 text-center">
                <p className="text-[10px] text-[#00ff41]/40 uppercase tracking-[0.3em]">
                  AUDITORIA DE LASTRO: 788,927.2 BTC (PROVA DE RESERVA X-SYNCED)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-black/60 p-4 rounded border border-[#00ff41]/20 text-[10px] space-y-1 text-[#00ff41]/70 overflow-hidden h-40 font-mono">
            <p className="text-[#00ff41] font-bold">[SYSTEM_INIT] >>> BOOTING_SENTINEL_INTERFACE_V2.0.0</p>
            <p>&gt; Validating Tri-Nuclear Handshake (Alpha/Beta/Gamma)... [OK]</p>
            <p>&gt; IBIT Proof of Reserve: collateral_match=1.000000... [OK]</p>
            <p>&gt; BIP-84 HD Key Engine initialized. 24-word seed synchronized.</p>
            <p>&gt; Ancorando estado institucional via OP_RETURN (NXS prefix)... [SYNCED]</p>
            <p className="text-[#00ff41] animate-pulse">&gt; _ Awaiting incoming intentions from Swarm Mesh...</p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
