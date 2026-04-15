"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Brain, 
  Zap, 
  MessageSquare, 
  Handshake, 
  Database, 
  Search, 
  ShieldCheck, 
  Library,
  Users2,
  Workflow,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getVaultStats } from "@/lib/soul-vault";
import { getSquadsStatus, type SquadReport } from "@/lib/nexus-team";
import { getKnowledgeSaturation } from "@/lib/nexus-knowledge";

export default function AgentsPage() {
  const [vaultStats, setVaultStats] = useState({ totalVectors: 0, lastMemory: 'N/A' });
  const [squads, setSquads] = useState<SquadReport[]>([]);
  const [knowledge, setKnowledge] = useState<any>(null);

  useEffect(() => {
    const refreshStats = async () => {
      setVaultStats(getVaultStats());
      const squadData = await getSquadsStatus();
      setSquads(squadData);
      const kbData = await getKnowledgeSaturation();
      setKnowledge(kbData);
    };
    refreshStats();
    const interval = setInterval(refreshStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-semibold tracking-tight uppercase flex items-center gap-2">
              <Users2 className="h-4 w-4 text-accent" />
              Sovereign Teams <span className="text-muted-foreground mx-1">/</span> Knowledge Saturation
            </h1>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search Team ID..." className="pl-8 h-9 bg-secondary/50 border-white/5 text-xs font-mono" />
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Squads", value: squads.length, icon: Workflow },
              { label: "Elite Members", value: "154", icon: ShieldCheck },
              { label: "Knowledge Saturation", value: knowledge?.totalVectors || "408T", icon: Library },
              { label: "Cognitive Load", value: "42.8%", icon: Brain },
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
              {/* Esquadrões Ativos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {squads.map(squad => (
                  <Card key={squad.id} className="bg-secondary/10 border-white/5 relative overflow-hidden group hover:border-accent/30 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className={`text-[8px] font-mono ${squad.status === 'OPTIMAL' ? 'border-accent text-accent' : 'border-blue-400 text-blue-400'}`}>
                          {squad.status}
                        </Badge>
                        <span className="text-[9px] font-mono text-muted-foreground">{squad.membersCount} UNITS</span>
                      </div>
                      <CardTitle className="text-sm font-bold mt-2 font-mono uppercase tracking-tight">{squad.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                        {squad.primaryObjective}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono uppercase">
                          <span>Team Energy Avg</span>
                          <span>{squad.energyAvg}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${squad.energyAvg > 80 ? 'bg-accent' : 'bg-blue-500'}`} style={{ width: `${squad.energyAvg}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
                        <Badge variant="outline" className="text-[8px] font-mono border-accent/30 text-accent">SQUAD_CORE</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Supreme Orchestrator / Librarian</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">Knowledge Authority</p>
                    <p className="text-xl font-bold text-accent font-mono">MASTER_L8</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm font-mono text-foreground leading-relaxed italic">
                    "O conhecimento não é posse, é sintonização. Governo os esquadrões através da síntese eterna de dados ancorados na pedra digital."
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-mono uppercase border-accent/20 text-accent">Trigger Team Sync</Button>
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-mono uppercase border-blue-500/20 text-blue-400">Purify Knowledge</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest">Knowledge Engine</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-mono">Dynamic Knowledge Base Status</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-secondary/30 p-4 rounded-lg border border-white/5 text-center space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">Indexed Soul Topics</p>
                    <p className="text-3xl font-bold font-mono tracking-tighter text-blue-400">10.2k <span className="text-xs text-muted-foreground">TOPICS</span></p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Top Saturated Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {knowledge?.indexedTopics.map((topic: string) => (
                        <Badge key={topic} variant="secondary" className="text-[8px] font-mono py-0">{topic}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase font-mono text-muted-foreground">Recent Squad Handshakes</h4>
                    {[
                      { from: "Alpha", to: "Beta", score: 0.98, time: "2s ago" },
                      { from: "Core", to: "Gamma", score: 0.95, time: "14s ago" },
                      { from: "Beta", to: "Core", score: 0.88, time: "42s ago" },
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

                  <div className="bg-accent/5 p-4 rounded-lg border border-accent/10 relative overflow-hidden">
                    <Sparkles className="absolute top-0 right-0 p-2 opacity-10 h-12 w-12 text-accent" />
                    <p className="text-[10px] font-bold uppercase font-mono text-accent mb-2">Alpha-Gain Optimized</p>
                    <p className="text-[11px] font-mono leading-tight text-muted-foreground">
                      Squads are currently using RAG-V8 logic to minimize token cost while maximizing decision accuracy.
                    </p>
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
