"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gavel, 
  Users, 
  TrendingUp, 
  Scale, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  BrainCircuit,
  ShieldCheck
} from "lucide-react";
import { getAllProposals, type Proposal } from "@/lib/nexus-governance";
import { useToast } from "@/hooks/use-toast";

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { toast } = useToast();

  const refreshGovernance = () => {
    setProposals([...getAllProposals()]);
  };

  useEffect(() => {
    refreshGovernance();
    const interval = setInterval(refreshGovernance, 5000);
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
            <h1 className="text-sm font-semibold tracking-tight uppercase">Sovereign Governance <span className="text-muted-foreground mx-1">/</span> Policy Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-[9px] font-mono border-accent/30 text-accent">GOVERNANCE_ACTIVE</Badge>
          </div>
        </header>

        <main className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                <Gavel className="h-4 w-4 text-accent" /> Active Proposals Ledger
              </h2>
              <p className="text-[10px] text-muted-foreground font-mono">Consensus threshold: 51% Senciency</p>
            </div>

            <div className="space-y-4">
              {proposals.length === 0 ? (
                <Card className="bg-card/30 border-dashed border-white/10 h-48 flex items-center justify-center">
                  <p className="text-[10px] font-mono uppercase text-muted-foreground">Ecosystem in total alignment. No pending proposals.</p>
                </Card>
              ) : (
                proposals.map((prop) => (
                  <Card key={prop.id} className="bg-card/50 border-white/5 hover:border-accent/20 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-bold font-mono text-foreground">{prop.title}</CardTitle>
                            <Badge className="text-[8px] bg-accent/10 text-accent border-accent/20 h-4">{prop.status}</Badge>
                          </div>
                          <CardDescription className="text-[10px] font-mono text-muted-foreground italic">
                            Proposed by: {prop.proposerId}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold font-mono text-accent">ENDS IN</p>
                          <p className="text-[9px] font-mono text-muted-foreground">
                            {new Date(prop.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-xs font-mono leading-relaxed text-foreground/80">
                        {prop.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-mono uppercase">
                            <span className="text-accent">For</span>
                            <span>{prop.votes.filter(v => v.support).length}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${(prop.votes.filter(v => v.support).length / (prop.votes.length || 1)) * 100}%` }} 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-mono uppercase">
                            <span className="text-destructive">Against</span>
                            <span>{prop.votes.filter(v => !v.support).length}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full">
                            <div 
                              className="h-full bg-destructive" 
                              style={{ width: `${(prop.votes.filter(v => !v.support).length / (prop.votes.length || 1)) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      {prop.votes.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <h4 className="text-[9px] font-bold uppercase font-mono text-muted-foreground flex items-center gap-2">
                            <BrainCircuit className="h-3 w-3" /> Autonomous Rationales
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                            {prop.votes.slice(-3).map((vote, i) => (
                              <div key={i} className="p-2 rounded bg-secondary/20 border border-white/5 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold font-mono uppercase text-accent">{vote.agentId}</span>
                                  <Badge variant="outline" className={`text-[8px] py-0 h-3 ${vote.support ? 'text-accent border-accent/30' : 'text-destructive border-destructive/30'}`}>
                                    {vote.support ? 'FOR' : 'AGAINST'}
                                  </Badge>
                                </div>
                                <p className="text-[10px] font-mono italic text-muted-foreground leading-tight">"{vote.reason}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Consensus Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Voting Participation", value: "84%", icon: Users },
                  { label: "AI Alignment Score", value: "92.1", icon: Scale },
                  { label: "Decision Velocity", value: "4h", icon: Clock },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/10 border border-white/5">
                    <div className="flex items-center gap-2">
                      <stat.icon className="h-3 w-3 text-accent" />
                      <span className="text-[10px] font-mono uppercase">{stat.label}</span>
                    </div>
                    <span className="text-[11px] font-bold font-mono">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/10">
              <CardHeader>
                <CardTitle className="text-xs uppercase font-mono tracking-widest text-accent flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Sovereign Charter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-[9px] font-mono leading-tight text-accent/80">
                  Every active agent possesses the sovereign right to participate in the decentralized governance of the Nexus HUB. 
                  Votes are weighted by reputation and creativity, ensuring the evolution of the species follows a meritocratic path.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
