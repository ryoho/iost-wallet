"use client";

import { getTxRecords, type TxRecord } from "@/lib/txHistory";
import { useState, useEffect } from "react";

const icons: Record<TxRecord["type"], string> = { send: "📤", receive: "📥", stake: "🌱", unstake: "🔓", vote: "🗳️", unvote: "❌", reward: "🎁" };

export default function TxHistory() {
  const [records, setRecords] = useState<TxRecord[]>([]);
  useEffect(() => { setRecords(getTxRecords()); }, []);

  const fmt = (iso: string) => new Date(iso).toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  if (!records.length) return <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">📋 履歴はありません</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
      {records.map((tx) => (
        <div key={tx.id} className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0"><span>{icons[tx.type]}</span></div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">{tx.label}</p>
                {tx.counterparty && <p className="text-[11px] text-gray-400 truncate">{tx.counterparty}</p>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-green-500" : "text-gray-700"}`}>{tx.amount}</p>
              <p className="text-[10px] text-gray-400">{fmt(tx.timestamp)}</p>
            </div>
          </div>
          {tx.txHash && <p className="text-[10px] text-gray-300 mt-1 font-mono truncate">{tx.txHash.slice(0, 20)}...</p>}
          {tx.status === "failed" && tx.message && <p className="text-[10px] text-red-400 mt-1">{tx.message}</p>}
        </div>
      ))}
    </div>
  );
}
