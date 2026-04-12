"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Wallet, ChevronDown, RefreshCcw, AlertTriangle } from "lucide-react";
import { LUCAS_ADDRESSES_EXTERNAL, LUCAS_ADDRESSES_INTERNAL } from "@/lib/treasury-constants";
import { getMultiBalances } from "@/lib/nexus-treasury";
import { useToast } from "@/hooks/use-toast";

/**
 * ADDRESSES PAGE: LUCAS SATOSHI NAKAMOTO
 * UI Mobile-first 100% fiel ao dispositivo Lucas Satoshi (Screenshot Sync).
 * Validação de saldo em tempo real para os endereços da Cold Wallet.
 */
export default function AddressesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalances = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const allAddresses = [...LUCAS_ADDRESSES_EXTERNAL, ...LUCAS_ADDRESSES_INTERNAL];
      const result = await getMultiBalances(allAddresses);
      setBalances(result);
    } catch (e: any) {
      console.error("Failed to fetch address balances:", e);
      setError("Falha na sincronia do Vault.");
      toast({ variant: "destructive", title: "Erro de Sincronia", description: "O motor de saldos falhou em responder." });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshBalances();
    const interval = setInterval(refreshBalances, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (addr: string) => {
    if (addr.length < 30) return addr;
    return `${addr.substring(0, 15)}...${addr.substring(addr.length - 12)}`;
  };

  const filteredExternal = LUCAS_ADDRESSES_EXTERNAL.filter(addr => 
    addr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInternal = LUCAS_ADDRESSES_INTERNAL.filter(addr => 
    addr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#222222] text-white font-sans selection:bg-accent/30 overflow-hidden">
      {/* Header Soberano - Estilo Screenshot */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#333333] border-b border-white/5 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:opacity-70 transition-opacity">
            <Wallet className="h-5 w-5 text-gray-400" />
          </button>
          <h1 className="text-[15px] font-bold tracking-tight">Lucas Satoshi Nakamoto</h1>
        </div>
        <div className="flex items-center gap-3">
          {error && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" title={error} />}
          <RefreshCcw 
            className={`h-4 w-4 text-gray-500 cursor-pointer hover:text-accent transition-all ${isRefreshing ? 'animate-spin text-accent' : ''}`} 
            onClick={refreshBalances}
          />
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#4ade80] to-[#166534] shadow-[0_0_15px_rgba(74,222,128,0.9)] border border-green-300/30 animate-pulse" />
        </div>
      </header>

      {/* Barra de Filtros e Ferramentas */}
      <div className="bg-[#333333] px-4 py-4 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Checkbox id="used" className="border-white/30 bg-[#444444] data-[state=checked]:bg-[#60a5fa] h-5 w-5 rounded-sm" checked />
            <label htmlFor="used" className="text-[13px] font-medium text-gray-200">Mostrar usados</label>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-gray-400">Mostrar</span>
            <div className="bg-[#444444] px-4 py-2 rounded flex items-center gap-6 cursor-pointer hover:bg-[#555555] transition-colors group">
              <span className="text-[13px] font-medium">Ambos</span>
              <ChevronDown className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="relative flex items-center border-b border-white/20 pb-1 mx-1">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="pesquisa"
            className="w-full bg-transparent text-sm placeholder:text-gray-500 outline-none h-8 font-light"
          />
          <Search className="h-4 w-4 text-gray-500 absolute right-0" />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-[#222222] scrollbar-hide pb-20">
        {/* Seção Endereço de recebimento */}
        <div className="flex items-center gap-4 px-4 py-5 bg-[#222222]">
          <div className="h-[1px] flex-1 bg-white/5" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-2">Endereço de recebimento</span>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        <div className="divide-y divide-white/5">
          {filteredExternal.map((addr, index) => (
            <div key={index} className="flex items-start gap-4 px-4 py-5 hover:bg-white/5 transition-colors cursor-pointer group">
              <span className="text-sm font-bold text-gray-100 min-w-[32px] mt-0.5 font-mono">
                #{index.toString().padStart(2, '0')}
              </span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 overflow-hidden">
                    <div className="h-6 w-6 bg-[#4ade80] rounded-sm flex-shrink-0 mt-0.5 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                    <p className="text-[14px] font-medium text-gray-200 break-all font-mono leading-snug tracking-tight">
                      {formatAddress(addr)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[13px] font-bold font-mono ${balances[addr] > 0 ? 'text-accent' : 'text-gray-500'}`}>
                      {balances[addr]?.toFixed(2) || '0.00'} BTC
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 pl-10 font-light">(sem rótulo)</p>
              </div>
            </div>
          ))}
        </div>

        {/* Seção Endereço de troco */}
        <div className="flex items-center gap-4 px-4 py-5 bg-[#222222] mt-4">
          <div className="h-[1px] flex-1 bg-white/5" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-2">Endereço de troco</span>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        <div className="divide-y divide-white/5">
          {filteredInternal.map((addr, index) => (
            <div key={index} className="flex items-start gap-4 px-4 py-5 hover:bg-white/5 transition-colors cursor-pointer group">
              <span className="text-sm font-bold text-gray-100 min-w-[32px] mt-0.5 font-mono">
                #{index.toString().padStart(2, '0')}
              </span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 overflow-hidden">
                    <div className="h-6 w-6 bg-[#facc15] rounded-sm flex-shrink-0 mt-0.5 shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                    <p className="text-[14px] font-medium text-gray-200 break-all font-mono leading-snug tracking-tight">
                      {formatAddress(addr)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[13px] font-bold font-mono ${balances[addr] > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>
                      {balances[addr]?.toFixed(2) || '0.00'} BTC
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 pl-10 font-light">(sem rótulo)</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Barra de Navegação do Android Simulada */}
      <div className="h-14 bg-black flex items-center justify-around shrink-0 opacity-90 border-t border-white/5 fixed bottom-0 left-0 right-0">
        <div className="w-4 h-4 border-2 border-gray-500 rotate-45 rounded-sm" />
        <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
        <div className="w-4 h-4 border-2 border-gray-500 rounded-sm" />
      </div>
    </div>
  );
}
