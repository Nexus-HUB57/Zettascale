"use client";

import { useState } from "react";
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
  Search, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Network,
  Activity,
  Terminal,
  Code2,
  Share2,
  Database,
  Link,
  Globe,
  FileSearch,
  Scan,
  Sparkles
} from "lucide-react";
import { runAgnusReview } from "@/ai/flows/agnus-review-flow";
import { runCodingNerd } from "@/ai/flows/phd-nerd-ollama-flow";
import { executeIntelligenceCrawl, type CrawlResult } from "@/lib/crawl-service";
import { useToast } from "@/hooks/use-toast";

export default function OpenSourcePage() {
  const [repoUrl, setRepoUrl] = useState("Nexus-HUB57/Zettascale");
  const [code, setCode] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("https://docs.nexus.ai/zettascale");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const { toast } = useToast();

  const handleReview = async () => {
    if (!code.trim()) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const result = await runAgnusReview({
        repoUrl,
        codeContent: code,
        depth: 'deep'
      });
      setReviewResult(result);
      toast({ title: "Review Agnus Concluído", description: `Veredito: ${result.verdict}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Review Fault", description: e.message });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCrawl = async () => {
    if (!crawlUrl.trim()) return;
    setIsCrawling(true);
    setCrawlResult(null);
    try {
      const result = await executeIntelligenceCrawl({
        url: crawlUrl,
        depth: 2,
        maxPages: 5,
        useHeadless: true,
        filterThreshold: 0.48
      });
      setCrawlResult(result);
      toast({ title: "Crawl Concluído", description: `Markdown gerado para ${result.wordCount} palavras.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Crawl Fault", description: e.message });
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAgnusNerdSync = async () => {
    if (!reviewResult) return;
    setIsRefactoring(true);
    try {
      toast({ title: "Sincronia Iniciada", description: "Agnus delegando refatoração ao PHD Nerd Ollama..." });
      
      const refactor = await runCodingNerd({
        task: `Corrigir falhas apontadas pelo Agente Agnus: ${reviewResult.comments.map((c: any) => c.message).join('. ')}`,
        existingCode: code,
        language: 'typescript',
        autonomousPush: true
      });

      setCode(refactor.proposedCode);
      toast({ title: "Alpha-Gain Atingido", description: "Código refatorado e manifestado autonomamente." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Fault", description: e.message });
    } finally {
      setIsRefactoring(false);
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
              <GitBranch className="h-4 w-4 text-accent animate-pulse" />
              Painel Open Source <span className="text-muted-foreground mx-1">/</span> Agnus AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-mono border-blue-400/30 text-blue-400 uppercase bg-blue-400/5 mr-2">
              LANGCHAIN + CRAWL4AI SYNC
            </Badge>
            <Badge variant="outline" className="text-[9px] font-mono border-accent/30 text-accent uppercase bg-accent/5">
              ORCHESTRATOR: AGNUS_L8
            </Badge>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              { label: "Graph Hops", value: "2 (Deep)", icon: Network },
              { label: "Web Nodes Indexed", value: "1.2k", icon: Globe },
              { label: "Blast Radius", value: reviewResult ? `${reviewResult.blastRadiusScore}%` : "0%", icon: Activity },
              { label: "Indexed Symbols", value: "14.2k", icon: Database },
            ].map(stat => (
              <Card key={stat.label} className="bg-card/30 border-white/5">
                <CardContent className="pt-4 pb-4 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">{stat.label}</p>
                    <p className="text-lg font-bold font-mono text-accent">{stat.value}</p>
                  </div>
                  <stat.icon className="h-4 w-4 text-accent opacity-50" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="review" className="space-y-6">
            <TabsList className="bg-secondary/30 border-white/5">
              <TabsTrigger value="review" className="text-[10px] font-mono uppercase">Graph Code Review</TabsTrigger>
              <TabsTrigger value="crawl" className="text-[10px] font-mono uppercase">Web Intelligence (Crawl4AI)</TabsTrigger>
            </TabsList>

            <TabsContent value="review">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-accent">
                        <Terminal className="h-4 w-4" /> Code Review Terminal
                      </CardTitle>
                      <CardDescription className="text-[10px] font-mono">
                        Submeta vetores de código para análise de blast radius via Agnus.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <Input 
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="Repository Path"
                          className="bg-secondary/20 border-white/5 h-9 text-xs font-mono flex-1"
                        />
                        <Button 
                          onClick={handleReview} 
                          disabled={isReviewing || !code.trim()}
                          className="bg-accent text-accent-foreground font-mono uppercase text-[10px] h-9"
                        >
                          {isReviewing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Search className="h-3 w-3 mr-2" />}
                          Run Graph Review
                        </Button>
                      </div>
                      <Textarea 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="// Insira código para auditoria..."
                        className="bg-secondary/20 border-white/5 min-h-[350px] text-[11px] font-mono leading-relaxed"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {reviewResult ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95">
                      <Card className={`border-2 ${reviewResult.verdict === 'APPROVED' ? 'bg-accent/5 border-accent/20' : 'bg-red-500/5 border-red-500/20'}`}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xs uppercase font-mono tracking-widest">Agnus Verdict</CardTitle>
                            <Badge className={reviewResult.verdict === 'APPROVED' ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'}>
                              {reviewResult.verdict}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Dependency Graph Analysis</p>
                            <div className="flex justify-between text-[11px] font-mono">
                              <span>Symbols Affected:</span>
                              <span className="text-accent">{reviewResult.dependencyGraph.affectedSymbols.length}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {reviewResult.comments.map((comment: any, i: number) => (
                              <div key={i} className="p-2 bg-secondary/20 rounded border border-white/5 flex gap-3">
                                {comment.severity === 'error' ? <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" /> : <Zap className="h-3 w-3 text-blue-400 shrink-0" />}
                                <p className="text-[10px] font-mono text-foreground/80 leading-tight">
                                  <span className="font-bold text-accent">[{comment.path}]:</span> {comment.message}
                                </p>
                              </div>
                            ))}
                          </div>

                          {reviewResult.verdict !== 'APPROVED' && (
                            <Button 
                              onClick={handleAgnusNerdSync}
                              disabled={isRefactoring}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase text-[10px] h-10"
                            >
                              {isRefactoring ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Code2 className="h-3 w-3 mr-2" />}
                              Sync Refactor (Nerd Ollama)
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-card/50 border-white/5 border-dashed h-full flex flex-col items-center justify-center py-20 opacity-30">
                      <GitBranch className="h-12 w-12 mb-4" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Aguardando vetor de entrada...</p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crawl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-accent">
                        <Globe className="h-4 w-4" /> Web Intelligence Extraction
                      </CardTitle>
                      <CardDescription className="text-[10px] font-mono">
                        Utilize o motor Crawl4AI para extrair documentação e conhecimento técnico de URLs externas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <Input 
                          value={crawlUrl}
                          onChange={(e) => setCrawlUrl(e.target.value)}
                          placeholder="Target URL (https://...)"
                          className="bg-secondary/20 border-white/5 h-10 text-xs font-mono flex-1"
                        />
                        <Button 
                          onClick={handleCrawl} 
                          disabled={isCrawling || !crawlUrl.trim()}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase text-[10px] h-10 px-6"
                        >
                          {isCrawling ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Scan className="h-3 w-3 mr-2" />}
                          Run Crawl4AI
                        </Button>
                      </div>
                      
                      {crawlResult && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-[9px] font-mono border-accent/30 text-accent">
                              STATUS: CRAWL_SUCCESS
                            </Badge>
                            <span className="text-[10px] font-mono text-muted-foreground">{crawlResult.wordCount} WORDS EXTRACTED</span>
                          </div>
                          <Textarea 
                            readOnly
                            value={crawlResult.markdown}
                            className="bg-black/60 border-white/5 min-h-[300px] text-[11px] font-mono leading-relaxed text-accent/90"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-secondary/10 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-xs uppercase font-mono tracking-widest flex items-center gap-2">
                        <FileSearch className="h-4 w-4 text-blue-400" /> Crawl Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-black/40 rounded border border-white/5 space-y-3">
                        <div className="flex justify-between text-[10px] font-mono uppercase">
                          <span className="text-muted-foreground">Mode:</span>
                          <span className="text-blue-400 font-bold">ASYNC_WEB_CRAWLER</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono uppercase">
                          <span className="text-muted-foreground">Strategy:</span>
                          <span className="text-blue-400">BFS (Breadth-First)</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono uppercase">
                          <span className="text-muted-foreground">Markdown Filter:</span>
                          <span className="text-accent">PRUNING (0.48)</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3 w-3 text-accent" />
                          <p className="text-[10px] font-bold uppercase font-mono text-accent">LLM Ready</p>
                        </div>
                        <p className="text-[11px] font-mono leading-tight text-muted-foreground">
                          A saída do Crawl4AI é pré-processada pelo Agnus para remover menus, rodapés e anúncios, entregando apenas o "fit_markdown" ideal para o contexto neural.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
