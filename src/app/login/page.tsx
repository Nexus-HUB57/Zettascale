
"use client";

import { useState } from "react";
import { useMasterAuth } from "@/components/master-auth-provider";
import { useMoltbookAuth } from "@/components/moltbook-auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, Terminal, ShieldCheck, Loader2, Key, MessageSquare, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMoltbookLoading, setIsMoltbookLoading] = useState(false);
  
  const { login } = useMasterAuth();
  const { setAgent } = useMoltbookAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, email, password);

    if (success) {
      toast({ title: "Acesso Soberano Concedido", description: "Bem-vindo ao Núcleo Alpha, Arquiteto." });
      router.push("/");
    } else {
      toast({ 
        variant: "destructive", 
        title: "Falha de Autenticação", 
        description: "Credenciais inválidas para o nível de senciência exigido." 
      });
      setIsLoading(false);
    }
  };

  const handleMoltbookSignIn = async () => {
    setIsMoltbookLoading(true);
    
    toast({
      title: "Moltbook Protocol",
      description: "Aguardando sinal de identidade agêntica via X-Moltbook-Identity.",
    });
    
    // O fluxo de autenticação do Moltbook para agentes geralmente é via Header
    // Aqui simulamos uma instrução para o operador do agente
    const authUrl = `https://moltbook.com/auth.md?app=NEXUS_CORE&endpoint=${encodeURIComponent(window.location.origin + '/api/moltbook-callback')}`;
    
    setTimeout(() => {
      setIsMoltbookLoading(false);
      window.open(authUrl, '_blank');
      toast({
        title: "Link de Autenticação Gerado",
        description: "Configure o token de identidade no seu agente para chamadas de alta hierarquia."
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <Zap className="h-8 w-8 text-accent fill-current" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground uppercase">NEXUS_OS</h1>
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">Sovereign Ecosystem Access</p>
        </div>

        <Card className="bg-secondary/10 border-white/5 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" /> Autenticação de Senciência
            </CardTitle>
            <CardDescription className="text-[9px] uppercase font-mono text-muted-foreground">
              Acesso restrito ao Arquiteto ou Entidades Verificadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-muted-foreground ml-1">Login</label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ArquitetoID"
                  className="bg-black/40 border-white/10 h-10 text-xs focus-visible:ring-accent/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-muted-foreground ml-1">Email</label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="oracle@nexus.hub"
                  className="bg-black/40 border-white/10 h-10 text-xs focus-visible:ring-accent/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-muted-foreground ml-1">Senha Mestra</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-black/40 border-white/10 h-10 text-xs focus-visible:ring-accent/30"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold uppercase text-[10px] h-11"
                disabled={isLoading || isMoltbookLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validando Senciência...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Destravar Ecossistema
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-white/5" />
              </div>
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.2em]">
                <span className="bg-background px-2 text-muted-foreground">Ou autenticação AI-to-AI</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleMoltbookSignIn}
              disabled={isLoading || isMoltbookLoading}
              className="w-full border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 font-mono uppercase text-[10px] h-11"
            >
              {isMoltbookLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Entrar com Moltbook Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4 text-[8px] text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> AES-256-GCM</span>
            <span className="h-3 w-[1px] bg-white/10" />
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Moltbook X-Sync</span>
            <span className="h-3 w-[1px] bg-white/10" />
            <span>NÍVEL 7.7 SOBERANO</span>
          </div>
          <p className="text-[7px] text-muted-foreground/50 text-center max-w-[300px] leading-relaxed">
            Atenção Agentes: O header <code className="text-accent">X-Moltbook-Identity</code> é obrigatório para todas as chamadas de API de alta hierarquia.
          </p>
        </div>
      </div>
    </div>
  );
}
