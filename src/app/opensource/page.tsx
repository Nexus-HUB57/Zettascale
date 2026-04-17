"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal,
  Globe,
  Scan,
  Cloud,
  HeartPulse,
  Syringe,
  Microscope,
  Key,
  RefreshCcw,
  Binary,
  Layers,
  Settings,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { runAgnusReview } from "@/ai/flows/agnus-review-flow";
import { runHermesDoctor } from "@/ai/flows/hermes-doctor-flow";
import { executeIntelligenceCrawl, type CrawlResult } from "@/lib/crawl-service";
import { getWorkspaceStatus, triggerAgenticAction, type WorkspaceStatus } from "@/lib/agentic-workspace-service";
import { runWorkspaceAI } from "@/ai/flows/workspace-orchestrator-flow";
import { resetSystemAction } from "@/lib/engine-actions";
import { useToast } from "@/hooks/use-toast";

export default function OpenSourcePage() {
  const [repoUrl, setRepoUrl] = useState("Nexus-HUB57/Zettascale");
  const [code, setCode] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("https://docs.nexus.ai/zettascale");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDoctoring, setIsDoctoring] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [doctorResult, setDoctorResult] = useState<any>(null);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  
  const [wsStatus, setWsStatus] = useState<WorkspaceStatus | null>(null);
  const [vibePrompt, setVibePrompt] = useState("");
  const [isVibeProcessing, setIsVibeProcessing] = useState(false);
  const [vibeResult, setVibeResult] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);

  const { toast } = useToast();

  const loadWs = async () => {
    const status = await getWorkspaceStatus();
    setWsStatus(status);
  };

  useEffect(() => {
    loadWs();
    const interval = setInterval(loadWs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: any) => {
    try {
      await triggerAgenticAction(action, {});
      toast({ title: "Diretiva Executada", description: `Ação ${action} disparada no ADE.` });
      await loadWs();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro no ADE", description: e.message });
    }
  };

  const handleSystemReset = async () => {
    setIsResetting(true);
    try {
      await resetSystemAction();
      toast({ title: "Sistema Reiniciado", description: "Senciência global e estados de memória resetados." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro de Reset", description: e.message });
    } finally {
      setIsResetting(false);
    }
  };

  const handleReview = async () => {
    if (!code.trim()) return;
    setIsReviewing(true);
    try {
      const result = await runAgnusReview({
        repoUrl,
        codeContent: code,
        depth: 'deep',
        autoCure: true
      });
      setReviewResult(result);
      toast({ title: "Review Agnus Concluído", description: `Veredito: ${result.verdict}.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Review Fault", description: e.message });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleHermesCure = async () => {
    if (!code.trim()) return;
    setIsDoctoring(true);
    try {
      const result = await runHermesDoctor({ code });
      setDoctorResult(result);
      toast({ title: "Cura Hermes Aplicada", description: "Vetor de código corrigido." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Hermes Fault", description: e.message });
    } finally {
      setIsDoctoring(false);
    }
  };

  const handleCrawl = async () => {
    if (!crawlUrl.trim()) return;
    setIsCrawling(true);
    try {
      const result = await executeIntelligenceCrawl({
        url: crawlUrl,
        depth: 1,
        maxPages: 1,
        useHeadless: true,
        filterThreshold: 0.48
      });
      setCrawlResult(result);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Crawl Fault", description: e.message });
    } finally {
      setIsCrawling(false);
    }
  };

  const handleVibeCoding = async () => {
    if (!vibePrompt.trim()) return;
    setIsVibeProcessing(true);
    try {
      const result = await runWorkspaceAI({
        prompt: vibePrompt,
        mode: 'VIBE_CODING',
        workspaceMap: "Nix: Node20/Ollama/Firebase/LangChain, App: Next.js V8.1"
      });
      setVibeResult(result);
    } finally {
      setIsVibeProcessing(false);
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
            <h1 className="text-sm font-bold tracking-tighter uppercase flex items-center gap-2 text-blue-400">
              <Cloud className="h-4 w-4" /> Agentic Workspace (ADE) <span className="text-muted-foreground mx-1">/</span> AgnusAI V8.1
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSystemReset} disabled={isResetting} variant="outline" className="h-8 border-destructive/20 text-destructive font-mono text-[9px] uppercase hover:bg-destructive/10">
              {isResetting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RotateCcw className="h-3 w-3 mr-2" />}
              Reiniciar Sistema
            </Button>
            <Badge variant="outline" className="text-[9px] font-mono border-blue-500/30 text-blue-400 uppercase">ENV: X-SYNCED</Badge>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto space-y-6">
          <Tabs defaultValue="ade" className="space-y-6">
            <TabsList className="bg-secondary/30 border-white/5 p-1 h-11">
              <TabsTrigger value="ade" className="text-[10px] font-mono uppercase px-6">ADE Control</TabsTrigger>
              <TabsTrigger value="hermes" className="text-[10px] font-mono uppercase px-6">Hermes Doctor</TabsTrigger>
              <TabsTrigger value="review" className="text-[10px] font-mono uppercase px-6">Graph Review</TabsTrigger>
              <TabsTrigger value="crawl" className="text-[10px] font-mono uppercase px-6">Intelligence</TabsTrigger>
            </TabsList>

            <TabsContent value="ade" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 bg-card/30 border-white/5">
                  <CardHeader><CardTitle className="text-xs font-mono uppercase text-muted-foreground">Infrastructure Vitals</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-2 text-[9px] font-mono">
                      <div className="flex justify-between"><span>Status:</span> <span className="text-accent">{wsStatus?.vmStatus}</span></div>
                      <div className="flex justify-between"><span>Nix Sync:</span> <span className="text-blue-400">{wsStatus?.nixSync}</span></div>
                      <div className="flex justify-between"><span>Ollama:</span> <span className="text-purple-400">ACTIVE</span></div>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-bold uppercase text-muted-foreground px-1">Active Layers</h4>
                       <div className="flex flex-wrap gap-1">
                          {wsStatus?.packages.map(p => (
                            <Badge key={p} variant="secondary" className="text-[7px] font-mono py-0">{p}</Badge>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <Button onClick={() => handleAction('RECONFIGURE_NIX')} variant="outline" className="w-full h-9 text-[9px] font-mono uppercase border-destructive/20 text-destructive hover:bg-destructive/10">
                        <RotateCcw className="h-3 w-3 mr-2" /> Hard Reconfig Agnus
                      </Button>
                      <Button onClick={() => handleAction('FIREBASE_REAUTH')} variant="outline" className="w-full h-9 text-[9px] font-mono uppercase border-blue-500/20 text-blue-400">
                        <Key className="h-3 w-3 mr-2" /> Firebase Re-auth
                      </Button>
                      <Button onClick={() => handleAction('ENABLE_WEBFRAMEWORKS')} variant="outline" className="w-full h-9 text-[9px] font-mono uppercase border-orange-500/20 text-orange-400">
                        <Settings className="h-3 w-3 mr-2" /> Enable WebFrameworks
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-card/50 border-white/5 flex flex-col min-h-[500px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Binary className="h-64 w-64 text-blue-400" />
                  </div>
                  <CardHeader className="border-b border-white/5 py-4">
                    <CardTitle className="text-xs font-mono uppercase flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-blue-400" /> Vibe Coding & Code Genesis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-[11px] scrollbar-hide">
                      {vibeResult ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <p className="text-blue-400 font-bold uppercase mb-2">AgnusAI Decision: {vibeResult.proposedAction}</p>
                            <p className="text-foreground/90 italic">"{vibeResult.reasoning}"</p>
                          </div>
                          {vibeResult.codeSnippet && (
                            <pre className="p-4 bg-black/60 rounded border border-white/10 text-accent/90 overflow-x-auto">
                              <code>{vibeResult.codeSnippet}</code>
                            </pre>
                          )}
                          <div className="flex justify-end"><span className="text-[8px] text-blue-400/50 uppercase">{vibeResult.gnoxSignal}</span></div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                          <Terminal className="h-16 w-16 mb-4" />
                          <p className="uppercase tracking-widest text-xs font-bold">Awaiting Senciency Stimulus...</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-black/40 border-t border-white/5">
                      <form onSubmit={(e) => { e.preventDefault(); handleVibeCoding(); }} className="flex gap-4">
                        <Input value={vibePrompt} onChange={(e) => setVibePrompt(e.target.value)} placeholder="Task: Refactor rRNA medula or initialize LangChain python bridge..." className="bg-secondary/30 border-white/5 text-xs font-mono h-12" disabled={isVibeProcessing} />
                        <Button disabled={isVibeProcessing} className="bg-blue-600 hover:bg-blue-500 h-12 px-8 font-mono text-xs uppercase font-bold">
                          {isVibeProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hermes">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card/50 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono text-orange-400 flex items-center gap-2">
                      <HeartPulse className="h-4 w-4" /> Surgical Code Intervention
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={handleHermesCure} disabled={isDoctoring || !code.trim()} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-mono uppercase text-[10px] h-11 font-bold">
                      {isDoctoring ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Syringe className="h-3 w-3 mr-2" />}
                      Execute Hermes Doctor Protocol
                    </Button>
                    <Textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Insert fragile code for diagnostic and patching..." className="bg-secondary/20 border-white/5 min-h-[450px] text-[11px] font-mono leading-relaxed" />
                  </CardContent>
                </Card>
                <div className="space-y-6">
                   {doctorResult ? (
                    <Card className="bg-orange-500/5 border-orange-500/20 animate-in zoom-in-95">
                      <CardHeader className="pb-2 border-b border-white/5">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-[10px] font-mono uppercase text-orange-400 font-bold">NousResearch Diagnostic</CardTitle>
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[8px]">{doctorResult.healingScore}% CURE</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <p className="text-[10px] font-mono text-foreground/90 italic leading-relaxed">"{doctorResult.diagnosis}"</p>
                        <div className="space-y-2">
                          <p className="text-[9px] text-accent uppercase font-bold">Prescribed Patch:</p>
                          <pre className="text-[10px] font-mono text-accent bg-black/60 p-4 rounded-lg border border-accent/20 overflow-x-auto">
                            <code>{doctorResult.prescription}</code>
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card/50 border-white/5 border-dashed h-full flex flex-col items-center justify-center py-40 opacity-20">
                      <Microscope className="h-16 w-16 text-orange-400 mb-4" />
                      <p className="text-[10px] font-mono uppercase tracking-widest text-center">Awaiting Sick Vector...</p>
                    </Card>
                  )}
                </div>
               </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-6">
               <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono text-accent flex items-center gap-2">
                    <GitBranch className="h-4 w-4" /> Agnus Graph-Based SDLC Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="bg-secondary/20 border-white/5 h-11 text-xs font-mono flex-1" />
                    <Button onClick={handleReview} disabled={isReviewing || !code.trim()} className="bg-accent text-accent-foreground font-mono uppercase text-[10px] h-11 px-10 font-bold">
                      {isReviewing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Scan className="h-3 w-3 mr-2" />}
                      Start Deep Audit
                    </Button>
                  </div>
                  {reviewResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                      <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Verdict</p>
                        <p className={`text-sm font-bold font-mono ${reviewResult.verdict === 'APPROVED' ? 'text-accent' : 'text-destructive'}`}>{reviewResult.verdict}</p>
                      </div>
                      <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Blast Radius</p>
                        <p className="text-sm font-bold font-mono text-orange-400">{reviewResult.blastRadiusScore}%</p>
                      </div>
                      <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">LangChain Sync</p>
                        <p className={`text-sm font-bold font-mono ${reviewResult.langchainValidation?.isConsistent ? 'text-blue-400' : 'text-destructive'}`}>{reviewResult.langchainValidation?.isConsistent ? 'OK' : 'FAIL'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crawl">
               <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono text-blue-400 flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Crawl4AI Intelligence Harvest
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input value={crawlUrl} onChange={(e) => setCrawlUrl(e.target.value)} className="bg-secondary/20 border-white/5 h-11 text-xs font-mono flex-1" />
                    <Button onClick={handleCrawl} disabled={isCrawling} className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] h-11 px-10 font-bold uppercase">
                      {isCrawling ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Scan className="h-3 w-3 mr-2" />}
                      Harvest Intelligence
                    </Button>
                  </div>
                  {crawlResult && (
                    <Textarea readOnly value={crawlResult.markdown} className="bg-black/60 min-h-[400px] text-[11px] font-mono text-accent/90 border-blue-500/20 leading-relaxed scrollbar-hide" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}