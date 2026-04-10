"use client";

import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useIOSTBalance } from "@/hooks/useIOSTBalance";
import { stakeForGas, unstakeGas, stakeForRam, unstakeRam } from "@/lib/transaction";
import { Cpu, Zap, ChevronUp, ChevronDown, Wallet, CheckCircle2, AlertCircle } from "lucide-react";

type ResourceAction = "pledge" | "unpledge";
type ResourceType = "gas" | "ram";

export default function GasPage() {
  const { session } = useAuth();
  const { balance, refetch } = useIOSTBalance(session?.accountId || "");
  const [resourceType, setResourceType] = useState<ResourceType>("gas");
  const [action, setAction] = useState<ResourceAction>("pledge");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const fmt2 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const pct = (used: number, total: number) => total > 0 ? Math.round((used / total) * 100) : 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(null);
    if (!session) { setError("ウォレットを解除してください"); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("数量を入力してください"); return; }
    setLoading(true);
    try {
      const a = parseFloat(amount).toFixed(8);
      let r;
      if (resourceType === "gas") {
        r = action === "pledge"
          ? await stakeForGas(session.accountId, session.privateKey, a)
          : await unstakeGas(session.accountId, session.privateKey, a);
      } else {
        r = action === "pledge"
          ? await stakeForRam(session.accountId, session.privateKey, a)
          : await unstakeRam(session.accountId, session.privateKey, a);
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
        <div className="flex-1 px-4 py-6 pb-24">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2 mb-6"><Zap className="w-5 h-5" /> Gas & RAM</h2>

          <div className="space-y-6">
            {/* Resource Tabs */}
            <div className="flex gap-3">
              <button onClick={() => { setResourceType("gas"); setAction("pledge"); }} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${resourceType === "gas" ? "bg-text-primary text-white" : "bg-card text-text-primary"}`}><Zap className="w-4 h-4" /> Gas</button>
              <button onClick={() => { setResourceType("ram"); setAction("pledge"); }} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${resourceType === "ram" ? "bg-text-primary text-white" : "bg-card text-text-primary"}`}><Cpu className="w-4 h-4" /> RAM</button>
            </div>

            {/* Resource Info Cards */}
            {balance && (
              <div className="space-y-4">
                {resourceType === "gas" && (
                  <>
                    <div className="bg-card border-2 border-text-primary retro-shadow p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-none bg-[#e8b056]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Zap className="w-6 h-6 text-[#e8b056]" /></div>
                        <div className="flex-1">
                          <p className="text-xs text-text-secondary mb-1">現在のGas</p>
                          <p className="text-text-primary text-lg font-semibold">{fmt2(balance.gas)}</p>
                        </div>
                      </div>
                      {balance.gasTotal > 0 && (
                        <div className="ml-16">
                          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                            <span>使用率</span>
                            <span>{pct(balance.gas, balance.gasTotal)}% ({fmt2(balance.gas)} / {fmt2(balance.gasTotal)})</span>
                          </div>
                          <div className="w-full h-3 bg-bg border border-text-primary rounded-none overflow-hidden">
                            <div className="h-full bg-[#e8b056] transition-all" style={{ width: `${pct(balance.gas, balance.gasTotal)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-card border-2 border-text-primary retro-shadow p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-none bg-[#1d8f6d]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Wallet className="w-6 h-6 text-[#1d8f6d]" /></div>
                      <div className="flex-1">
                        <p className="text-xs text-text-secondary mb-1">利用可能IOST</p>
                        <p className="text-text-primary text-lg font-semibold">{fmt2(balance.iost)} IOST</p>
                      </div>
                    </div>
                  </>
                )}
                {resourceType === "ram" && (
                  <>
                    <div className="bg-card border-2 border-text-primary retro-shadow p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-none bg-[#d67035]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Cpu className="w-6 h-6 text-[#d67035]" /></div>
                        <div className="flex-1">
                          <p className="text-xs text-text-secondary mb-1">利用可能RAM</p>
                          <p className="text-text-primary text-lg font-semibold">{fmt2(balance.ram)}</p>
                        </div>
                      </div>
                      {balance.ramTotal > 0 && (
                        <div className="ml-16">
                          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                            <span>使用率</span>
                            <span>{pct(balance.ramTotal - balance.ram, balance.ramTotal)}% ({fmt2(balance.ramTotal - balance.ram)} / {fmt2(balance.ramTotal)})</span>
                          </div>
                          <div className="w-full h-3 bg-bg border border-text-primary rounded-none overflow-hidden">
                            <div className="h-full bg-[#d67035] transition-all" style={{ width: `${pct(balance.ramTotal - balance.ram, balance.ramTotal)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-card border-2 border-text-primary retro-shadow p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-none bg-[#1d8f6d]/10 border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Wallet className="w-6 h-6 text-[#1d8f6d]" /></div>
                      <div className="flex-1">
                        <p className="text-xs text-text-secondary mb-1">利用可能IOST</p>
                        <p className="text-text-primary text-lg font-semibold">{fmt2(balance.iost)} IOST</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={() => setAction("pledge")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${action === "pledge" ? "bg-[#1d8f6d]/10 text-[#1d8f6d]" : "bg-card text-text-secondary"}`}><ChevronUp className="w-4 h-4" /> 取得</button>
              <button onClick={() => setAction("unpledge")} className={`flex-1 py-4 rounded-none border-2 border-text-primary text-sm font-medium transition-colors flex items-center justify-center gap-2 ${action === "unpledge" ? "bg-[#c24b46]/10 text-[#c24b46]" : "bg-card text-text-secondary"}`}><ChevronDown className="w-4 h-4" /> 解除</button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">IOST数量</label>
                <div className="relative">
                  <input type="number" step="0.00000001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-4 pr-14 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary" required />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-medium">IOST</span>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {resourceType === "gas"
                    ? "IOSTをステーキングしてGasを取得します"
                    : "IOSTをステーキングしてRAMを取得します"}
                </p>
              </div>
              {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
              {success && <div className="bg-[#1d8f6d]/10 border-2 border-[#1d8f6d] text-[#1d8f6d] text-sm rounded-none px-4 py-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}
              <button type="submit" disabled={loading || !amount || parseFloat(amount) <= 0} className="w-full bg-text-primary text-white font-medium py-4 rounded-none border-2 border-text-primary hover:bg-[#c24b46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{loading ? "処理中..." : action === "pledge" ? `${resourceType === "gas" ? "Gas" : "RAM"}を取得` : `${resourceType === "gas" ? "Gas" : "RAM"}を解除`}</button>
            </form>
          </div>
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
