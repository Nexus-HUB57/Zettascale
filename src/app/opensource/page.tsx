"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Link
} from "lucide-react";
import { runAgnusReview } from "@/ai/flows/agnus-review-flow";
import { runCodingNerd } from "@/ai/flows/phd-nerd-ollama-flow";
import { useToast } from "@/hooks/use-toast";

export default function OpenSourcePage() {
  const [repoUrl, setRepoUrl] = useState("Nexus-HUB57/Zettascale");
  const [code, setCode] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
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
              LANGCHAIN .NET SUPPORT
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
              { label: "Blast Radius", value: reviewResult ? `${reviewResult.blastRadiusScore}%` : "0%", icon: Activity },
              { label: "Indexed Symbols", value: "14.2k", icon: Database },
              { label: "LangChain Sync", value: "ACTIVE", icon: Link },
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-accent">
                    <Terminal className="h-4 w-4" /> Code Review Terminal
                  </CardTitle>
                  <CardDescription className="text-[10px] font-mono">
                    Submeta vetores de código (TS, Python, C#) para análise de blast radius via Agnus.
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
                    placeholder="// Insira código ou cadeias LangChain .NET para auditoria..."
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

                  <Card className="bg-card/50 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-2">
                        <Share2 className="h-3 w-3" /> GNOX Signal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[10px] font-mono text-accent truncate">{reviewResult.gnoxSignal}</p>
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
