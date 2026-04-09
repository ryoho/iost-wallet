"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getTxRecords, clearTxRecords, type TxRecord } from "@/lib/txHistory";

const typeIconMap: Record<TxRecord["type"], string> = {
  send: "📤", receive: "📥", stake: "🌱", unstake: "🔓",
  vote: "🗳️", unvote: "❌", reward: "🎁",
};

export default function HistoryPage() {
  const [records, setRecords] = useState<TxRecord[]>(getTxRecords());
  const handleClear = () => { clearTxRecords(); setRecords([]); };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        <main className="flex-1 px-6 py-8 pb-28">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-700">📋 トランザクション履歴</h2>
            {records.length > 0 && (
              <button onClick={handleClear} className="text-xs text-slate-400 hover:text-rose-500 transition-colors font-bold">
                🗑️ すべて削除
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-12 text-center">
              <span className="text-6xl block mb-4">📋</span>
              <p className="text-slate-400 text-sm font-bold">トランザクション履歴はありません</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md divide-y-2 divide-slate-200">
              {records.map((tx) => (
                <div key={tx.id} className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                        <span className="text-xl">{typeIconMap[tx.type]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">{tx.label}</p>
                        {tx.counterparty && (
                          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">{tx.counterparty}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${tx.amount.startsWith("+") ? "text-emerald-500" : "text-slate-700"}`}>{tx.amount}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{formatDate(tx.timestamp)}</p>
                    </div>
                  </div>
                  {tx.txHash && <p className="text-[10px] text-slate-300 mt-2 font-mono truncate">TX: {tx.txHash}</p>}
                  {tx.status === "failed" && tx.message && <p className="text-[10px] text-rose-500 mt-2 font-bold">❌ {tx.message}</p>}
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </RequireAuth>
  );
}
