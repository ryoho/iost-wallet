"use client";

import { ArrowUpRight, ArrowDownLeft, Sprout, Unlock, Vote, XCircle, Gift } from "lucide-react";
import { getTxRecords, fetchBlockchainTxHistory, type TxRecord } from "@/lib/txHistory";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

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

export default function TxHistory({ accountId }: { accountId: string }) {
  const [records, setRecords] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [merged, setMerged] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const [localRecords, chainRecords] = await Promise.all([
        Promise.resolve(getTxRecords()),
        fetchBlockchainTxHistory(accountId, 20),
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
  }, [accountId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const fmt = (iso: string) => new Date(iso).toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  if (loading || !merged) {
    return <div className="bg-card border-2 border-text-primary retro-shadow p-8 text-center text-text-secondary">取得中...</div>;
  }

  if (!records.length) return <div className="bg-card border-2 border-text-primary retro-shadow p-8 text-center text-text-secondary">履歴はありません</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-secondary">チェーン {records.filter((r) => r.id.startsWith("chain_")).length}件 + ローカル {records.filter((r) => !r.id.startsWith("chain_")).length}件</p>
        <button onClick={fetchHistory} disabled={loading} className="w-8 h-8 flex items-center justify-center rounded-none border border-text-primary bg-card text-text-secondary hover:text-text-primary disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="bg-card border-2 border-text-primary retro-shadow divide-y-2 divide-bg">
        {records.map((tx) => {
          const Icon = iconMap[tx.type] || ArrowUpRight;
          const color = colorMap[tx.type] || "text-text-primary";
          return (
            <div key={tx.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-none bg-bg border border-text-primary flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{tx.label}</p>
                    {tx.counterparty && <p className="text-[11px] text-text-secondary truncate">{tx.counterparty}</p>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-[#1d8f6d]" : "text-text-primary"}`}>{tx.amount}</p>
                  <p className="text-[10px] text-text-secondary">{fmt(tx.timestamp)}</p>
                </div>
              </div>
              {tx.txHash && <p className="text-[10px] text-text-secondary/60 mt-1 font-mono truncate">{tx.txHash.slice(0, 20)}...</p>}
              {tx.status === "failed" && tx.message && <p className="text-[10px] text-[#c24b46] mt-1">{tx.message}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
