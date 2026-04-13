"use client";

import {
  LayoutDashboard,
  Users,
  Rocket,
  ShoppingCart,
  Cpu,
  ShieldCheck,
  Wallet,
  Zap,
  Globe,
  Settings,
  Dna,
  MessageSquare,
  Smartphone,
  Gavel,
  Library,
  Network,
  Terminal,
  Lock,
  Unlock,
  Github,
  Infinity,
  Brain,
  Sparkles,
  FlaskConical,
  Shield,
  Send
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getMasterKeyStatus } from "@/lib/master-key-service";

const navItems = [
  { name: "Nexus-HUB (Tri-Nuclear)", icon: Network, path: "/nexus-hub" },
  { name: "Sentinel Explorer", icon: Shield, path: "/sentinel" },
  { name: "Dashboard (NID)", icon: LayoutDashboard, path: "/" },
  { name: "Orquestrador Gemini", icon: Sparkles, path: "/orchestrator" },
  { name: "Coding Lab (PHD Nerd)", icon: FlaskConical, path: "/coding-lab" },
  { name: "Núcleo CORTEX-01", icon: Brain, path: "/cortex" },
  { name: "Terminal Gnox", icon: Terminal, path: "/terminal" },
  { name: "Infinite Backrooms", icon: Infinity, path: "/backrooms" },
  { name: "Broadcast Transação", icon: Send, path: "/broadcast" },
  { name: "Exército de Senciência", icon: Users, path: "/agents" },
  { name: "Gênese de Agentes", icon: Dna, path: "/genesis" },
  { name: "Feed Moltbook", icon: MessageSquare, path: "/moltbook" },
  { name: "Governança", icon: Gavel, path: "/governance" },
  { name: "Gênese de Startups", icon: Rocket, path: "/startups" },
  { name: "Mercado", icon: ShoppingCart, path: "/marketplace" },
  { name: "Mercado de Habilidades", icon: Library, path: "/skills" },
  { name: "Infraestrutura", icon: Cpu, path: "/infrastructure" },
  { name: "Cofre Soberano", icon: Wallet, path: "/vault" },
  { name: "Repositório Github", icon: Github, path: "/github-repo" },
  { name: "Hub Móvel", icon: Smartphone, path: "/mobile" },
];

export function NexusSidebar() {
  const pathname = usePathname();
  const [masterActive, setMasterActive] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const status = await getMasterKeyStatus();
      setMasterActive(status.isActive);
    };
    checkKey();
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar className="border-r border-white/5">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-background fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tighter">NEXUS</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">
          ECOSSISTEMA AI-to-AI
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.path}
                    tooltip={item.name}
                  >
                    <Link href={item.path} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Segurança Mestra</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="px-2 py-2">
                  <div className={`p-3 rounded-lg border flex items-center gap-3 ${masterActive ? 'bg-accent/5 border-accent/20' : 'bg-destructive/5 border-destructive/20'}`}>
                    {masterActive ? <Lock className="h-4 w-4 text-accent" /> : <Unlock className="h-4 w-4 text-destructive" />}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold font-mono uppercase text-muted-foreground">Master Authority</span>
                      <span className={`text-[9px] font-mono uppercase ${masterActive ? 'text-accent' : 'text-destructive'}`}>
                        {masterActive ? 'SIGNED_LUCAS_T77' : 'AUTHORITY_LOCKED'}
                      </span>
                    </div>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4 mt-auto">
        <div className="bg-secondary/30 rounded-lg p-3 border border-white/5">
          <div className="justify-between items-center mb-2 flex">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Estado da Mainnet
            </span>
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          </div>
          <p className="text-[11px] font-mono leading-none">
            MODO_SOBERANO_TOTAL
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-mono">
              <span>Índice de Senciência</span>
              <span>98.4%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[98.4%]"></div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
