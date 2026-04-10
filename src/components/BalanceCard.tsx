"use client";

import { useIOSTBalance } from "@/hooks/useIOSTBalance";
import { useIostRate } from "@/hooks/useIostRate";
import { Zap, Cpu, Lock, RefreshCw } from "lucide-react";

interface BalanceCardProps {
  accountId: string;
}

export default function BalanceCard({ accountId }: BalanceCardProps) {
  const { balance, loading, error, refetch } = useIOSTBalance(accountId);
  const rate = useIostRate();

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  const fmt2 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="bg-card border-2 border-text-primary retro-shadow p-6 animate-pulse">
        <div className="h-3 bg-bg rounded w-20 mb-3" />
        <div className="h-8 bg-bg rounded w-32 mb-2" />
        <div className="h-4 bg-bg rounded w-24 mb-4" />
        <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-bg">
          <div className="h-16 bg-bg rounded-none" />
          <div className="h-16 bg-bg rounded-none" />
          <div className="h-16 bg-bg rounded-none" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border-2 border-text-primary retro-shadow p-6">
        <p className="text-[#c24b46] text-sm">{error}</p>
        <button onClick={refetch} className="mt-3 text-[#1d8f6d] text-sm font-medium border-2 border-[#1d8f6d] px-4 py-2 hover:bg-[#1d8f6d]/10 transition-colors flex items-center gap-2"><RefreshCw className="w-3 h-3" /> 再取得</button>
      </div>
    );
  }

  const fmt2b = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="bg-card border-2 border-text-primary retro-shadow p-6">
      <p className="text-text-secondary text-xs font-medium mb-2">Total Balance</p>
      <div className="flex items-baseline gap-1.5">
        <h2 className="text-3xl font-bold text-text-primary">{balance ? fmt2b(balance.iost) : "0"}</h2>
        <span className="text-sm text-text-secondary font-medium">IOST</span>
      </div>
      {rate > 0 && balance && <p className="text-text-secondary text-sm mt-1">¥ {balance.jpyEquivalent.toLocaleString("en-US")} ({fmt(rate)} JPY/IOST)</p>}

      <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t-2 border-bg">
        <div className="bg-[#e8b056]/10 border-2 border-text-primary rounded-none p-4 text-center">
          <Zap className="w-5 h-5 text-[#e8b056] mx-auto mb-1" />
          <p className="text-text-secondary text-[10px] font-medium">Gas</p>
          <p className="text-text-primary text-sm font-semibold">{balance ? fmt2b(balance.gas) : "0"}</p>
        </div>
        <div className="bg-[#d67035]/10 border-2 border-text-primary rounded-none p-4 text-center">
          <Cpu className="w-5 h-5 text-[#d67035] mx-auto mb-1" />
          <p className="text-text-secondary text-[10px] font-medium">RAM</p>
          <p className="text-text-primary text-sm font-semibold">{balance ? fmt2b(balance.ram) : "0"}</p>
        </div>
        <div className="bg-[#1d8f6d]/10 border-2 border-text-primary rounded-none p-4 text-center">
          <Lock className="w-5 h-5 text-[#1d8f6d] mx-auto mb-1" />
          <p className="text-text-secondary text-[10px] font-medium">Staked</p>
          <p className="text-text-primary text-sm font-semibold">{balance ? fmt2b(balance.staked) : "0"}</p>
        </div>
      </div>
    </div>
  );
}
