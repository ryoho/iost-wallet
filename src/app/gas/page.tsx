"use client";

import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useIOSTBalance } from "@/hooks/useIOSTBalance";
import { stakeForGas, unstakeGas } from "@/lib/transaction";
import { Cpu, Zap, ChevronUp, ChevronDown, Wallet, CheckCircle2, AlertCircle } from "lucide-react";

type GasAction = "pledge" | "unpledge";
type ResourceType = "gas" | "ram";

export default function GasPage() {
  const { session } = useAuth();
  const { balance, refetch } = useIOSTBalance(session?.accountId || "");
  const [resourceType, setResourceType] = useState<ResourceType>("gas");
  const [action, setAction] = useState<GasAction>("pledge");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(null);
    if (!session) { setError("ウォレットを解除してください"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("数量を入力してください"); return; }
    setLoading(true);
    try {
      let r;
      if (resourceType === "gas") {
        r = action === "pledge"
          ? await stakeForGas(session.accountId, session.privateKey, parseFloat(amount).toFixed(8))
          : await unstakeGas(session.accountId, session.privateKey, parseFloat(amount).toFixed(8));
      } else {
        setError("RAM操作は現在準備中です");
        setLoading(false);
        return;
      }
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
        <div className="flex-1 px-6 py-6 pb-24 space-y-6">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2"><Zap className="w-5 h-5" /> Gas & RAM</h2>

          {/* Resource Tabs */}
          <div className="flex gap-2">
            <button onClick={() => setResourceType("gas")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${resourceType === "gas" ? "bg-text-primary text-white" : "bg-card text-text-primary"}`}><Zap className="w-4 h-4" /> Gas</button>
            <button onClick={() => setResourceType("ram")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${resourceType === "ram" ? "bg-text-primary text-white" : "bg-card text-text-primary"}`}><Cpu className="w-4 h-4" /> RAM</button>
          </div>

          {/* Resource Info Cards */}
          {balance && resourceType === "gas" && (
            <div className="space-y-3">
              <div className="bg-card border-2 border-text-primary retro-shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-[#e8b056]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Zap className="w-6 h-6 text-[#e8b056]" /></div>
                <div className="flex-1">
                  <p className="text-xs text-text-secondary mb-1">現在のGas</p>
                  <p className="text-text-primary text-lg font-semibold">{balance.gas.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="bg-card border-2 border-text-primary retro-shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-[#1d8f6d]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Wallet className="w-6 h-6 text-[#1d8f6d]" /></div>
                <div className="flex-1">
                  <p className="text-xs text-text-secondary mb-1">利用可能</p>
                  <p className="text-text-primary text-lg font-semibold">{balance.iost.toLocaleString("en-US", { maximumFractionDigits: 2 })} IOST</p>
                </div>
              </div>
            </div>
          )}

          {balance && resourceType === "ram" && (
            <div className="space-y-3">
              <div className="bg-card border-2 border-text-primary retro-shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-[#d67035]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Cpu className="w-6 h-6 text-[#d67035]" /></div>
                <div className="flex-1">
                  <p className="text-xs text-text-secondary mb-1">利用可能RAM</p>
                  <p className="text-text-primary text-lg font-semibold">{balance.ram.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="bg-[#e8b056]/10 border-2 border-text-primary retro-shadow p-5 text-center text-text-secondary text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> RAM操作は準備中です</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={() => setAction("pledge")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${action === "pledge" ? "bg-[#1d8f6d]/10 text-[#1d8f6d]" : "bg-card text-text-secondary"}`}><ChevronUp className="w-4 h-4" /> 取得</button>
            <button onClick={() => setAction("unpledge")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${action === "unpledge" ? "bg-[#c24b46]/10 text-[#c24b46]" : "bg-card text-text-secondary"}`}><ChevronDown className="w-4 h-4" /> 解除</button>
          </div>

          {/* Form */}
          {resourceType === "gas" && (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">IOST数量</label>
                <div className="relative">
                  <input type="number" step="0.00000001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-4 pr-14 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary" required />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-medium">IOST</span>
                </div>
                <p className="text-xs text-text-secondary mt-2">IOSTをステーキングしてGasを取得します</p>
              </div>
              {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
              {success && <div className="bg-[#1d8f6d]/10 border-2 border-[#1d8f6d] text-[#1d8f6d] text-sm rounded-none px-4 py-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}
              <button type="submit" disabled={loading || !amount || parseFloat(amount) <= 0} className="w-full bg-text-primary text-white font-medium py-4 rounded-none border-2 border-text-primary hover:bg-[#c24b46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{loading ? "処理中..." : action === "pledge" ? "Gasを取得" : "Gasを解除"}</button>
            </form>
          )}
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
