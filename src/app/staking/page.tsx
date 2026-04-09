"use client";

import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useIOSTBalance } from "@/hooks/useIOSTBalance";
import { stakeForGas, unstakeGas, voteProducer, unvoteProducer } from "@/lib/transaction";
import { addTxRecord } from "@/lib/txHistory";

type StakeType = "gas" | "vote";
type StakeAction = "stake" | "unstake";

export default function StakingPage() {
  const { session } = useAuth();
  const { balance, refetch } = useIOSTBalance(session?.accountId || "");

  const [stakeType, setStakeType] = useState<StakeType>("gas");
  const [amount, setAmount] = useState("");
  const [producer, setProducer] = useState("");
  const [action, setAction] = useState<StakeAction>("stake");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!session) { setError("🔐 ウォレットを解除してください"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("⚠️ 有効な数量を入力してください"); return; }
    if (stakeType === "vote" && !producer.trim()) { setError("⚠️ プロデューサーを入力してください"); return; }

    setLoading(true);
    try {
      let result;
      const amountStr = parseFloat(amount).toFixed(8);

      if (stakeType === "gas") {
        if (action === "stake") {
          result = await stakeForGas(session.accountId, session.privateKey, amountStr);
          addTxRecord({ type: "stake", label: "🌱 Gas取得", amount: `-${parseFloat(amount).toLocaleString("en-US")} IOST`, txHash: result.txHash, status: result.status, message: result.message });
        } else {
          result = await unstakeGas(session.accountId, session.privateKey, amountStr);
          addTxRecord({ type: "unstake", label: "🔓 Gas解除", amount: `+${parseFloat(amount).toLocaleString("en-US")} IOST`, txHash: result.txHash, status: result.status, message: result.message });
        }
      } else {
        if (action === "stake") {
          result = await voteProducer(session.accountId, session.privateKey, producer.trim(), amountStr);
          addTxRecord({ type: "vote", label: "🗳️ ノード投票", amount: `-${parseFloat(amount).toLocaleString("en-US")} IOST`, counterparty: producer.trim(), txHash: result.txHash, status: result.status, message: result.message });
        } else {
          result = await unvoteProducer(session.accountId, session.privateKey, producer.trim(), amountStr);
          addTxRecord({ type: "unvote", label: "❌ 投票解除", amount: `+${parseFloat(amount).toLocaleString("en-US")} IOST`, counterparty: producer.trim(), txHash: result.txHash, status: result.status, message: result.message });
        }
      }

      if (result.status === "success") {
        setSuccess("✅ トランザクションが正常に送信されました");
        setAmount("");
        refetch();
      } else {
        setError(`❌ ${result.message || "トランザクションに失敗しました"}`);
      }
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : "処理に失敗しました"}`);
    } finally { setLoading(false); }
  };

  const isSubmitDisabled = loading || !amount || parseFloat(amount) <= 0 || (stakeType === "vote" && !producer.trim());

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        <main className="flex-1 px-6 py-8 pb-28 space-y-6">
          <h2 className="text-xl font-black text-slate-700">🌱 ステーキング</h2>

          <div className="flex gap-3">
            {(["gas", "vote"] as StakeType[]).map((t) => (
              <button key={t} onClick={() => { setStakeType(t); if (t === "vote") setProducer(""); }}
                className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all border-2 ${stakeType === t ? "bg-sky-400 border-sky-500 text-white shadow-md" : "bg-white border-slate-300 text-slate-400"}`}>
                {t === "gas" ? "⚡ Gas" : "🗳️ 投票"}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {(["stake", "unstake"] as StakeAction[]).map((a) => (
              <button key={a} onClick={() => setAction(a)}
                className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all border-2 ${action === a ? (a === "stake" ? "bg-emerald-50 border-emerald-300 text-emerald-600" : "bg-rose-50 border-rose-300 text-rose-500") : "bg-white border-slate-300 text-slate-400"}`}>
                {a === "stake" ? (stakeType === "gas" ? "📈 Gas取得" : "🗳️ 投票") : (stakeType === "gas" ? "📉 Gas解除" : "❌ 投票解除")}
              </button>
            ))}
          </div>

          {balance && (
            <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-6">
              <p className="text-slate-400 text-xs font-black mb-2">💰 利用可能残高</p>
              <p className="text-slate-700 text-xl font-black">{balance.iost.toLocaleString("en-US", { maximumFractionDigits: 2 })} IOST</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">📝 数量</label>
              <div className="relative">
                <input type="number" step="0.00000001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 pr-16 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-300" required />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-black">IOST</span>
              </div>
            </div>

            {stakeType === "vote" && (
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">🗳️ プロデューサー名</label>
                <input type="text" value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="プロデューサーのアカウント名" className="w-full px-5 py-4 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-300" required />
              </div>
            )}

            {error && <div className="bg-rose-50 border-2 border-rose-300 text-rose-500 text-sm rounded-xl px-5 py-4 font-bold">{error}</div>}
            {success && <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-600 text-sm rounded-xl px-5 py-4 font-bold">{success}</div>}

            <button type="submit" disabled={isSubmitDisabled}
              className="w-full bg-rose-400 border-2 border-rose-500 text-white font-black text-base py-4 rounded-2xl shadow-md hover:bg-rose-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ 処理中..." : action === "stake" ? (stakeType === "gas" ? "⚡ Gasを取得" : "🗳️ 投票する") : (stakeType === "gas" ? "📉 Gasを解除" : "❌ 投票を解除")}
            </button>
          </form>
        </main>

        <BottomNav />
      </div>
    </RequireAuth>
  );
}
