"use client";

import { getTxRecords, type TxRecord } from "@/lib/txHistory";
import { useState, useEffect } from "react";

const typeIconMap: Record<TxRecord["type"], string> = {
  send: "📤", receive: "📥", stake: "🌱", unstake: "🔓",
  vote: "🗳️", unvote: "❌", reward: "🎁",
};

export default function TxHistory() {
  const [records, setRecords] = useState<TxRecord[]>([]);

  useEffect(() => {
    setRecords(getTxRecords());
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  if (records.length === 0) {
    return (
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-8 text-center">
        <p className="text-slate-400 text-sm font-bold">📋 トランザクション履歴はありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md divide-y-2 divide-slate-200">
      {records.map((tx) => (
        <div key={tx.id} className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                <span className="text-xl">{typeIconMap[tx.type]}</span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-700">{tx.label}</p>
                {tx.counterparty && (
                  <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                    {tx.counterparty}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${tx.amount.startsWith("+") ? "text-emerald-500" : "text-slate-700"}`}>
                {tx.amount}
              </p>
              <p className="text-[10px] text-slate-400 font-bold">{formatDate(tx.timestamp)}</p>
            </div>
          </div>
          {tx.txHash && (
            <p className="text-[10px] text-slate-300 mt-2 font-mono truncate">TX: {tx.txHash}</p>
          )}
          {tx.status === "failed" && tx.message && (
            <p className="text-[10px] text-rose-500 mt-2 font-bold">❌ {tx.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
