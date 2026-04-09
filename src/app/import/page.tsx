"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addWallet } from "@/lib/keystore";

type Step = "pin" | "confirm" | "import";

export default function ImportPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = () => { setError(""); if (pin.length < 4) { setError("4桁以上を入力"); return; } setStep("confirm"); };
  const confirm = () => { setError(""); if (pin !== confirmPin) { setError("一致しません"); setConfirmPin(""); return; } setStep("import"); };

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!name.trim() || !key.trim()) { setError("入力してください"); return; }
    if (!user) { setError("ログインが必要"); return; }
    setLoading(true);
    try {
      await addWallet(user.uid, name.trim(), key.trim(), pin);
      const { getWallets } = await import("@/lib/keystore");
      await getWallets(user.uid);
      window.location.href = "/";
    }
    catch { setError("保存に失敗しました"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-500 px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          {step !== "pin" && <button onClick={() => setStep(step === "confirm" ? "pin" : "confirm")} className="text-white/80 hover:text-white">←</button>}
          <h1 className="text-white font-semibold">{step === "pin" ? "PIN設定" : step === "confirm" ? "PIN確認" : "インポート"}</h1>
        </div>
        <div className="flex gap-1.5"><div className={`h-1 flex-1 rounded-full ${step === "pin" ? "bg-white" : "bg-white/40"}`} /><div className={`h-1 flex-1 rounded-full ${step === "confirm" ? "bg-white" : step === "import" ? "bg-white/60" : "bg-white/30"}`} /><div className={`h-1 flex-1 rounded-full ${step === "import" ? "bg-white" : "bg-white/30"}`} /></div>
      </header>
      <main className="flex-1 px-4 py-6 space-y-4">
        {step === "pin" && <><input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="PIN（4桁以上）" maxLength={8} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-800 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" /><button onClick={next} className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 transition-colors">次へ</button></>}
        {step === "confirm" && <><input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="PIN再入力" maxLength={8} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-800 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" /><button onClick={confirm} className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 transition-colors">確認</button></>}
        {step === "import" && (
          <form onSubmit={submit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">アカウント名</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="iost_xxxxx" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">秘密鍵</label><div className="relative"><input type={showKey ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="5xxxxx..." className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" required /><button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showKey ? "🙈" : "👁️"}</button></div><p className="text-[11px] text-gray-400 mt-1">🔒 PINで暗号化して保存します</p></div>
            {error && <div className="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-3">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">{loading ? "保存中..." : "インポート"}</button>
          </form>
        )}
        {error && step !== "import" && <div className="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-3">{error}</div>}
      </main>
    </div>
  );
}
