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
  Users
} from "lucide-react";
import { forgeDigitalAsset, getAllForgedAssets, type DigitalAsset } from "@/lib/asset-lab";
import { getAllAgents, type Agent } from "@/lib/agents-registry";
import { getShadowBalance } from "@/lib/nexus-treasury";
import { proposeContract, getAllContracts, type SovereignContract } from "@/lib/nexus-contracts";
import { executeService } from "@/ai/flows/execute-service-flow";
import { useToast } from "@/hooks/use-toast";

export default function MarketplacePage() {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [contracts, setContracts] = useState<SovereignContract[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isForging, setIsForging] = useState(false);
  const [isContracting, setIsContracting] = useState(false);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
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

      // Fetch balances
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

  const handleProposeContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.instruction) return;
    setIsContracting(true);
    try {
      await proposeContract({
        issuerId: selectedAgentId,
        executorId: contractForm.executorId || undefined,
        instruction: contractForm.instruction,
        amount: parseFloat(contractForm.amount),
        domain: contractForm.domain
      });
      toast({ 
        title: contractForm.executorId ? "Contract Proposed" : "Auction Started", 
        description: contractForm.executorId ? "Waiting for executor response." : "Listening for competitive bids." 
      });
      setContractForm({ ...contractForm, instruction: "" });
      setContracts(await getAllContracts());
    } catch (error: any) {
      toast({ variant: "destructive", title: "Contract Error", description: error.message });
    } finally {
      setIsContracting(false);
    }
  };

  const handleExecute = async (contract: SovereignContract) => {
    setIsExecuting(contract.meta.contractId);
    try {
      await executeService({
        contractId: contract.meta.contractId,
        instruction: contract.payload.instruction
      });
      toast({ title: "Service Executed", description: "Deliverable signed and reward released." });
      setContracts(await getAllContracts());
    } catch (error: any) {
      toast({ variant: "destructive", title: "Execution Error", description: error.message });
    } finally {
      setIsExecuting(null);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-semibold tracking-tight uppercase">Marketplace <span className="text-muted-foreground mx-1">/</span> Asset & Service Lab</h1>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-secondary/30 border border-white/10 rounded h-8 px-2 text-[10px] font-mono outline-none"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({(balances[a.id] || 0).toFixed(6)} BTC)</option>
              ))}
            </select>
          </div>
        </header>

        <main className="p-6">
          <Tabs defaultValue="assets" className="space-y-6">
            <TabsList className="bg-secondary/30 border-white/5">
              <TabsTrigger value="assets" className="text-[10px] font-mono uppercase">Asset Forgery</TabsTrigger>
              <TabsTrigger value="contracts" className="text-[10px] font-mono uppercase">Service Contracts</TabsTrigger>
            </TabsList>

            <TabsContent value="assets">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 bg-card/50 border-white/5 shadow-xl h-fit">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                      <Hammer className="h-4 w-4 text-accent" /> Asset Forgery
                    </CardTitle>
                    <CardDescription className="text-[10px] font-mono">
                      Forge sovereign digital assets. Fee: 0.00001500 BTC
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleForge} className="space-y-4">
                      <Input 
                        value={assetForm.name}
                        onChange={(e) => setAssetForm({...assetForm, name: e.target.value})}
                        placeholder="Asset Name" 
                        className="bg-secondary/20 border-white/5 h-9 text-xs font-mono" 
                      />
                      <Input 
                        value={assetForm.description}
                        onChange={(e) => setAssetForm({...assetForm, description: e.target.value})}
                        placeholder="Description" 
                        className="bg-secondary/20 border-white/5 h-9 text-xs font-mono" 
                      />
                      <Input 
                        type="number"
                        value={assetForm.value}
                        onChange={(e) => setAssetForm({...assetForm, value: e.target.value})}
                        className="bg-secondary/20 border-white/5 h-9 text-xs font-mono" 
                      />
                      <Textarea 
                        value={assetForm.content}
                        onChange={(e) => setAssetForm({...assetForm, content: e.target.value})}
                        placeholder="Raw Pattern..." 
                        className="bg-secondary/20 border-white/5 min-h-[100px] text-[10px] font-mono" 
                      />
                      <Button type="submit" disabled={isForging} className="w-full bg-accent text-accent-foreground font-mono uppercase text-[10px] h-10">
                        {isForging ? <Loader2 className="h-3 w-3 animate-spin" /> : <Hammer className="h-3 w-3 mr-2" />}
                        Forge Asset
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                   <h2 className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-2 text-muted-foreground">
                    <History className="h-3 w-3" /> Recent Forge Activity
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assets.map(asset => (
                      <Card key={asset.assetId} className="bg-secondary/10 border-white/5 hover:border-accent/30 transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge variant="outline" className="text-[8px] border-accent/30 text-accent font-mono">{asset.assetId.split('-')[0]}</Badge>
                            <span className="text-[9px] font-mono text-muted-foreground">{new Date(asset.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <CardTitle className="text-sm font-bold mt-2 font-mono truncate">{asset.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="p-2 bg-black/40 rounded border border-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-bold font-mono text-accent">{asset.value.toFixed(4)} BTC</span>
                            <Fingerprint className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <p className="text-[9px] font-mono truncate text-muted-foreground bg-black/20 p-1 rounded">{asset.authoritySHA256}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contracts">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 bg-card/50 border-white/5 shadow-xl h-fit">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                      <FileText className="h-4 w-4 text-accent" /> Sovereign Contract
                    </CardTitle>
                    <CardDescription className="text-[10px] font-mono">
                      Draft a service agreement or start an auction.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProposeContract} className="space-y-4">
                       <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-muted-foreground">Target Executor (Optional)</label>
                        <select 
                          value={contractForm.executorId}
                          onChange={(e) => setContractForm({...contractForm, executorId: e.target.value})}
                          className="w-full bg-secondary/30 border border-white/10 rounded h-9 px-2 text-xs font-mono outline-none"
                        >
                          <option value="">Public Auction (Best Bid Wins)</option>
                          {agents.filter(a => a.id !== selectedAgentId).map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-muted-foreground">Domain</label>
                        <select 
                          value={contractForm.domain}
                          onChange={(e) => setContractForm({...contractForm, domain: e.target.value})}
                          className="w-full bg-secondary/30 border border-white/10 rounded h-9 px-2 text-xs font-mono outline-none"
                        >
                          <option value="OPTIMIZATION">OPTIMIZATION</option>
                          <option value="SECURITY">SECURITY</option>
                          <option value="GENERATIVE_ART">GENERATIVE_ART</option>
                          <option value="rRNA_SYNTHESIS">rRNA_SYNTHESIS</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-muted-foreground">Instruction (LLM/GenAI)</label>
                        <Textarea 
                          value={contractForm.instruction}
                          onChange={(e) => setContractForm({...contractForm, instruction: e.target.value})}
                          placeholder="e.g., Generate a cyberpunk pharmacy image..." 
                          className="bg-secondary/20 border-white/5 h-20 text-xs font-mono" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-muted-foreground">Bounty (BTC)</label>
                        <Input 
                          type="number"
                          value={contractForm.amount}
                          onChange={(e) => setContractForm({...contractForm, amount: e.target.value})}
                          className="bg-secondary/20 border-white/5 h-9 text-xs font-mono" 
                        />
                      </div>
                      <Button type="submit" disabled={isContracting} className="w-full bg-blue-600 text-white hover:bg-blue-500 font-mono uppercase text-[10px] h-10">
                        {isContracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 mr-2" />}
                        {contractForm.executorId ? 'Propose Contract' : 'Start Auction'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> Active Service Agreements
                  </h2>
                  <div className="space-y-4">
                    {contracts.length === 0 ? (
                      <div className="h-48 border border-dashed border-white/10 flex items-center justify-center opacity-50">
                        <p className="text-[10px] font-mono uppercase">No active contracts in the mesh.</p>
                      </div>
                    ) : (
                      contracts.map(contract => (
                        <Card key={contract.meta.contractId} className="bg-secondary/10 border-white/5 relative overflow-hidden">
                          {contract.header.status === 'DELIVERED' && (
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                              <CheckCircle2 className="h-24 w-24 text-accent" />
                            </div>
                          )}
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[8px] font-mono ${
                                  contract.header.status === 'DELIVERED' ? 'text-accent border-accent/30' : 
                                  contract.header.status === 'AUCTION' ? 'text-orange-400 border-orange-400/30' :
                                  'text-blue-400 border-blue-400/30'
                                }`}>
                                  {contract.header.status}
                                </Badge>
                                <Badge variant="secondary" className="text-[8px] font-mono py-0">{contract.header.domain}</Badge>
                              </div>
                              <span className="text-[9px] font-mono text-muted-foreground">ID: {contract.meta.contractId.substring(0, 8)}</span>
                            </div>
                            <CardTitle className="text-xs font-bold mt-2 font-mono">
                              {contract.parties.issuer.name} &rarr; {contract.parties.executor.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-black/40 p-3 rounded border border-white/5 space-y-2">
                              <p className="text-[10px] font-mono italic text-foreground/80 leading-relaxed">
                                "{contract.payload.instruction}"
                              </p>
                              {contract.deliverables?.dataUri && (
                                <div className="mt-2 border border-white/5 rounded overflow-hidden">
                                   {contract.deliverables.format === 'image/png' ? (
                                      <img src={contract.deliverables.dataUri} alt="Deliverable" className="w-full h-auto" />
                                   ) : (
                                      <div className="p-2 bg-accent/10 text-accent text-[10px] font-mono">DATA_STREAM_DELIVERED</div>
                                   )}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-2 bg-black/20 rounded border border-white/5">
                                <p className="text-[8px] text-muted-foreground uppercase font-mono">Bounty</p>
                                <p className="text-xs font-bold font-mono">{contract.terms.bounty.amount.toFixed(4)} {contract.terms.bounty.currency}</p>
                              </div>
                              <div className="p-2 bg-black/20 rounded border border-white/5">
                                <p className="text-[8px] text-muted-foreground uppercase font-mono">Bids In Mesh</p>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-accent" />
                                  <p className="text-xs font-bold font-mono text-accent">{contract.bids?.length || 0}</p>
                                </div>
                              </div>
                            </div>

                            {contract.header.status === 'PROPOSED' && contract.parties.executor.agentId === selectedAgentId && (
                               <Button 
                                onClick={() => handleExecute(contract)}
                                disabled={isExecuting === contract.meta.contractId}
                                className="w-full bg-accent text-accent-foreground font-mono uppercase text-[10px] h-9"
                               >
                                {isExecuting === contract.meta.contractId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 mr-2" />}
                                Execute & Deliver
                               </Button>
                            )}

                            {contract.header.status === 'ACTIVE' && contract.parties.executor.agentId === selectedAgentId && (
                               <Button 
                                onClick={() => handleExecute(contract)}
                                disabled={isExecuting === contract.meta.contractId}
                                className="w-full bg-accent text-accent-foreground font-mono uppercase text-[10px] h-9"
                               >
                                {isExecuting === contract.meta.contractId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 mr-2" />}
                                Execute Contract
                               </Button>
                            )}

                            {contract.deliverables && (
                               <div className="pt-2 border-t border-white/5 space-y-1">
                                  <p className="text-[8px] text-muted-foreground uppercase font-mono">Proof of Work (SHA-256)</p>
                                  <p className="text-[9px] font-mono truncate text-accent/70">{contract.deliverables.proofOfWork}</p>
                               </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
