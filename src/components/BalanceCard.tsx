"use client";

import { useIOSTBalance } from "@/hooks/useIOSTBalance";

interface BalanceCardProps {
  accountId: string;
}

export default function BalanceCard({ accountId }: BalanceCardProps) {
  const { balance, loading, error, refetch } = useIOSTBalance(accountId);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-20 mb-3" />
        <div className="h-8 bg-gray-100 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="h-14 bg-gray-100 rounded-lg" />
          <div className="h-14 bg-gray-100 rounded-lg" />
          <div className="h-14 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={refetch} className="mt-3 text-blue-500 text-sm font-medium">🔄 再取得</button>
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-gray-400 text-xs font-medium mb-1">💰 Total Balance</p>
      <div className="flex items-baseline gap-1.5">
        <h2 className="text-2xl font-bold text-gray-800">{balance ? fmt(balance.iost) : "0"}</h2>
        <span className="text-sm text-gray-400 font-medium">IOST</span>
      </div>
      <p className="text-gray-400 text-sm mt-0.5">{balance ? `¥ ${balance.jpyEquivalent.toLocaleString("en-US")}` : "¥ 0"}</p>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-blue-400 text-[10px] font-medium">⚡ Gas</p>
          <p className="text-gray-700 text-sm font-semibold">{balance ? fmt(balance.gas) : "0"}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-purple-400 text-[10px] font-medium">🧠 RAM</p>
          <p className="text-gray-700 text-sm font-semibold">{balance ? fmt(balance.ram) : "0"}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-amber-500 text-[10px] font-medium">🔒 Staked</p>
          <p className="text-gray-700 text-sm font-semibold">{balance ? fmt(balance.staked) : "0"}</p>
        </div>
      </div>
    </div>
  );
}
