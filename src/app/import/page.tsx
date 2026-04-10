"use client";

import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { addWallet } from "@/lib/keystore";
import { Eye, EyeOff, Key, User } from "lucide-react";

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
      window.location.href = "/";
    }
    catch { setError("保存に失敗しました"); }
    finally { setLoading(false); }
  };

  return (
    <RequireAuth>
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="top-stripes"><div /><div /><div /><div /></div>
      <header className="px-4 py-4 border-b-2 border-text-primary">
        <div className="flex items-center gap-2 mb-2">
          {step !== "pin" && <button onClick={() => setStep(step === "confirm" ? "pin" : "confirm")} className="text-text-primary hover:underline">←</button>}
          <h1 className="text-text-primary font-semibold">{step === "pin" ? "PIN設定" : step === "confirm" ? "PIN確認" : "インポート"}</h1>
        </div>
        <div className="flex gap-1.5"><div className={`h-1 flex-1 rounded-full ${step === "pin" ? "bg-text-primary" : "bg-text-primary/40"}`} /><div className={`h-1 flex-1 rounded-full ${step === "confirm" ? "bg-text-primary" : step === "import" ? "bg-text-primary/60" : "bg-text-primary/30"}`} /><div className={`h-1 flex-1 rounded-full ${step === "import" ? "bg-text-primary" : "bg-text-primary/30"}`} /></div>
      </header>
      <main className="flex-1 px-4 py-6 space-y-4">
        {step === "pin" && (
          <>
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="PIN（4桁以上）" maxLength={8} className="w-full px-4 py-3 rounded-none border-2 border-text-primary bg-card text-text-primary text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary font-mono" />
            <button onClick={next} className="w-full bg-text-primary text-white font-medium py-3 border-2 border-text-primary hover:bg-[#c24b46] transition-colors">次へ</button>
          </>
        )}
        {step === "confirm" && (
          <>
            <input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="PIN再入力" maxLength={8} className="w-full px-4 py-3 rounded-none border-2 border-text-primary bg-card text-text-primary text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary font-mono" />
            <button onClick={confirm} className="w-full bg-text-primary text-white font-medium py-3 border-2 border-text-primary hover:bg-[#c24b46] transition-colors">確認</button>
          </>
        )}
        {step === "import" && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">アカウント名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="iost_xxxxx" className="w-full pl-10 pr-4 py-3 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">秘密鍵</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input type={showKey ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="5xxxxx..." className="w-full pl-10 pr-12 py-3 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary font-mono" required />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">{showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">🔒 PINで暗号化して保存します</p>
            </div>
            {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-text-primary text-white font-medium py-3 border-2 border-text-primary hover:bg-[#c24b46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{loading ? "保存中..." : "インポート"}</button>
          </form>
        )}
        {error && step !== "import" && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3">{error}</div>}
      </main>
    </div>
    </RequireAuth>
  );
}
