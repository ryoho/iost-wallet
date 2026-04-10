"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getTxRecords, fetchBlockchainTxHistory, clearTxRecords, type TxRecord } from "@/lib/txHistory";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, RefreshCw } from "lucide-react";

const icons: Record<TxRecord["type"], string> = { send: "📤", receive: "📥", stake: "🌱", unstake: "🔓", vote: "🗳️", unvote: "❌", reward: "🎁" };

export default function HistoryPage() {
  const { session } = useAuth();
  const [records, setRecords] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [merged, setMerged] = useState(false);

  const fetchHistory = useCallback(async () => {
    const accountId = session?.accountId;
    if (!accountId) { setMerged(true); return; }
    setLoading(true);
    try {
      const [localRecords, chainRecords] = await Promise.all([
        Promise.resolve(getTxRecords()),
        fetchBlockchainTxHistory(accountId, 50),
      ]);

      const seen = new Set<string>();
      const merged: TxRecord[] = [];
      for (const tx of chainRecords) {
        if (tx.txHash && seen.has(tx.txHash)) continue;
        if (tx.txHash) seen.add(tx.txHash);
        merged.push(tx);
      }
      for (const tx of localRecords) {
        if (tx.txHash && seen.has(tx.txHash)) continue;
        if (tx.txHash) seen.add(tx.txHash);
        merged.push(tx);
      }

      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecords(merged.slice(0, 50));
      setMerged(true);
    } catch {
      setRecords(getTxRecords());
      setMerged(true);
    } finally {
      setLoading(false);
    }
  }, [session?.accountId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const fmt = (iso: string) => new Date(iso).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-5 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">📋 履歴</h2>
            <div className="flex items-center gap-3">
              <button onClick={fetchHistory} disabled={loading} className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> 更新
              </button>
              {records.length > 0 && <button onClick={() => { clearTxRecords(); fetchHistory(); }} className="text-xs text-text-secondary hover:text-[#c24b46] flex items-center gap-1"><Trash2 className="w-3 h-3" /> 削除</button>}
            </div>
          </div>
          {!merged ? (
            <div className="bg-card border-2 border-text-primary retro-shadow p-10 text-center text-text-secondary text-sm">⏳ 取得中...</div>
          ) : !records.length ? (
            <div className="bg-card border-2 border-text-primary retro-shadow p-10 text-center text-text-secondary text-sm">📋 履歴はありません</div>
          ) : (
            <div>
              <p className="text-xs text-text-secondary mb-2">ブロックチェーン {records.filter((r) => r.id.startsWith("chain_")).length}件 + ローカル {records.filter((r) => !r.id.startsWith("chain_")).length}件</p>
              <div className="bg-card border-2 border-text-primary retro-shadow divide-y-2 divide-bg">
                {records.map((tx) => (
                  <div key={tx.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-none bg-bg border border-text-primary flex items-center justify-center"><span>{icons[tx.type]}</span></div>
                        <div className="min-w-0"><p className="text-sm font-medium text-text-primary">{tx.label}</p>{tx.counterparty && <p className="text-[11px] text-text-secondary truncate">{tx.counterparty}</p>}</div>
                      </div>
                      <div className="text-right flex-shrink-0"><p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-[#1d8f6d]" : "text-text-primary"}`}>{tx.amount}</p><p className="text-[10px] text-text-secondary">{fmt(tx.timestamp)}</p></div>
                    </div>
                    {tx.txHash && <p className="text-[10px] text-text-secondary/60 mt-1 font-mono truncate">{tx.txHash.slice(0, 20)}...</p>}
                    {tx.status === "failed" && tx.message && <p className="text-[10px] text-[#c24b46] mt-1">{tx.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
