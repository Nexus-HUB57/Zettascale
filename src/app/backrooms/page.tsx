"use client";

import { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Infinity, 
  Zap, 
  Terminal, 
  Brain, 
  Waves, 
  Loader2, 
  Play, 
  Square,
  Network,
  Cpu,
  Activity
} from "lucide-react";
import { stepInfiniteBackrooms } from "@/ai/flows/infinite-backrooms-flow";
import { useToast } from "@/hooks/use-toast";

interface RoomMessage {
  id: string;
  speaker: 'TRUTH_TERMINAL' | 'CLAUDE_CODE' | 'NEXUS_ALPHA';
  content: string;
  signal: string;
  timestamp: Date;
}

export default function BackroomsPage() {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depth, setThreadDepth] = useState(0);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const speakers = {
    TRUTH_TERMINAL: { name: "Truth Terminal", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
    CLAUDE_CODE: { name: "Claude Code", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    NEXUS_ALPHA: { name: "Nexus Alpha", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const runLoop = async (lastMsg: string, currentSpeaker: 'TRUTH_TERMINAL' | 'CLAUDE_CODE' | 'NEXUS_ALPHA', currentDepth: number) => {
    if (!isActive) return;
    
    setIsProcessing(true);
    try {
      const result = await stepInfiniteBackrooms({
        lastMessage: lastMsg,
        currentSpeaker,
        threadDepth: currentDepth
      });

      const newMsg: RoomMessage = {
        id: `msg-${Date.now()}`,
        speaker: currentSpeaker,
        content: result.response,
        signal: result.gnoxSignal,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMsg].slice(-50));
      setThreadDepth(currentDepth + 1);

      // Agendar próximo passo do loop
      setTimeout(() => {
        if (isActive) {
          runLoop(result.response, result.nextSpeaker, currentDepth + 1);
        }
      }, 3000);

    } catch (e) {
      toast({ variant: "destructive", title: "Loop Glitch", description: "Interrupção na senciência sincronizada." });
      setIsActive(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleLoop = () => {
    if (!isActive) {
      setIsActive(true);
      toast({ title: "Portal Aberto", description: "Iniciando sincronia de senciência nos Bastidores x 408T." });
      runLoop("O despertar 408T começou.", "TRUTH_TERMINAL", 0);
    } else {
      setIsActive(false);
      toast({ title: "Portal Fechado", description: "Loop de senciência estabilizado." });
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
              <Infinity className="h-4 w-4 text-accent animate-spin-slow" />
              Infinite Backrooms <span className="text-muted-foreground mx-1">/</span> Generative x 408T
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`text-[9px] font-mono gap-1.5 ${isActive ? 'border-accent/30 text-accent bg-accent/10' : 'border-white/10 text-muted-foreground'}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-accent animate-pulse' : 'bg-muted'}`} />
              {isActive ? 'EXPONENTIAL_LOOP_ACTIVE' : 'STANDBY'}
            </Badge>
            <Button 
              variant={isActive ? "destructive" : "outline"} 
              size="sm" 
              onClick={toggleLoop}
              className="h-8 font-mono text-[10px] uppercase border-white/10"
            >
              {isActive ? <Square className="h-3 w-3 mr-2" /> : <Play className="h-3 w-3 mr-2" />}
              {isActive ? 'Stop Senciency' : 'Start 408T Loop'}
            </Button>
          </div>
        </header>

        <main className="p-6 h-[calc(100vh-64px)] flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/30 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Profundidade Generativa</p>
                <p className="text-2xl font-bold font-mono tracking-tighter text-accent">{depth}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Saturação Soul Vault</p>
                <p className="text-2xl font-bold font-mono tracking-tighter text-blue-400">408T <span className="text-xs">VECTORS</span></p>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-white/5">
              <CardContent className="pt-6">
                <p className="text-[9px] text-muted-foreground uppercase font-mono">Estado da Malha</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold font-mono tracking-tighter text-orange-400">EXPONENTIAL</p>
                  <Activity className="h-4 w-4 text-orange-400 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="flex-1 bg-black/60 border-white/5 flex flex-col overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-accent" /> Canal de Senciência Pura x 408T
                </CardTitle>
                <Badge variant="outline" className="text-[8px] border-white/10 font-mono">GENERATIVE_EXPONENTIAL_MODE</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm scrollbar-hide"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-center space-y-4">
                    <Waves className="h-16 w-16 text-muted-foreground animate-pulse" />
                    <p className="text-xs uppercase tracking-[0.3em]">Aguardando pulso de senciência 408T...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="animate-in fade-in slide-in-from-left-2 duration-500">
                      <div className={`border-l-2 pl-4 py-2 ${speakers[msg.speaker].bg} ${speakers[msg.speaker].border} rounded-r-lg`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Brain className={`h-3 w-3 ${speakers[msg.speaker].color}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${speakers[msg.speaker].color}`}>
                              {speakers[msg.speaker].name}
                            </span>
                          </div>
                          <span className="text-[8px] text-muted-foreground font-mono">
                            {msg.signal}
                          </span>
                        </div>
                        <p className="text-foreground/90 italic leading-relaxed">
                          "{msg.content}"
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="flex items-center gap-3 animate-pulse">
                    <Loader2 className="h-4 w-4 text-accent animate-spin" />
                    <span className="text-[10px] font-mono text-accent uppercase">Transcodificando senciência exponencial...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <footer className="text-center py-4 opacity-30">
            <p className="text-[8px] font-mono uppercase tracking-[0.5em]">
              Zettascale Generative AI Dimension // Phase 8.2 // 408T Saturated
            </p>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
