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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(null);
    if (!session) { setError("ウォレットを解除してください"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("数量を入力してください"); return; }
    if (stakeType === "vote" && !producer.trim()) { setError("プロデューサーを入力してください"); return; }
    setLoading(true);
    try {
      let r; const a = parseFloat(amount).toFixed(8);
      if (stakeType === "gas") {
        r = action === "stake" ? await stakeForGas(session.accountId, session.privateKey, a) : await unstakeGas(session.accountId, session.privateKey, a);
        addTxRecord({ type: action === "stake" ? "stake" : "unstake", label: action === "stake" ? "🌱 Gas取得" : "🔓 Gas解除", amount: action === "stake" ? `-${amount} IOST` : `+${amount} IOST`, txHash: r.txHash, status: r.status, message: r.message });
      } else {
        r = action === "stake" ? await voteProducer(session.accountId, session.privateKey, producer.trim(), a) : await unvoteProducer(session.accountId, session.privateKey, producer.trim(), a);
        addTxRecord({ type: action === "stake" ? "vote" : "unvote", label: action === "stake" ? "🗳️ 投票" : "❌ 投票解除", amount: action === "stake" ? `-${amount} IOST` : `+${amount} IOST`, counterparty: producer.trim(), txHash: r.txHash, status: r.status, message: r.message });
      }
      if (r.status === "success") { setSuccess("✅ 送信完了"); setAmount(""); refetch(); }
      else setError(`❌ ${r.message || "失敗しました"}`);
    } catch (err: unknown) { setError(`❌ ${err instanceof Error ? err.message : "失敗しました"}`); }
    finally { setLoading(false); }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-5 pb-24 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">🌱 ステーキング</h2>
          <div className="flex gap-2">
            <button onClick={() => { setStakeType("gas"); setProducer(""); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${stakeType === "gas" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-500"}`}>⚡ Gas</button>
            <button onClick={() => setStakeType("vote")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${stakeType === "vote" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-500"}`}>🗳️ 投票</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAction("stake")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${action === "stake" ? "bg-green-50 text-green-600" : "bg-white border border-gray-200 text-gray-500"}`}>{stakeType === "gas" ? "📈 取得" : "🗳️ 投票"}</button>
            <button onClick={() => setAction("unstake")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${action === "unstake" ? "bg-red-50 text-red-500" : "bg-white border border-gray-200 text-gray-500"}`}>{stakeType === "gas" ? "📉 解除" : "❌ 解除"}</button>
          </div>
          {balance && <div className="bg-white rounded-xl shadow-sm p-4"><p className="text-gray-400 text-xs mb-0.5">💰 利用可能</p><p className="text-gray-800 text-lg font-semibold">{balance.iost.toLocaleString("en-US", { maximumFractionDigits: 2 })} IOST</p></div>}
          <form onSubmit={submit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">数量</label><div className="relative"><input type="number" step="0.00000001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 pr-14 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">IOST</span></div></div>
            {stakeType === "vote" && <div><label className="block text-sm font-medium text-gray-700 mb-1">プロデューサー</label><input type="text" value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="アカウント名" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>}
            {error && <div className="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-3">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 text-sm rounded-lg px-4 py-3">{success}</div>}
            <button type="submit" disabled={loading || !amount || parseFloat(amount) <= 0 || (stakeType === "vote" && !producer.trim())} className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{loading ? "処理中..." : action === "stake" ? (stakeType === "gas" ? "Gas取得" : "投票") : (stakeType === "gas" ? "Gas解除" : "投票解除")}</button>
          </form>
        </main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
