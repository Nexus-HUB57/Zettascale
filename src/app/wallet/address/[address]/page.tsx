"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  Share2, 
  Edit2, 
  Wallet,
  Globe,
  ArrowDownToLine,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { getAddressInfo } from "@/lib/nexus-treasury";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * ADDRESS DETAILS: LUCAS SATOSHI NAKAMOTO
 * UI Mobile-first 100% fiel ao dispositivo Lucas Satoshi (Screenshot Sync).
 */
export default function AddressDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;
  const [info, setInfo] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadInfo = async () => {
      const data = await getAddressInfo(address);
      setInfo(data);
    };
    loadInfo();
  }, [address]);

  if (!isMounted || !info) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-accent/30 overflow-hidden">
      <div className="h-8 bg-black flex justify-end items-center px-4 gap-2 opacity-80">
        <div className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5 text-white" />
          <span className="text-[11px] font-medium text-white/90">4G</span>
          <ArrowDownToLine className="h-3 w-3 text-white/90 rotate-180" />
        </div>
        <span className="text-[11px] font-medium text-white/90">23:49</span>
      </div>

      <header className="flex items-center justify-between px-4 py-4 bg-[#262626] border-b border-white/5 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:opacity-70 transition-opacity">
            <ChevronLeft className="h-6 w-6 text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-gray-400" />
            <h1 className="text-[16px] font-bold tracking-tight">Lucas Satoshi Nakamoto</h1>
          </div>
        </div>
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#4ade80] to-[#166534] shadow-[0_0_15px_rgba(74,222,128,0.9)] border border-green-300/30 animate-pulse" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-32">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em] px-2 whitespace-nowrap">Detalhes do endereço</span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <div className="space-y-4">
          <p className="text-[13px] font-bold text-[#60a5fa] uppercase tracking-wide">Endereço</p>
          <div className="bg-[#2d2d2d] p-4 rounded-xl flex items-center justify-between gap-4 border border-white/5 shadow-inner">
            <p className="text-base font-mono break-all leading-relaxed text-gray-200">
              {info.address}
            </p>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors shrink-0">
              <Share2 className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[14px] text-[#60a5fa] font-medium">Saldo</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{info.balance.toLocaleString('pt-BR')} .</span>
              <span className="text-lg font-medium text-[#60a5fa]">BTC</span>
              <span className="text-[12px] text-gray-500 ml-1">({(info.balance * 542260).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-[14px] text-[#60a5fa] font-medium">Transações</span>
            <span className="text-lg font-bold text-white">{info.transactions}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] font-bold text-[#60a5fa] uppercase tracking-wide">Rótulo</p>
          <div className="bg-[#2d2d2d] p-6 rounded-xl flex items-center justify-between border border-white/5 relative min-h-[80px]">
            <span className="text-sm font-mono text-gray-300">Endereço Soberano Cold Wallet 02</span>
            <Edit2 className="h-5 w-5 text-[#fbbf24] absolute right-4 bottom-4" />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em] px-2 whitespace-nowrap">Propriedades técnicas</span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-[#60a5fa]">Tipo de script</span>
            <span className="font-mono text-gray-200">{info.scriptType}</span>
          </div>
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-[#60a5fa]">Caminho de derivação</span>
            <span className="font-mono text-gray-200">{info.derivationPath}</span>
          </div>
          
          <div className="space-y-2 pt-2">
            <p className="text-[13px] text-[#60a5fa] font-medium uppercase tracking-wide">Chave pública</p>
            <div className="bg-[#2d2d2d] p-4 rounded-xl flex items-center justify-between gap-4 border border-white/5">
              <p className="text-[13px] font-mono break-all text-gray-400">
                {info.publicKey}
              </p>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors shrink-0">
                <Share2 className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#262626] border-t border-white/5 grid grid-cols-2 h-20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] fixed bottom-16 left-0 right-0">
        <button className="flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors border-r border-white/5">
          <Zap className="h-6 w-6 text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Endereço congelado</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors">
          <Edit2 className="h-6 w-6 text-white" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">Assinar/Verificar</span>
        </button>
      </footer>

      <div className="h-16 bg-black flex items-center justify-around shrink-0 opacity-95 border-t border-white/5 fixed bottom-0 left-0 right-0">
        <div className="w-4 h-4 border-2 border-gray-500 rotate-45 rounded-sm" />
        <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
        <div className="w-4.5 h-4.5 border-2 border-gray-500 rounded-sm" />
      </div>
    </div>
  );
}
