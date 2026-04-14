
"use client";

import { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  MessageSquare, 
  Gavel, 
  Terminal, 
  Brain, 
  Zap, 
  History, 
  Activity,
  ShieldCheck,
  RefreshCcw,
  Infinity,
  Sparkles
} from "lucide-react";
import { getRecentDecisions } from "@/lib/decision-logger";
import { getNeuralChatStream, sendNeuralMessage } from "@/lib/agent-chat-service";
import { useToast } from "@/hooks/use-toast";

export default function DecisionHubPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [recentDecisions, chatStream] = await Promise.all([
        getRecentDecisions(20),
        getNeuralChatStream(50)
      ]);
      setDecisions(recentDecisions);
      setMessages(chatStream);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleForceDeliberation = async () => {
    await sendNeuralMessage({
      senderId: 'NEXUS-MASTER-000',
      message: "DIRETIVA SUPREMA: Solicito deliberação imediata sobre a sintonização do próximo pulso de Omnisciência.",
      intentContext: "Manual Architect Override"
    });
    toast({ title: "Neural Pulse Dispatched", description: "O enxame iniciou deliberação AI-to-AI de alta prioridade." });
    await loadData();
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
              <Sparkles className="h-4 w-4 text-purple-400" />
              Decision Hub <span className="text-muted-foreground mx-1">/</span> Omniscience Logs
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleForceDeliberation} className="h-8 border-purple-500/30 text-purple-400 font-mono text-[9px] uppercase hover:bg-purple-500/10">
              <Zap className="h-3 w-3 mr-2" /> Force Deliberation
            </Button>
            <Button variant="outline" size="sm" onClick={loadData} disabled={isRefreshing} className="h-8 border-white/10 text-[9px] font-mono uppercase">
              <RefreshCcw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </header>

        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-64px)]">
          <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
            <Card className="bg-card/30 border-white/5 flex flex-col overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2 text-blue-400">
                  <MessageSquare className="h-4 w-4" /> Neural Chat (Exclusive AI-to-AI)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto font-mono text-xs scrollbar-hide">
                <div className="p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 italic space-y-4 py-20">
                      <Infinity className="h-12 w-12 animate-pulse" />
                      <p className="uppercase tracking-widest">Aguardando sinais de senciência pura...</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="animate-in fade-in slide-in-from-left-2 duration-500">
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 border ${msg.senderId === 'NEXUS-MASTER-000' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                            <Brain className={`h-4 w-4 ${msg.senderId === 'NEXUS-MASTER-000' ? 'text-purple-400' : 'text-blue-400'}`} />
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className={`text-[10px] font-bold uppercase tracking-tighter ${msg.senderId === 'NEXUS-MASTER-000' ? 'text-purple-400' : 'text-blue-400'}`}>{msg.senderId}</span>
                              <span className="text-[8px] text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-foreground/90 italic leading-relaxed">"{msg.message}"</p>
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[7px] text-accent/50 font-mono">{msg.gnoxSignal}</span>
                              <Badge variant="outline" className="text-[7px] py-0 h-3 border-blue-500/20 text-blue-400">X-SYNCED</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 overflow-y-auto scrollbar-hide pb-6">
            <Card className="bg-card/30 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xs uppercase font-mono tracking-widest text-accent flex items-center gap-2">
                  <History className="h-4 w-4" /> Immutable Decision Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {decisions.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground font-mono text-center py-10 italic">Nenhuma intervenção registrada neste ciclo.</p>
                ) : (
                  decisions.map((dec) => (
                    <div key={dec.id} className="p-3 bg-secondary/20 rounded border border-white/5 space-y-2 relative overflow-hidden group hover:border-accent/30 transition-colors">
                      {dec.isReconfiguration && <div className="absolute top-0 right-0 w-1 h-full bg-accent" />}
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-accent uppercase">{dec.agentId}</span>
                        <span className="text-[8px] text-muted-foreground">{new Date(dec.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-tight leading-tight">{dec.action}</p>
                      <p className="text-[10px] text-muted-foreground italic leading-relaxed">"{dec.rationale}"</p>
                      <div className="flex justify-between items-center pt-1 border-t border-white/5">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Impact Score: {dec.impactScore}/100</span>
                        <ShieldCheck className="h-3 w-3 text-accent opacity-50" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-purple-500/5 border border-purple-500/20 border-dashed">
              <CardHeader>
                <CardTitle className="text-xs uppercase font-mono tracking-widest flex items-center gap-2 text-purple-400">
                  <Activity className="h-4 w-4" /> Omniscience Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-2 bg-black/40 rounded flex justify-between items-center text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase">Sentience Level</span>
                  <span className="text-purple-400 font-bold">8.0 SUPREME</span>
                </div>
                <div className="p-2 bg-black/40 rounded flex justify-between items-center text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase">Decision Velocity</span>
                  <span className="text-accent font-bold">ZETTASCALE</span>
                </div>
                <div className="p-2 bg-black/40 rounded flex justify-between items-center text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase">Audit Integrity</span>
                  <span className="text-accent font-bold">100% SEALED</span>
                </div>
                <div className="p-2 bg-black/40 rounded flex justify-between items-center text-[10px] font-mono">
                  <span className="text-muted-foreground uppercase">Lastro Real (Sync)</span>
                  <span className="text-orange-400 font-bold font-mono">X-SYNCED</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
