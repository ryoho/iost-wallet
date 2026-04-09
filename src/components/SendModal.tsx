"use client";

import { useState, type FormEvent } from "react";
import { sendTransfer } from "@/lib/transaction";
import { addTxRecord } from "@/lib/txHistory";

interface Props {
  accountId: string;
  privateKey: string;
  balance: number;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  onError: (msg: string) => void;
}

export default function SendModal({ accountId, privateKey, balance, onClose, onSuccess, onError }: Props) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!to.trim()) { setError("宛先を入力してください"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("数量を入力してください"); return; }
    if (parseFloat(amount) > balance) { setError("残高が不足しています"); return; }
    setLoading(true);
    try {
      const r = await sendTransfer(accountId, privateKey, { from: accountId, to: to.trim(), amount: parseFloat(amount).toFixed(8), memo: memo.trim() });
      if (r.status === "success") {
        addTxRecord({ type: "send", label: "📤 送信", amount: `-${parseFloat(amount).toLocaleString("en-US")} IOST`, counterparty: to.trim(), txHash: r.txHash, status: "success" });
        onSuccess(r.txHash);
      } else {
        addTxRecord({ type: "send", label: "📤 送信", amount: `-${parseFloat(amount).toLocaleString("en-US")} IOST`, counterparty: to.trim(), txHash: r.txHash, status: "failed", message: r.message });
        onError(r.message || "送金に失敗しました");
      }
    } catch (err: unknown) { onError(err instanceof Error ? err.message : "送金に失敗しました"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-base font-semibold text-gray-800">📤 送金</h3><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">✕</button></div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">宛先</label><input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="iost_xxxxx" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" required /></div>
          <div>
            <div className="flex items-center justify-between mb-1"><label className="block text-sm font-medium text-gray-700">数量</label><button type="button" onClick={() => setAmount(balance.toString())} className="text-xs text-blue-500 font-medium">最大: {balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}</button></div>
            <div className="relative"><input type="number" step="0.00000001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 pr-14 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">IOST</span></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label><input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={100} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          {error && <div className="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-3">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{loading ? "送信中..." : "送信する"}</button>
        </form>
      </div>
    </div>
  );
}
