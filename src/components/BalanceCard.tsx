"use client";

import { useIOSTBalance } from "@/hooks/useIOSTBalance";

interface BalanceCardProps {
  accountId: string;
}

export default function BalanceCard({ accountId }: BalanceCardProps) {
  const { balance, loading, error, refetch } = useIOSTBalance(accountId);

  if (loading) {
    return (
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-6 space-y-3">
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-slate-100 rounded w-20" />
          <div className="h-9 bg-slate-100 rounded w-36" />
          <div className="h-4 bg-slate-100 rounded w-28" />
          <div className="flex gap-4 pt-4 border-t-2 border-slate-200">
            <div className="flex-1 h-16 bg-slate-100 rounded-xl" />
            <div className="flex-1 h-16 bg-slate-100 rounded-xl" />
            <div className="flex-1 h-16 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-6">
        <p className="text-rose-500 text-sm font-bold">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 bg-white border-2 border-slate-300 text-sky-500 text-sm font-bold px-5 py-3 rounded-xl hover:bg-slate-50 transition-colors"
        >
          🔄 再取得
        </button>
      </div>
    );
  }

  const formatNumber = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-6 space-y-5">
      <div>
        <p className="text-slate-400 text-xs font-black mb-2">💰 Total Balance</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-black text-slate-700">
            {balance ? formatNumber(balance.iost) : "0"}
          </h2>
          <span className="text-lg font-bold text-slate-400">IOST</span>
        </div>
        <p className="text-slate-400 text-sm mt-2 font-bold">
          {balance ? `¥ ${balance.jpyEquivalent.toLocaleString("en-US")}` : "¥ 0"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-5 border-t-2 border-slate-200">
        <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-4 text-center">
          <p className="text-sky-500 text-[10px] font-black">⚡ Gas</p>
          <p className="text-slate-700 text-sm font-black">
            {balance ? formatNumber(balance.gas) : "0"}
          </p>
        </div>
        <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-4 text-center">
          <p className="text-violet-500 text-[10px] font-black">🧠 RAM</p>
          <p className="text-slate-700 text-sm font-black">
            {balance ? formatNumber(balance.ram) : "0"}
          </p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-500 text-[10px] font-black">🔒 Staked</p>
          <p className="text-slate-700 text-sm font-black">
            {balance ? formatNumber(balance.staked) : "0"}
          </p>
        </div>
      </div>
    </div>
  );
}
