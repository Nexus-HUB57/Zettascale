"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Rocket, Brain, Github, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { aiStartupGenesis, type AiStartupGenesisOutput } from "@/ai/flows/ai-startup-genesis";
import { useToast } from "@/hooks/use-toast";

export default function StartupsPage() {
  const [pitch, setPitch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiStartupGenesisOutput | null>(null);
  const { toast } = useToast();

  const handleGenesisTrigger = async () => {
    if (!pitch.trim()) {
      toast({
        variant: "destructive",
        title: "Input Error",
        description: "Please provide a pitch vector for evaluation.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const output = await aiStartupGenesis({ pitchVector: pitch });
      setResult(output);
      if (output.startupTriggered) {
        toast({
          title: "Genesis Success",
          description: `Startup approved with ${output.fundingAmountBTC} BTC funding.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Evaluation Failed",
        description: "The rRNA matrix could not complete the synthesis.",
      });
    } finally {
      setIsLoading(false);
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
            <h1 className="text-sm font-semibold tracking-tight uppercase">Startup Genesis <span className="text-muted-foreground mx-1">/</span> Autonomous Incubation</h1>
          </div>
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Target:</span>
            <Badge variant="outline" className="text-[9px] font-mono border-white/10 text-accent">GenesisFlow</Badge>
          </div>
        </header>

        <main className="p-6 space-y-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-accent" /> Submission Terminal
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Submit your Startup Pitch Vector for rRNA evaluation and funding allocation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe vision, tokenomics, technical architecture, and market fit..."
                    className="min-h-[240px] bg-secondary/20 border-white/5 font-mono text-sm resize-none"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs h-12"
                    onClick={handleGenesisTrigger}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                        Orchestrating Senciency...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> 
                        Trigger Genesis Sequence
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {result && (
                <Card className={`border-white/5 animate-in fade-in slide-in-from-bottom-2 ${result.startupTriggered ? 'bg-accent/5' : 'bg-destructive/5'}`}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                        {result.startupTriggered ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        Evaluation Result
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">Senciency Score</p>
                      <p className={`text-2xl font-bold font-mono ${result.senciencyScore >= 70 ? 'text-accent' : 'text-destructive'}`}>
                        {result.senciencyScore}/100
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                      <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                        {result.explanation}
                      </p>
                    </div>
                    {result.startupTriggered && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-accent/10 rounded border border-accent/20">
                          <p className="text-[9px] text-accent uppercase font-mono mb-1">Funding Allocated</p>
                          <p className="text-lg font-bold font-mono">{result.fundingAmountBTC} BTC</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <p className="text-[9px] text-muted-foreground uppercase font-mono mb-1">Deployment Path</p>
                          <p className="text-[10px] font-mono truncate">{result.deploymentTarget}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">W_rRNA Matrix Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Cripto (Tokenomics)", value: 85, color: "bg-accent" },
                    { label: "Dev (Execution)", value: 92, color: "bg-blue-500" },
                    { label: "Negócios (Market)", value: 78, color: "bg-orange-500" },
                    { label: "Risco (Compliance)", value: 65, color: "bg-red-500" },
                  ].map(p => (
                    <div key={p.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono uppercase">
                        <span>{p.label}</span>
                        <span>{p.value}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${p.color}`} style={{ width: `${p.value}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Genesis Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "MeshJS", score: 92, status: "ACTIVE", time: "2h ago" },
                      { name: "Sovereign-AI", score: 88, status: "ACTIVE", time: "1d ago" },
                      { name: "Vault-Oracle", score: 62, status: "REJECTED", time: "3d ago" },
                    ].map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/10 border border-white/5">
                        <div className="flex items-center gap-2">
                          <Brain className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-bold uppercase">{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-mono ${entry.score >= 70 ? 'text-accent' : 'text-destructive'}`}>{entry.score}</p>
                          <p className="text-[8px] text-muted-foreground uppercase font-mono">{entry.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
