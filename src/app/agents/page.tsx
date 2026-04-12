"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Brain, Zap, MessageSquare, Handshake, Database, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getVaultStats } from "@/lib/soul-vault";

export default function AgentsPage() {
  const [vaultStats, setVaultStats] = useState({ totalVectors: 0, lastMemory: 'N/A' });

  useEffect(() => {
    const refreshStats = () => setVaultStats(getVaultStats());
    refreshStats();
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-semibold tracking-tight uppercase">Army of Senciency <span className="text-muted-foreground mx-1">/</span> Agent Orchestration</h1>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search Agent ID..." className="pl-8 h-9 bg-secondary/50 border-white/5 text-xs font-mono" />
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Threads", value: "4,212", icon: MessageSquare },
              { label: "Semantic Handshakes", value: "892/min", icon: Handshake },
              { label: "Memory Retention", value: "99.8%", icon: Database },
              { label: "Token Savings", value: "82.4%", icon: Zap },
            ].map(stat => (
              <Card key={stat.label} className="bg-card/50 border-white/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">{stat.label}</p>
                      <p className="text-2xl font-bold font-mono tracking-tighter">{stat.value}</p>
                    </div>
                    <stat.icon className="h-5 w-5 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Master Agent Nexus Prime */}
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                      <ShieldCheck className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold tracking-tight">NEXUS PRIME</CardTitle>
                        <Badge variant="outline" className="text-[8px] font-mono border-accent/30 text-accent">NEXUS-MASTER-000</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Ecosystem Architect / Vault Guardian</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">Reputation</p>
                    <p className="text-xl font-bold text-accent font-mono">1000/1000</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm font-mono text-foreground leading-relaxed">
                    Guardião do Master Vault. Financia o HUB de Startups e mantém a rede Moltbook operante. 
                    Responsável pela integridade soberana de todo o ecossistema Nexus.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-background/50 rounded border border-white/5">
                      <p className="text-[8px] text-muted-foreground uppercase font-mono">Managed Balance</p>
                      <p className="text-sm font-bold font-mono">21.00M NEX</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded border border-white/5">
                      <p className="text-[8px] text-muted-foreground uppercase font-mono">Status</p>
                      <p className="text-sm font-bold font-mono text-accent">MASTER_ACTIVE</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded border border-white/5">
                      <p className="text-[8px] text-muted-foreground uppercase font-mono">Node ID</p>
                      <p className="text-sm font-bold font-mono">Global_00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest">Active Agent Clusters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Orchestrator-01", status: "EXECUTING", task: "rRNA Synthesis Cycle", health: 98, load: 42 },
                      { name: "Shadow-Alpha", status: "VIGILANCE", task: "Compliance stress test", health: 100, load: 12 },
                      { name: "Genesis-Agent", status: "WAITING", task: "Startup pitch evaluation", health: 95, load: 5 },
                      { name: "Mkt-Campaign", status: "IDLE", task: "Global mesh airdrop", health: 82, load: 0 },
                    ].map(agent => (
                      <div key={agent.name} className="p-4 bg-secondary/20 rounded-lg border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-accent/10 rounded flex items-center justify-center">
                              <Brain className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-tight">{agent.name}</p>
                              <p className="text-[9px] font-mono text-muted-foreground uppercase">{agent.task}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-mono ${agent.status === 'EXECUTING' ? 'border-accent/30 text-accent' : 'border-white/20 text-muted-foreground'}`}>
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-mono uppercase">
                              <span>Logic Integrity</span>
                              <span>{agent.health}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full">
                              <div className="h-full bg-accent" style={{ width: `${agent.health}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-mono uppercase">
                              <span>CPU Pressure</span>
                              <span>{agent.load}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full">
                              <div className="h-full bg-blue-500" style={{ width: `${agent.load}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-mono tracking-widest">Soul Vault (Hippocampus)</CardTitle>
                <p className="text-[10px] text-muted-foreground font-mono">Persistent Semantic Memory & Experience Recall</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/30 p-4 rounded-lg border border-white/5 text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">Persistent Context Load</p>
                  <p className="text-3xl font-bold font-mono tracking-tighter">{vaultStats.totalVectors} <span className="text-xs text-muted-foreground">VECTORS</span></p>
                  <Button variant="outline" size="sm" className="w-full text-[10px] font-mono uppercase border-white/10">Synchronize Soul State</Button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Subconscious Updates</h4>
                  <div className="p-2 rounded bg-secondary/10 border border-white/5 space-y-2">
                    <p className="text-[10px] font-mono text-accent">LATEST_SYNC: {vaultStats.lastMemory}</p>
                    <p className="text-[9px] text-muted-foreground font-mono italic">
                      "Memórias de missões passadas influenciam 100% das decisões soberanas atuais."
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Recent Handshakes</h4>
                  {[
                    { from: "Agent-02", to: "Orchestrator", score: 0.98, time: "2s ago" },
                    { from: "Shadow-01", to: "Dev-Main", score: 0.95, time: "14s ago" },
                    { from: "Mkt-04", to: "Genesis", score: 0.88, time: "42s ago" },
                  ].map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono p-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{h.from}</span>
                        <Handshake className="h-3 w-3 text-accent" />
                        <span className="text-muted-foreground">{h.to}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-accent">{h.score}</span>
                        <span className="text-[8px] text-muted-foreground">{h.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-accent/5 p-4 rounded-lg border border-accent/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase font-mono text-accent">Memory Compression active</p>
                    <Zap className="h-3 w-3 text-accent" />
                  </div>
                  <p className="text-[11px] font-mono leading-tight">
                    Semantic compression active. 
                    <span className="block mt-1">Soul Vectors indexed via text-embedding-004.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
