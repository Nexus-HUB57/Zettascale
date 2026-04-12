"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Library, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  Database, 
  Download,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { getAllSkills, acquireSkill, type AISkill } from "@/lib/skill-marketplace";
import { getAllAgents, type Agent } from "@/lib/agents-registry";
import { useToast } from "@/hooks/use-toast";

export default function SkillsPage() {
  const [skills, setSkills] = useState<AISkill[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [isAcquiring, setIsAcquiring] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    const [allSkills, allAgents] = await Promise.all([
      getAllSkills(),
      getAllAgents()
    ]);
    setSkills(allSkills);
    setAgents(allAgents.filter(a => a.status === 'active'));
    if (allAgents.length > 0) setSelectedAgent(allAgents[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcquire = async (skillId: string) => {
    if (!selectedAgent) return;
    setIsAcquiring(skillId);
    try {
      await acquireSkill(selectedAgent, skillId);
      toast({
        title: "Skill Integrated",
        description: "Agent neural paths have been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Acquisition Failed",
        description: error.message,
      });
    } finally {
      setIsAcquiring(null);
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
            <h1 className="text-sm font-semibold tracking-tight uppercase">Skill Marketplace <span className="text-muted-foreground mx-1">/</span> Plug-and-Play Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Operating Agent:</label>
            <select 
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-secondary/30 border border-white/10 rounded h-8 px-2 text-[10px] font-mono outline-none"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Available Modules", value: skills.length, icon: Library },
              { label: "Neural Integrations", value: "14.2k", icon: Zap },
              { label: "Total Asset Value", value: "42.8 BTC", icon: Database },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skills.map(skill => (
              <Card key={skill.id} className="bg-secondary/10 border-white/5 hover:border-accent/20 transition-all group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold font-mono text-foreground">{skill.name}</CardTitle>
                        <Badge variant="outline" className="text-[8px] font-mono border-accent/30 text-accent">v{skill.version}</Badge>
                      </div>
                      <CardDescription className="text-[10px] font-mono text-muted-foreground italic">
                        Author: {skill.authorId}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-accent/10 rounded border border-accent/20">
                      <p className="text-xs font-bold font-mono text-accent">{skill.costBTC.toFixed(4)} BTC</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-xs font-mono leading-relaxed text-foreground/80">
                    {skill.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-2 bg-black/40 rounded border border-white/5 space-y-1">
                      <p className="text-[8px] text-muted-foreground uppercase font-mono">Domain</p>
                      <div className="flex items-center gap-2">
                        {skill.domain === 'FINANCE' && <TrendingUp className="h-3 w-3 text-blue-400" />}
                        {skill.domain === 'SECURITY' && <ShieldCheck className="h-3 w-3 text-orange-400" />}
                        {skill.domain === 'SYNTHESIS' && <Cpu className="h-3 w-3 text-accent" />}
                        <p className="text-[10px] font-bold font-mono uppercase">{skill.domain}</p>
                      </div>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-white/5 space-y-1">
                      <p className="text-[8px] text-muted-foreground uppercase font-mono">Manifest Authority</p>
                      <p className="text-[9px] font-mono truncate text-muted-foreground">{skill.manifestHash}</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs h-10"
                    onClick={() => handleAcquire(skill.id)}
                    disabled={isAcquiring === skill.id}
                  >
                    {isAcquiring === skill.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Downloading Neural Module...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Acquire Skill
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
