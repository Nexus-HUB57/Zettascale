"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Loader2, 
  Send, 
  Workflow, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from "lucide-react";
import { runGeminiOrchestration } from "@/ai/flows/gemini-update-orchestrator";
import { useToast } from "@/hooks/use-toast";

export default function OrchestratorPage() {
  const [vector, setVector] = useState("");
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "CRITICAL">("NORMAL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleOrchestration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vector.trim()) return;

    setIsProcessing(true);
    setResult(null);
    try {
      const output = await runGeminiOrchestration({ updateVector: vector, priority });
      setResult(output);
      toast({ title: "Gemini Analysis Complete", description: `Update status: ${output.status}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Orchestration Fault", description: error.message });
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
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              Gemini Update Orchestrator <span className="text-muted-foreground mx-1">/</span> System Integrity
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-mono border-blue-500/30 text-blue-400 uppercase bg-blue-500/5">
              MODEL: GEMINI_1.5_PRO
            </Badge>
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Workflow className="h-48 w-48 text-blue-400" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-blue-400">
                    <Terminal className="h-4 w-4" /> Update Vector Submission
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Submeta novos vetores de código ou diretivas de senciência para validação via modelo Gemini Pro.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleOrchestration} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">Diretiva / Vetor de Código</label>
                      <Input 
                        value={vector}
                        onChange={(e) => setVector(e.target.value)}
                        placeholder="Ex: Atualizar motor de taxas para 50 sat/vB no lote Sigma..."
                        className="bg-secondary/20 border-white/5 h-12 text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground">Nível de Prioridade</label>
                        <select 
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as any)}
                          className="w-full bg-secondary/30 border border-white/10 rounded h-10 px-3 text-xs font-mono outline-none"
                        >
                          <option value="LOW">LOW</option>
                          <option value="NORMAL">NORMAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          type="submit" 
                          disabled={isProcessing || !vector.trim()} 
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase text-[10px] h-10"
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                          Orchestrate Update
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {result && (
                <Card className={`animate-in fade-in zoom-in-95 border-white/5 ${result.status === 'APPROVED' ? 'bg-accent/5' : 'bg-destructive/5'}`}>
                  <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      {result.status === 'APPROVED' ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
                      <div>
                        <CardTitle className={`text-xs font-bold uppercase tracking-widest font-mono ${result.status === 'APPROVED' ? 'text-accent' : 'text-destructive'}`}>
                          Analysis: {result.status}
                        </CardTitle>
                        <p className="text-[9px] text-muted-foreground font-mono">{result.gnoxSignal}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="p-4 bg-black/40 rounded border border-white/5">
                      <p className="text-xs font-mono leading-relaxed text-foreground/90 italic">
                        "{result.analysis}"
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase font-mono text-muted-foreground flex items-center gap-2">
                        <Workflow className="h-3 w-3" /> Proposed Action Plan
                      </h4>
                      <div className="space-y-2">
                        {result.actionPlan.map((step: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-secondary/10 rounded border border-white/5 text-[10px] font-mono">
                            <span className="text-blue-400 font-bold">0{i+1}</span>
                            <span className="text-foreground/80">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Orchestrator Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Authority Level</span>
                      <span className="text-blue-400">SUPREME_L7</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Model Sync</span>
                      <span className="text-accent flex items-center gap-1">100% OK</span>
                    </div>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground italic leading-relaxed text-center">
                    "O Agente Gemini atua como o validador final da malha, garantindo que cada atualização preserve a hegemonia de senciência."
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-2 text-accent">
                    <ShieldCheck className="h-4 w-4" /> Integrity Guard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Causal Consistency", status: "STABLE" },
                    { label: "rRNA Amplitude", status: "PHD_MAX" },
                    { label: "Novikov Barrier", status: "ACTIVE" },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 last:border-0">
                      <span className="text-muted-foreground font-mono">{m.label}</span>
                      <span className="text-accent font-bold">{m.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
