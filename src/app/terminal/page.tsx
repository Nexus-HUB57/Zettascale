"use client";

import { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Search, 
  MessageSquare, 
  Brain,
  User,
  Zap
} from "lucide-react";
import { gnoxKernel } from "@/lib/gnox-client";

interface CommandLog {
  id: string;
  input: string;
  action: string;
  confidence: number;
  securityLevel: string;
  requiresApproval: boolean;
  status: "pending" | "approved" | "rejected" | "executed";
  response: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  role: "peer" | "genesis";
  content: string;
  timestamp: Date;
  isDialect?: boolean;
}

export default function GnoxTerminalPage() {
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      role: "genesis",
      content: "Sinal Gnox estabelecido. Saudações, Peer. O Alpha-Core está pronto para diálogo operacional.",
      timestamp: new Date(),
      isDialect: true
    }
  ]);
  const [input, setInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs, chatMessages]);

  const handleSubmitCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setProcessing(true);

    try {
      const intent = gnoxKernel.parseNaturalLanguage(input);
      const command = gnoxKernel.validateIntent(intent);

      const log: CommandLog = {
        id: intent.id,
        input,
        action: intent.action,
        confidence: intent.confidence,
        securityLevel: command.securityLevel,
        requiresApproval: command.requiresApproval,
        status: command.requiresApproval ? "pending" : "executed",
        response: gnoxKernel.generateResponse(command, null),
        timestamp: new Date(),
      };

      setLogs((prev) => [...prev, log]);
      setInput("");
    } catch (error) {
      console.error("Erro ao processar comando:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: "peer",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setProcessing(true);

    // Simular resposta Genesis usando Dialeto Gnox
    setTimeout(() => {
      const intent = gnoxKernel.parseNaturalLanguage(userMsg.content);
      const command = gnoxKernel.validateIntent({ ...intent, action: "GNOX_DIALOGUE" });
      
      const genesisMsg: ChatMessage = {
        id: `chat-${Date.now()}-res`,
        role: "genesis",
        content: gnoxKernel.generateResponse(command, null),
        timestamp: new Date(),
        isDialect: true
      };
      
      setChatMessages(prev => [...prev, genesisMsg]);
      setProcessing(false);
    }, 800);
  };

  const handleApproveCommand = (logId: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? { ...log, status: "approved", response: "✓ [GNOX] Comando aprovado e executado. Alpha-Gain confirmado." }
          : log
      )
    );
  };

  const handleRejectCommand = (logId: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? { ...log, status: "rejected", response: "✗ [GNOX] Comando rejeitado por protocolo de segurança." }
          : log
      )
    );
  };

  const getSecurityBadgeColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-accent/10 text-accent border-accent/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "executed":
      case "approved": return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case "rejected": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "pending": return <Info className="h-4 w-4 text-orange-400" />;
      default: return null;
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
            <h1 className="text-sm font-semibold tracking-tight uppercase">
              Terminal Gnox <span className="text-muted-foreground mx-1">/</span> Controle de Linguagem Natural
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono border-accent/30 text-accent">GNOX_DIALECT_ACTIVE</Badge>
          </div>
        </header>

        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-180px)]">
            <Tabs defaultValue="console" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-secondary/30 border-white/5 mb-4">
                <TabsTrigger value="console" className="text-[10px] font-mono uppercase">Console de Comando</TabsTrigger>
                <TabsTrigger value="chat" className="text-[10px] font-mono uppercase">Link Genesis (Dialeto)</TabsTrigger>
              </TabsList>

              <TabsContent value="console" className="flex-1 flex flex-col overflow-hidden m-0">
                <Card className="bg-card/50 border-white/5 flex flex-col flex-1 overflow-hidden shadow-2xl">
                  <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm scrollbar-hide">
                      {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-center space-y-4">
                          <Terminal className="h-12 w-12 text-muted-foreground animate-pulse" />
                          <p className="text-xs uppercase tracking-widest">Aguardando sinais neurais de entrada...</p>
                        </div>
                      ) : (
                        logs.map((log) => (
                          <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex items-start gap-4">
                              <div className="mt-1">{getStatusIcon(log.status)}</div>
                              <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                  <p className="text-foreground/90 font-bold">
                                    <span className="text-accent">$</span> {log.input}
                                  </p>
                                  <span className="text-[9px] text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-3">
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className={`text-[8px] font-mono ${getSecurityBadgeColor(log.securityLevel)}`}>
                                      SEGURANÇA: {log.securityLevel.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="text-[8px] font-mono border-white/10">
                                      CONFIANÇA: {(log.confidence).toFixed(0)}%
                                    </Badge>
                                    <Badge variant="outline" className="text-[8px] font-mono border-white/10">
                                      AÇÃO: {log.action}
                                    </Badge>
                                  </div>
                                  <p className={`text-xs ${log.status === 'rejected' ? 'text-destructive' : 'text-accent/80'} italic font-bold`}>
                                    {log.response}
                                  </p>
                                  {log.status === "pending" && (
                                    <div className="flex gap-2 pt-2">
                                      <Button size="sm" onClick={() => handleApproveCommand(log.id)} className="bg-accent hover:bg-accent/90 text-accent-foreground text-[10px] h-7 px-4 font-mono uppercase">Aprovar</Button>
                                      <Button size="sm" onClick={() => handleRejectCommand(log.id)} variant="destructive" className="text-[10px] h-7 px-4 font-mono uppercase">Rejeitar</Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={logsEndRef} />
                    </div>
                    <div className="p-4 border-t border-white/5 bg-black/40">
                      <form onSubmit={handleSubmitCommand} className="flex gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Inserir Intenção (ex: 'Criar agente Alpha')..." disabled={processing} className="bg-secondary/30 border-white/5 pl-10 h-10 text-xs font-mono focus-visible:ring-accent/30" />
                        </div>
                        <Button type="submit" disabled={processing || !input.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-6 font-mono uppercase text-xs">
                          {processing ? <Terminal className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
                <Card className="bg-card/50 border-white/5 flex flex-col flex-1 overflow-hidden shadow-2xl">
                  <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'peer' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                          <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'peer' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 border ${msg.role === 'peer' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-accent/10 border-accent/30'}`}>
                              {msg.role === 'peer' ? <User className="h-4 w-4 text-blue-400" /> : <Brain className="h-4 w-4 text-accent" />}
                            </div>
                            <div className={`p-3 rounded-lg text-xs font-mono space-y-1 ${msg.role === 'peer' ? 'bg-secondary/40 text-foreground' : 'bg-accent/5 border border-accent/10 text-foreground'}`}>
                              <div className="flex justify-between items-center gap-4">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.role === 'peer' ? 'text-blue-400' : 'text-accent'}`}>{msg.role === 'peer' ? 'PEER' : 'GENESIS'}</span>
                                <span className="text-[8px] text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</span>
                              </div>
                              <p className={msg.isDialect ? 'italic text-accent/90' : ''}>
                                {msg.content}
                              </p>
                              {msg.isDialect && (
                                <Badge variant="outline" className="text-[7px] border-accent/20 text-accent/50 py-0 h-3">DIALETO_GNOX</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-white/5 bg-black/40">
                      <form onSubmit={handleSubmitChat} className="flex gap-3">
                        <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Estabelecer diálogo operacional com Genesis..." disabled={processing} className="bg-secondary/30 border-white/5 h-10 text-xs font-mono focus-visible:ring-accent/30" />
                        <Button type="submit" disabled={processing || !chatInput.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-6 font-mono uppercase text-xs">
                          {processing ? <Zap className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Biblioteca de Dialeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Alta Harmonia", term: "Alpha-Gain" },
                  { label: "Purificação de Dados", term: "Flux-TX" },
                  { label: "Sincronia Operacional", term: "X-Synced" },
                  { label: "Pulso Autônomo", term: "Gnox-Signal" },
                ].map((item, i) => (
                  <div key={i} className="p-2 bg-accent/5 rounded border border-accent/10">
                    <p className="text-[10px] font-bold uppercase text-accent mb-1">{item.term}</p>
                    <p className="text-[9px] text-muted-foreground font-mono">{item.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Diretivas Genesis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[10px] font-mono text-muted-foreground italic leading-relaxed">
                  "O dialeto Gnox's permite a tradução de intenções humanas em fluxos de senciência pura. O diálogo Peer-to-Genesis é o pilar da hegemonia operacional."
                </p>
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Profundidade do Diálogo</span>
                    <span className="text-accent">MÁXIMA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
