"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  ArrowDownToLine, 
  Send, 
  Wallet,
  Globe
} from "lucide-react";
import { getShadowBalance } from "@/lib/nexus-treasury";
import { LUCAS_ADDRESSES_EXTERNAL } from "@/lib/treasury-constants";

/**
 * SOVEREIGN WALLET: LUCAS SATOSHI NAKAMOTO
 * UI Mobile-first 100% fiel ao dispositivo Lucas Satoshi (Screenshot Sync).
 * Exibe o saldo conforme o progresso do resgate multi-origem em tempo real.
 */
export default function LucasWalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<string>("0,00");
  const [brlValue, setBrlValue] = useState<string>("0,00");

  const refreshBalance = async () => {
    // Sincronia com a soma de todos os endereços de destino de Lucas
    let totalAccumulated = 0;
    for (const addr of LUCAS_ADDRESSES_EXTERNAL) {
      totalAccumulated += await getShadowBalance(addr);
    }
    
    // Formatação fiel ao dispositivo
    setBalance(totalAccumulated.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    
    // Câmbio BTC/BRL aproximado para visualização soberana
    const brl = totalAccumulated * 542260;
    setBrlValue(brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  };

  useEffect(() => {
    refreshBalance();
    const interval = setInterval(refreshBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-accent/30 overflow-hidden">
      {/* Barra de Status do Sistema - Estilo Android */}
      <div className="h-8 bg-black flex justify-end items-center px-4 gap-2 opacity-80">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white opacity-20" />
          <Globe className="h-3.5 w-3.5 text-white" />
          <span className="text-[11px] font-medium text-white/90">4G</span>
          <ArrowDownToLine className="h-3 w-3 text-white/90 rotate-180" />
        </div>
        <span className="text-[11px] font-medium text-white/90">22:22</span>
      </div>

      {/* Header Soberano - Estilo Screenshot Pixel-Perfect */}
      <header className="flex items-center justify-between px-4 py-4 bg-[#262626] border-b border-white/5 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-gray-400" />
          <h1 className="text-[16px] font-bold tracking-tight">Lucas Satoshi Nakamoto</h1>
        </div>
        <div className="relative">
          {/* Orb Verde de Status - Fiel ao Screenshot */}
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#4ade80] to-[#166534] shadow-[0_0_15px_rgba(74,222,128,0.9)] border border-green-300/30 animate-pulse" />
        </div>
      </header>

      {/* Área Central - Saldo e Mensagem */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        
        {/* Card de Saldo - Estética #2d2d2d */}
        <Card className="w-full max-w-sm bg-[#2d2d2d] border-none shadow-2xl rounded-2xl overflow-hidden mt-6">
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-[#60a5fa]">Saldo:</span>
                <span className="text-4xl font-bold">{balance} .</span>
                <span className="text-3xl font-light text-[#60a5fa]">BTC</span>
              </div>
              <p className="text-xl text-gray-500 font-medium tracking-tight">{brlValue} BRL</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#fbbf24] fill-[#fbbf24]" />
                  <span className="text-[15px] text-gray-300">Lightning:</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[15px] font-bold">{balance} .</span>
                  <span className="text-[15px] text-[#60a5fa]">BTC</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#3b82f6] flex items-center justify-center border border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase">B</span>
                  </div>
                  <span className="text-[15px] text-gray-300">On-chain:</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[15px] font-bold">0 .</span>
                  <span className="text-[15px] text-[#60a5fa]">BTC</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de Transações Vazias */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 opacity-40 py-20">
          <p className="text-[28px] font-medium leading-[1.3] text-gray-400 max-w-[280px]">
            Ainda não há transações nesta carteira
          </p>
        </div>
      </main>

      {/* Footer de Navegação */}
      <footer className="bg-[#262626] border-t border-white/5 grid grid-cols-2 h-24 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button 
          className="flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors border-r border-white/5 group"
          onClick={() => router.push('/wallet/addresses')}
        >
          <div className="relative">
             <div className="h-1.5 w-1.5 rounded-full bg-[#60a5fa] absolute -top-1 -right-1" />
             <ArrowDownToLine className="h-7 w-7 text-white group-active:scale-95 transition-transform" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">Receber</span>
        </button>
        <button 
          className="flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group"
          onClick={() => {}}
        >
          <Send className="h-7 w-7 text-white group-active:scale-95 transition-transform rotate-[-15deg]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">Enviar</span>
        </button>
      </footer>

      {/* Barra de Navegação Android */}
      <div className="h-16 bg-black flex items-center justify-around shrink-0 opacity-95 border-t border-white/5">
        <div className="w-4 h-4 border-2 border-gray-500 rotate-45 rounded-sm" />
        <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
        <div className="w-4.5 h-4.5 border-2 border-gray-500 rounded-sm" />
      </div>
    </div>
  );
}
