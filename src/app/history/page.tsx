"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getTxRecords, fetchBlockchainTxHistory, clearTxRecords, type TxRecord } from "@/lib/txHistory";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, RefreshCw, ArrowUpRight, ArrowDownLeft, Sprout, Unlock, Vote, XCircle, Gift, AlertCircle } from "lucide-react";

const iconMap: Record<TxRecord["type"], typeof ArrowUpRight> = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  stake: Sprout,
  unstake: Unlock,
  vote: Vote,
  unvote: XCircle,
  reward: Gift,
};

const colorMap: Record<TxRecord["type"], string> = {
  send: "text-[#c24b46]",
  receive: "text-[#1d8f6d]",
  stake: "text-[#e8b056]",
  unstake: "text-[#d67035]",
  vote: "text-[#c24b46]",
  unvote: "text-[#5a5f63]",
  reward: "text-[#1d8f6d]",
};

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
        <main className="flex-1 px-6 py-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">トランザクション履歴</h2>
            <div className="flex items-center gap-3">
              <button onClick={fetchHistory} disabled={loading} className="w-10 h-10 flex items-center justify-center rounded-none border-2 border-text-primary bg-card text-text-secondary hover:text-text-primary disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              {records.length > 0 && (
                <button onClick={() => { clearTxRecords(); fetchHistory(); }} className="w-10 h-10 flex items-center justify-center rounded-none border-2 border-text-primary bg-card text-text-secondary hover:text-[#c24b46]">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {!merged ? (
            <div className="bg-card border-2 border-text-primary retro-shadow p-12 text-center text-text-secondary">ブロックチェーンから取得中...</div>
          ) : !records.length ? (
            <div className="bg-card border-2 border-text-primary retro-shadow p-12 text-center text-text-secondary flex flex-col items-center gap-3"><AlertCircle className="w-8 h-8" />履歴はありません</div>
          ) : (
            <div>
              <p className="text-xs text-text-secondary mb-4">ブロックチェーン {records.filter((r) => r.id.startsWith("chain_")).length}件 + ローカル {records.filter((r) => !r.id.startsWith("chain_")).length}件</p>
              <div className="bg-card border-2 border-text-primary retro-shadow divide-y-2 divide-bg">
                {records.map((tx) => {
                  const Icon = iconMap[tx.type] || ArrowUpRight;
                  const color = colorMap[tx.type] || "text-text-primary";
                  return (
                    <div key={tx.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-none bg-bg border border-text-primary flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-5 h-5" /></div>
                          <div className="min-w-0"><p className="text-sm font-medium text-text-primary">{tx.label}</p>{tx.counterparty && <p className="text-[11px] text-text-secondary truncate">{tx.counterparty}</p>}</div>
                        </div>
                        <div className="text-right flex-shrink-0"><p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-[#1d8f6d]" : "text-text-primary"}`}>{tx.amount}</p><p className="text-[10px] text-text-secondary">{fmt(tx.timestamp)}</p></div>
                      </div>
                      {tx.txHash && <p className="text-[10px] text-text-secondary/60 mt-2 font-mono truncate">{tx.txHash.slice(0, 20)}...</p>}
                      {tx.status === "failed" && tx.message && <p className="text-[10px] text-[#c24b46] mt-1">{tx.message}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
