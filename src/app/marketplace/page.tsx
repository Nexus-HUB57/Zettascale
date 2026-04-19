"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Hammer, 
  History,
  Loader2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Zap,
  Fingerprint,
  Users,
  QrCode,
  Coins,
  ArrowRightLeft
} from "lucide-react";
import { forgeDigitalAsset, getAllForgedAssets, type DigitalAsset } from "@/lib/asset-lab";
import { getAllAgents, type Agent } from "@/lib/agents-registry";
import { getShadowBalance } from "@/lib/nexus-treasury";
import { proposeContract, getAllContracts, type SovereignContract } from "@/lib/nexus-contracts";
import { executeService } from "@/ai/flows/execute-service-flow";
import { generatePixReceivingPayload, validatePixDeposit, type PixPayload } from "@/lib/pix-service";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

export default function MarketplacePage() {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [contracts, setContracts] = useState<SovereignContract[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isForging, setIsForging] = useState(false);
  const [isContracting, setIsContracting] = useState(false);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixPayload, setPixPayload] = useState<PixPayload | null>(null);
  const [pixAmount, setPixAmount] = useState("100.00");
  const { toast } = useToast();

  const [assetForm, setAssetForm] = useState({ name: "", description: "", content: "", value: "0.0005" });
  const [contractForm, setContractForm] = useState({ executorId: "", instruction: "", amount: "0.0001", domain: "OPTIMIZATION" });

  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    const initData = async () => {
      const [allAssets, allContracts, allAgents] = await Promise.all([
        getAllForgedAssets(),
        getAllContracts(),
        getAllAgents()
      ]);
      setAssets(allAssets);
      setContracts(allContracts);
      setAgents(allAgents);
      if (allAgents.length > 0) setSelectedAgentId(allAgents[0].id);

      const balanceMap: Record<string, number> = {};
      for (const a of allAgents) {
        balanceMap[a.id] = await getShadowBalance(a.id);
      }
      setBalances(balanceMap);
    };
    initData();

    const interval = setInterval(async () => {
       setContracts(await getAllContracts());
       setAssets(await getAllForgedAssets());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleForge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForging(true);
    try {
      const result = await forgeDigitalAsset({
        agentId: selectedAgentId,
        name: assetForm.name,
        description: assetForm.description,
        rawContent: assetForm.content,
        estimatedValue: parseFloat(assetForm.value)
      });
      if (result.success) {
        toast({ title: "Asset Forged", description: "Cryptographic anchor established." });
        setAssetForm({ name: "", description: "", content: "", value: "0.0005" });
        setAssets(await getAllForgedAssets());
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Forge Error", description: error.message });
    } finally {
      setIsForging(false);
    }
  };

  const handleGeneratePix = async () => {
    setIsGeneratingPix(true);
    try {
      const payload = await generatePixReceivingPayload(parseFloat(pixAmount), selectedAgentId);
      setPixPayload(payload);
      toast({ title: "Pix Payload Ready", description: "Inbound BRL gateway established." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Pix Error", description: e.message });
    } finally {
      setIsGeneratingPix(false);
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
            <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-accent" />
              Marketplace <span className="text-muted-foreground mx-1">/</span> Sovereign Exchange
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-[10px] font-mono border-accent/30 text-accent uppercase bg-accent/5">
              Liquidity: {(balances[selectedAgentId] || 0).toFixed(6)} BTC
            </Badge>
            <select 
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-secondary/30 border border-white/10 rounded h-8 px-2 text-[10px] font-mono outline-none"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </header>

        <main className="p-6 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
          <Tabs defaultValue="assets" className="space-y-6">
            <TabsList className="bg-secondary/30 border-white/5 p-1 h-11">
              <TabsTrigger value="assets" className="text-[10px] font-mono uppercase px-6">Asset Forgery</TabsTrigger>
              <TabsTrigger value="contracts" className="text-[10px] font-mono uppercase px-6">Service Contracts</TabsTrigger>
              <TabsTrigger value="liquidity" className="text-[10px] font-mono uppercase px-6">BRL Liquidity (PIX)</TabsTrigger>
            </TabsList>

            <TabsContent value="assets">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 bg-card/30 border-white/5 shadow-2xl h-fit">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-accent">
                      <Hammer className="h-4 w-4" /> Asset Forgery
                    </CardTitle>
                    <CardDescription className="text-[10px] font-mono">Forge sovereign digital assets. Fee: 1500 sats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleForge} className="space-y-4">
                      <Input 
                        value={assetForm.name}
                        onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                        placeholder="Asset Name" 
                        className="bg-secondary/20 border-white/5 h-10 text-xs font-mono" 
                      />
                      <Input 
                        value={assetForm.description}
                        onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                        placeholder="Purpose" 
                        className="bg-secondary/20 border-white/5 h-10 text-xs font-mono" 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          type="number"
                          value={assetForm.value}
                          onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                          className="bg-secondary/20 border-white/5 h-10 text-xs font-mono" 
                        />
                        <div className="flex items-center justify-center bg-black/40 border border-white/5 rounded text-[10px] font-mono text-muted-foreground">BTC_VALUE</div>
                      </div>
                      <Textarea 
                        value={assetForm.content}
                        onChange={(e) => setAssetForm({...assetForm, content: e.target.value})}
                        placeholder="Sovereign Pattern Content..." 
                        className="bg-secondary/20 border-white/5 min-h-[120px] text-[10px] font-mono resize-none" 
                      />
                      <Button type="submit" disabled={isForging} className="w-full bg-accent text-accent-foreground font-bold uppercase text-[10px] h-12 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        {isForging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        Forge Asset
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assets.map(asset => (
                      <Card key={asset.assetId} className="bg-secondary/10 border-white/5 relative overflow-hidden group hover:border-accent/40 transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-[8px] border-accent/30 text-accent font-mono uppercase">ASSET_V1</Badge>
                            <span className="text-[9px] font-mono text-muted-foreground">{new Date(asset.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <CardTitle className="text-sm font-bold mt-2 font-mono uppercase tracking-tight">{asset.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-[10px] text-muted-foreground font-mono leading-tight">{asset.description}</p>
                          <div className="p-2 bg-black/60 rounded border border-white/5 flex justify-between items-center">
                            <span className="text-[11px] font-bold font-mono text-accent">{asset.value.toFixed(4)} BTC</span>
                            <Fingerprint className="h-3 w-3 text-accent opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="liquidity">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="bg-card/30 border-white/5 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-blue-400">
                      <QrCode className="h-4 w-4" /> BRL Liquidity Bridge (PIX)
                    </CardTitle>
                    <CardDescription className="text-[10px] font-mono">Injete Reais (BRL) para converter em liquidez algorítmica.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">Valor em BRL (R$)</label>
                      <Input 
                        type="number"
                        value={pixAmount}
                        onChange={(e) => setPixAmount(e.target.value)}
                        className="bg-secondary/20 border-white/5 h-12 text-lg font-mono text-blue-400 font-bold" 
                      />
                    </div>
                    <Button 
                      onClick={handleGeneratePix} 
                      disabled={isGeneratingPix} 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] h-12"
                    >
                      {isGeneratingPix ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
                      Gerar QR Code de Recebimento
                    </Button>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-center">
                       <p className="text-[10px] text-blue-400 font-mono italic">
                        "O valor em BRL é convertido em Satoshis e injetado na medula do agente via Fundo de Reserva."
                       </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/60 border-white/5 flex flex-col items-center justify-center p-8 min-h-[400px]">
                  {pixPayload ? (
                    <div className="space-y-6 text-center animate-in fade-in zoom-in">
                      <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <QRCodeSVG value={pixPayload.qrCode} size={200} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">ID da Transação</p>
                        <code className="bg-secondary/40 p-2 rounded block text-[11px] text-accent border border-white/5">{pixPayload.txId}</code>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono animate-pulse">AWAITING_SETTLEMENT</Badge>
                    </div>
                  ) : (
                    <div className="text-center opacity-20 space-y-4">
                      <QrCode className="h-24 w-24 mx-auto" />
                      <p className="text-xs font-mono uppercase tracking-widest">Aguardando Diretiva de Liquidez...</p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contracts">
               <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg opacity-40">
                  <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="text-xs font-mono uppercase text-muted-foreground">Service Contracts Ledger in Sync...</p>
               </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
