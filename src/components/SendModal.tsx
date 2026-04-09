"use client";

import { useState, type FormEvent } from "react";
import { sendTransfer } from "@/lib/transaction";
import { addTxRecord } from "@/lib/txHistory";

interface SendModalProps {
  accountId: string;
  privateKey: string;
  balance: number;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  onError: (message: string) => void;
}

export default function SendModal({
  accountId, privateKey, balance, onClose, onSuccess, onError,
}: SendModalProps) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!to.trim()) { setError("⚠️ 宛先を入力してください。"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("⚠️ 有効な数量を入力してください。"); return; }
    if (parseFloat(amount) > balance) { setError("⚠️ 残高が不足しています。"); return; }

    setLoading(true);
    try {
      const result = await sendTransfer(accountId, privateKey, {
        from: accountId, to: to.trim(),
        amount: parseFloat(amount).toFixed(8), memo: memo.trim(),
      });

      if (result.status === "success") {
        addTxRecord({ type: "send", label: "📤 送信", amount: `-${parseFloat(amount).toLocaleString("en-US")} IOST`, counterparty: to.trim(), txHash: result.txHash, status: "success" });
        onSuccess(result.txHash);
      } else {
        addTxRecord({ type: "send", label: "📤 送信", amount: `-${parseFloat(amount).toLocaleString("en-US")} IOST`, counterparty: to.trim(), txHash: result.txHash, status: "failed", message: result.message });
        onError(result.message || "送金に失敗しました");
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "送金に失敗しました");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-700">📤 IOSTを送る</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-400 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">📝 宛先アドレス</label>
            <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="iost_xxxxx" className="w-full px-5 py-4 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-300 font-mono" required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-black text-slate-700">💰 数量</label>
              <button type="button" onClick={() => setAmount(balance.toString())} className="text-xs text-sky-500 hover:text-sky-600 font-bold">最大: {balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}</button>
            </div>
            <div className="relative">
              <input type="number" step="0.00000001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 pr-16 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-300" required />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-black">IOST</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">📝 メモ（オプション）</label>
            <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="メモを入力" maxLength={100} className="w-full px-5 py-4 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-300" />
          </div>

          {error && <div className="bg-rose-50 border-2 border-rose-300 text-rose-500 text-sm rounded-xl px-5 py-4 font-bold">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-rose-400 border-2 border-rose-500 text-white font-black text-base py-4 rounded-2xl shadow-md hover:bg-rose-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "⏳ 送信中..." : "📤 送信する"}
          </button>
        </form>
      </div>
    </div>
  );
}
