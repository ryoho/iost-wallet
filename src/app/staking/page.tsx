"use client";

import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useIOSTBalance } from "@/hooks/useIOSTBalance";
import { voteProducer, unvoteProducer } from "@/lib/transaction";
import { Vote, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, Wallet } from "lucide-react";

type VoteAction = "vote" | "unvote";

export default function StakingPage() {
  const { session } = useAuth();
  const { balance, refetch } = useIOSTBalance(session?.accountId || "");
  const [action, setAction] = useState<VoteAction>("vote");
  const [amount, setAmount] = useState("");
  const [producer, setProducer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(null);
    if (!session) { setError("ウォレットを解除してください"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("数量を入力してください"); return; }
    if (!producer.trim()) { setError("プロデューサーを入力してください"); return; }
    setLoading(true);
    try {
      const a = parseFloat(amount).toFixed(8);
      const r = action === "vote"
        ? await voteProducer(session.accountId, session.privateKey, producer.trim(), a)
        : await unvoteProducer(session.accountId, session.privateKey, producer.trim(), a);

      if (r.status === "success") {
        setSuccess("送信完了");
        setAmount("");
        refetch();
      } else {
        setError(`${r.message || "失敗しました"}`);
      }
    } catch (err: unknown) {
      setError(`${err instanceof Error ? err.message : "失敗しました"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <div className="flex-1 px-4 py-6 pb-24">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2 mb-6"><Vote className="w-5 h-5" /> 投票</h2>

          <div className="space-y-6">
            {/* Balance */}
            {balance && <div className="bg-card border-2 border-text-primary retro-shadow p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-none bg-[#1d8f6d]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Wallet className="w-6 h-6 text-[#1d8f6d]" /></div><div className="flex-1"><p className="text-text-secondary text-xs mb-1">利用可能</p><p className="text-text-primary text-lg font-semibold">{balance.iost.toLocaleString("en-US", { maximumFractionDigits: 2 })} IOST</p></div></div>}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={() => setAction("vote")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${action === "vote" ? "bg-[#1d8f6d]/10 text-[#1d8f6d]" : "bg-card text-text-secondary"}`}><ChevronUp className="w-4 h-4" /> 投票</button>
              <button onClick={() => setAction("unvote")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${action === "unvote" ? "bg-[#c24b46]/10 text-[#c24b46]" : "bg-card text-text-secondary"}`}><ChevronDown className="w-4 h-4" /> 投票解除</button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">プロデューサー</label>
                <input type="text" value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="アカウント名" className="w-full px-4 py-4 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">数量</label>
                <div className="relative">
                  <input type="number" step="0.00000001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-4 pr-14 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary" required />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-medium">IOST</span>
                </div>
              </div>
              {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
              {success && <div className="bg-[#1d8f6d]/10 border-2 border-[#1d8f6d] text-[#1d8f6d] text-sm rounded-none px-4 py-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}
              <button type="submit" disabled={loading || !amount || parseFloat(amount) <= 0 || !producer.trim()} className="w-full bg-text-primary text-white font-medium py-4 rounded-none border-2 border-text-primary hover:bg-[#c24b46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{loading ? "処理中..." : action === "vote" ? "投票する" : "投票を解除"}</button>
            </form>
          </div>
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
