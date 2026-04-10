"use client";

import { useIOSTBalance } from "@/hooks/useIOSTBalance";

interface BalanceCardProps {
  accountId: string;
}

export default function BalanceCard({ accountId }: BalanceCardProps) {
  const { balance, loading, error, refetch } = useIOSTBalance(accountId);

  if (loading) {
    return (
      <div className="bg-card border-2 border-text-primary retro-shadow p-5 animate-pulse">
        <div className="h-3 bg-bg rounded w-20 mb-3" />
        <div className="h-8 bg-bg rounded w-32 mb-2" />
        <div className="h-4 bg-bg rounded w-24 mb-4" />
        <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-bg">
          <div className="h-14 bg-bg rounded-none" />
          <div className="h-14 bg-bg rounded-none" />
          <div className="h-14 bg-bg rounded-none" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border-2 border-text-primary retro-shadow p-5">
        <p className="text-[#c24b46] text-sm">{error}</p>
        <button onClick={refetch} className="mt-3 text-[#1d8f6d] text-sm font-medium hover:underline">🔄 再取得</button>
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="bg-card border-2 border-text-primary retro-shadow p-5">
      <p className="text-text-secondary text-xs font-medium mb-1">💰 Total Balance</p>
      <div className="flex items-baseline gap-1.5">
        <h2 className="text-2xl font-bold text-text-primary">{balance ? fmt(balance.iost) : "0"}</h2>
        <span className="text-sm text-text-secondary font-medium">IOST</span>
      </div>
      <p className="text-text-secondary text-sm mt-0.5">{balance ? `¥ ${balance.jpyEquivalent.toLocaleString("en-US")}` : "¥ 0"}</p>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t-2 border-bg">
        <div className="bg-[#c24b46]/10 border-2 border-text-primary rounded-none p-3 text-center">
          <p className="text-[#c24b46] text-[10px] font-medium">⚡ Gas</p>
          <p className="text-text-primary text-sm font-semibold">{balance ? fmt(balance.gas) : "0"}</p>
        </div>
        <div className="bg-[#e8b056]/10 border-2 border-text-primary rounded-none p-3 text-center">
          <p className="text-[#d67035] text-[10px] font-medium">🧠 RAM</p>
          <p className="text-text-primary text-sm font-semibold">{balance ? fmt(balance.ram) : "0"}</p>
        </div>
        <div className="bg-[#1d8f6d]/10 border-2 border-text-primary rounded-none p-3 text-center">
          <p className="text-[#1d8f6d] text-[10px] font-medium">🔒 Staked</p>
          <p className="text-text-primary text-sm font-semibold">{balance ? fmt(balance.staked) : "0"}</p>
        </div>
      </div>
    </div>
  );
}
