"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getTxRecords, clearTxRecords, type TxRecord } from "@/lib/txHistory";

const icons: Record<TxRecord["type"], string> = { send: "📤", receive: "📥", stake: "🌱", unstake: "🔓", vote: "🗳️", unvote: "❌", reward: "🎁" };

export default function HistoryPage() {
  const [records, setRecords] = useState<TxRecord[]>(getTxRecords());
  const fmt = (iso: string) => new Date(iso).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-5 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">📋 履歴</h2>
            {records.length > 0 && <button onClick={() => { clearTxRecords(); setRecords([]); }} className="text-xs text-gray-400 hover:text-red-400">🗑️ 削除</button>}
          </div>
          {!records.length ? <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400 text-sm">📋 履歴はありません</div> : (
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
              {records.map((tx) => (
                <div key={tx.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><span>{icons[tx.type]}</span></div>
                      <div className="min-w-0"><p className="text-sm font-medium text-gray-700">{tx.label}</p>{tx.counterparty && <p className="text-[11px] text-gray-400 truncate">{tx.counterparty}</p>}</div>
                    </div>
                    <div className="text-right flex-shrink-0"><p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-green-500" : "text-gray-700"}`}>{tx.amount}</p><p className="text-[10px] text-gray-400">{fmt(tx.timestamp)}</p></div>
                  </div>
                  {tx.status === "failed" && tx.message && <p className="text-[10px] text-red-400 mt-1">{tx.message}</p>}
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
