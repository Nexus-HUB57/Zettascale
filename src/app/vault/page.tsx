"use client";

import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { NexusSidebar } from "@/components/nexus-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Progress } from "@/components/ui/progress";
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Loader2, 
  Activity, 
  Crown,
  Terminal,
  RefreshCcw,
  CheckCircle2,
  LockKeyhole,
  Database,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  Clock,
  Key,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getMainnetStats } from "@/lib/nexus-treasury";
import { getMasterKeyStatus, validateAndActivateAuthority } from "@/lib/master-key-service";
import { signOfflineHex } from "@/lib/nexus-signer";
import { useToast } from "@/hooks/use-toast";
import { runFullConsensusAudit, type CustodyValidationResult } from "@/lib/custody-validation";
import { TOTAL_SOVEREIGN_LASTRO, FINAL_MERKLE_ROOT } from "@/lib/treasury-constants";

export default function VaultPage() {
  const [mainnetStats, setMainnetStats] = useState<any>(null);
  const [masterStatus, setMasterStatus] = useState<any>(null);
  const [auditReport, setAuditReport] = useState<CustodyValidationResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Offline Signer State
  const [offlineWif, setOfflineWif] = useState("");
  const [unsignedHex, setUnsignedHex] = useState("");
  const [utxoAmount, setUtxoAmount] = useState("100000");
  const [isSigning, setIsSigning] = useState(false);
  const [signedResult, setSignedResult] = useState<any>(null);

  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    try {
      const [stats, mStatus] = await Promise.all([
        getMainnetStats(), 
        getMasterKeyStatus()
      ]);
      setMainnetStats(stats);
      setMasterStatus(mStatus);
    } catch (e) {
      console.error("Fail to sync vault stats:", e);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleUnlockAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnlocking(true);
    try {
      const result = await validateAndActivateAuthority(masterPassword);
      if (result.success) {
        toast({ title: "Autoridade Ativada", description: "Consenso Tri-Nuclear estabelecido." });
        setMasterPassword("");
        await refreshData();
      } else {
        toast({ variant: "destructive", title: "Acesso Negado", description: "Credenciais inválidas." });
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleOfflineSign = async () => {
    if (!offlineWif || !unsignedHex) {
      toast({ variant: "destructive", title: "Erro de Entrada", description: "WIF e HEX não assinado são obrigatórios." });
      return;
    }

    setIsSigning(true);
    try {
      const result = await signOfflineHex(offlineWif, unsignedHex, parseInt(utxoAmount));
      setSignedResult(result);
      toast({ title: "Assinatura Concluída", description: "Witness Stack injetada via Protocolo Offline." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de Assinatura", description: error.message });
    } finally {
      setIsSigning(false);
    }
  };

  const runMainnetAudit = async () => {
    setIsAuditing(true);
    try {
      const report = await runFullConsensusAudit();
      setAuditReport(report);
      toast({ title: "Auditoria de Confirmações", description: "TXIDs sincronizados com a blockchain." });
    } catch (e) {
      toast({ variant: "destructive", title: "Falha na Auditoria", description: "Erro ao conectar com as fontes de consenso." });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <NexusSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-white/10" />
            <h1 className="text-sm font-semibold tracking-tight uppercase flex items-center gap-2 text-accent">
              <Crown className="h-4 w-4 text-accent animate-pulse" /> Cofre Soberano <span className="text-muted-foreground mx-1">/</span> Verificação de Confirmações
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runMainnetAudit}
              disabled={isAuditing}
              className="h-8 border-accent/20 text-accent text-[9px] uppercase hover:bg-accent/10"
            >
              {isAuditing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-2" />}
              Audit Confirmações
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-gradient-to-br from-accent/10 to-blue-500/10 border-accent/30 relative overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-accent/20 text-accent border-accent/30 mb-2 font-mono text-[10px]">🔒 HEGEMONIA - LASTRO CONSOLIDADO</Badge>
                    <CardTitle className="text-2xl font-bold tracking-tight uppercase">Fundo Soberano Lucas Satoshi</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-1">Sincronia Plena ({TOTAL_SOVEREIGN_LASTRO.toLocaleString()} BTC)</p>
                  </div>
                  <Badge variant="outline" className="border-accent/30 text-accent font-mono text-[10px]">v11.0.0_PRODUCTION</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono tracking-tighter text-accent">{TOTAL_SOVEREIGN_LASTRO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-xl font-medium text-accent/60">BTC</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">Status da Auditoria</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      <p className="text-sm font-bold font-mono text-accent uppercase tracking-widest">X-Synced</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">Merkle Root</p>
                    <p className="text-[10px] font-mono text-foreground truncate">{FINAL_MERKLE_ROOT}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Estabilidade L7.7
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <span>Integridade de Lastro</span>
                    <span>{auditReport ? auditReport.integrityPercentage.toFixed(5) : '100'}%</span>
                  </div>
                  <Progress value={auditReport ? auditReport.integrityPercentage : 100} className="h-1 bg-white/5" />
                </div>
                <div className="p-3 bg-secondary/20 rounded border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-muted-foreground">Relatório Gerado</span>
                    <Activity className="h-3 w-3 text-accent animate-pulse" />
                  </div>
                  <p className="text-[10px] font-mono text-accent truncate">
                    {auditReport ? new Date(auditReport.timestamp).toLocaleString() : 'AGUARDANDO_PULSO...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {!masterStatus?.isActive ? (
            <Card className="bg-secondary/10 border-white/5 max-w-md mx-auto">
              <CardHeader className="text-center">
                <LockKeyhole className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="text-sm uppercase tracking-widest">Autenticação Soberana</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUnlockAttempt} className="space-y-4">
                  <input 
                    type="password" 
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded h-10 px-3 text-xs font-mono outline-none focus:border-accent/50"
                    placeholder="PASSWORD_SOVEREIGN"
                  />
                  <Button type="submit" disabled={isUnlocking} className="w-full bg-accent text-accent-foreground font-mono uppercase text-[10px] h-10">
                    {isUnlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock Sovereign Vault"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Offline Signer UI */}
                <Card className="bg-card/50 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-orange-400">
                      <ShieldAlert className="h-4 w-4" /> Offline Transaction Signer
                    </CardTitle>
                    <CardDescription className="text-[10px] font-mono">
                      Assine HEX bruto em ambiente isolado. Protocolo BIP-143.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-muted-foreground">Chave WIF Agêntica</label>
                      <Input 
                        type="password"
                        value={offlineWif}
                        onChange={(e) => setOfflineWif(e.target.value)}
                        placeholder="L..." 
                        className="bg-secondary/20 border-white/5 h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-muted-foreground">Unsigned RAW HEX</label>
                      <Textarea 
                        value={unsignedHex}
                        onChange={(e) => setUnsignedHex(e.target.value)}
                        placeholder="01000000..." 
                        className="bg-secondary/20 border-white/5 min-h-[100px] text-[10px] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-muted-foreground">UTXO Value (Sats)</label>
                      <Input 
                        type="number"
                        value={utxoAmount}
                        onChange={(e) => setUtxoAmount(e.target.value)}
                        className="bg-secondary/20 border-white/5 h-9 text-xs font-mono"
                      />
                    </div>
                    <Button 
                      onClick={handleOfflineSign} 
                      disabled={isSigning}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-mono uppercase text-[10px] h-10"
                    >
                      {isSigning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Key className="h-3 w-3 mr-2" />}
                      🔒 Assinar Offline
                    </Button>

                    {signedResult && (
                      <div className="pt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] font-bold text-accent uppercase flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" /> Assinatura Concluída
                        </p>
                        <Textarea 
                          readOnly
                          value={signedResult.signedHex}
                          className="bg-black/40 border-accent/20 text-accent text-[9px] font-mono min-h-[80px]"
                        />
                        <p className="text-[8px] text-muted-foreground font-mono">TXID: {signedResult.txid}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Confirmations Registry */}
                <Card className="bg-black/60 border-white/5">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2 text-blue-400">
                      <Terminal className="h-4 w-4" /> Registro de Confirmações (TXIDs)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-y-auto max-h-[450px] scrollbar-hide">
                    <div className="divide-y divide-white/5">
                      {auditReport?.recentTxids.map((tx, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 h-8 w-8 rounded flex items-center justify-center border ${tx.status === 'CONFIRMED' ? 'bg-accent/10 border-accent/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                              {tx.status === 'CONFIRMED' ? <ShieldCheck className="h-4 w-4 text-accent" /> : <Clock className="h-4 w-4 text-orange-400" />}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[8px] font-mono uppercase ${tx.status === 'CONFIRMED' ? 'border-accent/30 text-accent' : 'border-orange-500/30 text-orange-400'}`}>
                                  {tx.type} | {tx.status}
                                </Badge>
                                <span className="text-[10px] font-bold text-foreground">+{tx.amount.toLocaleString()} BTC</span>
                              </div>
                              <p className="text-[10px] font-mono text-muted-foreground break-all max-w-md">
                                {tx.txid}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-400" asChild>
                            <a href={`https://mempool.space/tx/${tx.txid}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      )) || (
                        <div className="p-12 text-center text-muted-foreground opacity-50 italic uppercase font-mono text-[10px] tracking-widest">
                          Execute a auditoria para sincronizar confirmações...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase font-mono tracking-widest flex items-center gap-2">
                    <Database className="h-4 w-4 text-accent" /> Livro Razão de Hegemonia (Auditado)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[10px]">
                      <thead className="bg-white/5 text-muted-foreground uppercase">
                        <tr>
                          <th className="px-4 py-3">Endereço Soberano</th>
                          <th className="px-4 py-3 text-right">Saldo Real (BTC)</th>
                          <th className="px-4 py-3 text-center">Consenso</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {auditReport?.wallets.map((w, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="px-4 py-3 truncate max-w-[250px] text-accent/80 font-mono">{w.address}</td>
                            <td className="px-4 py-3 text-right font-bold">{w.balance.toFixed(8)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-1">
                                {w.sources.map((s, si) => (
                                  <div key={si} className="h-1.5 w-1.5 rounded-full bg-accent" />
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Badge className={`text-[8px] h-4 ${w.balance > 0 ? 'bg-accent/10 text-accent' : 'bg-secondary'}`}>
                                {w.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
