"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { addWallet } from "@/lib/keystore";

type Step = "pin-set" | "pin-confirm" | "import";

export default function ImportPage() {
  const { user, refreshWallets } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("pin-set");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [iostAccountName, setIostAccountName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePinNext = () => {
    setError("");
    if (pin.length < 4) { setError("PINは4桁以上で設定してください。"); return; }
    setStep("pin-confirm");
  };

  const handlePinConfirm = () => {
    setError("");
    if (pin !== confirmPin) { setError("PINが一致しません。"); setConfirmPin(""); return; }
    setStep("import");
  };

  const handleImport = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!iostAccountName.trim() || !privateKey.trim()) { setError("アカウント名と秘密鍵を入力してください。"); return; }
    if (!user) { setError("ログインが必要です。"); return; }

    setLoading(true);
    try {
      await addWallet(user.uid, iostAccountName.trim(), privateKey.trim(), pin);
      await refreshWallets();
      router.push("/");
    } catch {
      setError("秘密鍵の保存に失敗しました。もう一度お試しください。");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-sky-400 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          {step !== "pin-set" && (
            <button onClick={() => { setStep(step === "pin-confirm" ? "pin-set" : "pin-confirm"); setError(""); }} className="text-white/80 hover:text-white">←</button>
          )}
          <h1 className="text-white font-bold text-lg">
            {step === "pin-set" && "🔐 PINコードの設定"}
            {step === "pin-confirm" && "🔐 PINの確認"}
            {step === "import" && "🔑 アカウントをインポート"}
          </h1>
        </div>
        <div className="flex gap-1.5 mt-2">
          <div className={`h-1 flex-1 rounded-full ${step === "pin-set" ? "bg-white" : "bg-white/40"}`} />
          <div className={`h-1 flex-1 rounded-full ${step === "pin-confirm" ? "bg-white" : step === "import" ? "bg-white/60" : "bg-white/30"}`} />
          <div className={`h-1 flex-1 rounded-full ${step === "import" ? "bg-white" : "bg-white/30"}`} />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 pb-24">
        {step === "pin-set" && (
          <div className="space-y-5">
            <div className="text-center mb-4">
              <p className="text-slate-700 font-bold">セキュリティのためPINコードを設定してください</p>
              <p className="text-slate-400 text-xs mt-1">秘密鍵の暗号化に使用します</p>
            </div>
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="1234" maxLength={8} className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-300 font-mono font-black" />
            {error && <div className="bg-rose-50 border border-rose-200 text-rose-400 text-sm rounded-xl px-4 py-3 font-bold">{error}</div>}
            <button onClick={handlePinNext} className="w-full bg-sky-400 text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-sky-500 active:scale-[0.98] transition-all">次へ</button>
          </div>
        )}

        {step === "pin-confirm" && (
          <div className="space-y-5">
            <div className="text-center mb-4"><p className="text-slate-700 font-bold">もう一度入力してください</p></div>
            <input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="1234" maxLength={8} className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-300 font-mono font-black" />
            {error && <div className="bg-rose-50 border border-rose-200 text-rose-400 text-sm rounded-xl px-4 py-3 font-bold">{error}</div>}
            <button onClick={handlePinConfirm} className="w-full bg-sky-400 text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-sky-500 active:scale-[0.98] transition-all">確認</button>
          </div>
        )}

        {step === "import" && (
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">IOST アカウント名</label>
              <input type="text" value={iostAccountName} onChange={(e) => setIostAccountName(e.target.value)} placeholder="例: iost_user_01" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-300" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">秘密鍵</label>
              <div className="relative">
                <input type={showKey ? "text" : "password"} value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} placeholder="5xxxxx..." className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-300 font-mono" required />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showKey ? "🙈" : "👁️"}</button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">🔒 秘密鍵はPINで暗号化され、Firebaseに安全に保存されます。</p>
            </div>
            {error && <div className="bg-rose-50 border border-rose-200 text-rose-400 text-sm rounded-xl px-4 py-3 font-bold">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-sky-400 text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-sky-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "⏳ 保存中..." : "🔑 インポート"}</button>
          </form>
        )}
      </main>
    </div>
  );
}
