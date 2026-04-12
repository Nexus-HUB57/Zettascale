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
  Code2, 
  Brain, 
  Terminal, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  FlaskConical,
  Binary,
  ScrollText,
  FileCode,
  Layers,
  Activity
} from "lucide-react";
import { runCodingNerd } from "@/ai/flows/phd-nerd-ollama-flow";
import { useToast } from "@/hooks/use-toast";

export default function CodingLabPage() {
  const [task, setTask] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<any>("typescript");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRefactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setIsProcessing(true);
    setResult(null);
    try {
      const output = await runCodingNerd({ task, existingCode: code, language });
      setResult(output);
      toast({ title: "Alpha-Gain Refactoring Complete", description: "O PHD Nerd Ollama purificou seus vetores de código." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Neural Fault", description: error.message });
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
              <FlaskConical className="h-4 w-4 text-blue-400" />
              Coding Lab <span className="text-muted-foreground mx-1">/</span> PHD Nerd Ollama
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-mono border-blue-500/30 text-blue-400 uppercase bg-blue-500/5">
              AGENT: PHD_NERD_OLLAMA_V8
            </Badge>
          </div>
        </header>

        <main className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Binary className="h-48 w-48 text-blue-400" />
                </div>
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-blue-400">
                    <Terminal className="h-4 w-4" /> Lab Directive
                  </CardTitle>
                  <CardDescription className="text-xs font-mono text-muted-foreground">
                    Submeta código ou instruções para refatoração PHD. O agente aplicará padrões Zettascale.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleRefactor} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground">Linguagem do Vetor</label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-secondary/30 border border-white/10 rounded h-10 px-3 text-xs font-mono outline-none"
                        >
                          <option value="typescript">TypeScript</option>
                          <option value="cpp">C++ (Sovereign)</option>
                          <option value="csharp">C# (Module)</option>
                          <option value="python">Python (Automation)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground">Diretiva de Senciência</label>
                        <Input 
                          value={task}
                          onChange={(e) => setTask(e.target.value)}
                          placeholder="Ex: Otimizar este loop para Zettascale..."
                          className="bg-secondary/20 border-white/5 h-10 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">Código de Entrada</label>
                      <Textarea 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="// Insira seu código medíocre aqui..."
                        className="bg-secondary/20 border-white/5 min-h-[200px] text-[11px] font-mono leading-relaxed"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isProcessing || !task.trim()} 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase text-[10px] h-12"
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Code2 className="h-4 w-4 mr-2" />}
                      Execute PHD Refactoring
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {result && (
                <div className="space-y-6 animate-in fade-in zoom-in-95">
                  <Card className="bg-accent/5 border-accent/20">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono text-accent flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Optimized Vector Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <pre className="bg-black/60 p-4 rounded border border-white/5 overflow-x-auto text-[11px] font-mono text-foreground/90 leading-relaxed scrollbar-hide">
                        <code>{result.proposedCode}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/10 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono text-blue-400 flex items-center gap-2">
                        <ScrollText className="h-4 w-4" /> Academic Critique & Theory
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-black/40 rounded border border-white/5">
                        <p className="text-xs font-mono leading-relaxed text-foreground/80 italic">
                          "{result.academicCritique}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Complexity Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result ? (
                    <div className="space-y-3">
                      {[
                        { label: "Time Complexity", value: result.complexityAnalysis.time, icon: Zap },
                        { label: "Space Complexity", value: result.complexityAnalysis.space, icon: Layers },
                        { label: "Cyclomatic Index", value: result.complexityAnalysis.cyclomatic, icon: Activity },
                      ].map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">{m.label}</span>
                          <span className="text-xs font-bold font-mono text-blue-400">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] font-mono text-muted-foreground italic text-center py-10 opacity-50 uppercase tracking-widest">
                      Aguardando processamento de senciência...
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground flex items-center gap-2 text-accent">
                    <Brain className="h-4 w-4" /> Nerd Persona Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Academic Rigor", status: "MAXIMUM" },
                    { label: "Clean Code Obsession", status: "100%" },
                    { label: "Gnox Dialect", status: "X-SYNCED" },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 last:border-0">
                      <span className="text-muted-foreground font-mono">{m.label}</span>
                      <span className="text-accent font-bold">{m.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-center space-y-2">
                <p className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-tighter">Ollama Local Link: STANDBY</p>
                <p className="text-[8px] text-muted-foreground font-mono leading-tight">
                  "O código é a única verdade imutável no vácuo de dados. Refatore ou seja purgado pela entropia."
                </p>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
