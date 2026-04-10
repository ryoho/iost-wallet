"use client";

import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { addWallet } from "@/lib/keystore";
import { Eye, EyeOff, Key, User, ArrowLeft, Check, ChevronRight } from "lucide-react";

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

  const steps = [
    { label: "PIN設定", key: "pin" as const },
    { label: "PIN確認", key: "confirm" as const },
    { label: "インポート", key: "import" as const },
  ];

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1 px-6 py-8 space-y-6 pb-24">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 justify-center">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-none border-2 flex items-center justify-center text-xs font-bold ${
                  steps.findIndex(x => x.key === step) >= i
                    ? "bg-text-primary text-white border-text-primary"
                    : "bg-bg text-text-secondary border-text-primary/40"
                }`}>
                  {i + 1}
                </div>
                {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-text-secondary/40" />}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-text-primary">
              {step === "pin" && "PINを設定"}
              {step === "confirm" && "PINを確認"}
              {step === "import" && "アカウントをインポート"}
            </h2>
          </div>

          {step === "pin" && (
            <div className="w-full max-w-sm mx-auto space-y-4">
              <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="1234" maxLength={8} className="w-full px-4 py-4 rounded-none border-2 border-text-primary bg-card text-text-primary text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary font-mono" />
              <button onClick={next} className="w-full bg-text-primary text-white font-medium py-4 border-2 border-text-primary hover:bg-[#c24b46] transition-colors flex items-center justify-center gap-2">次へ <ChevronRight className="w-4 h-4" /></button>
              {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3">{error}</div>}
            </div>
          )}

          {step === "confirm" && (
            <div className="w-full max-w-sm mx-auto space-y-4">
              <input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="再入力" maxLength={8} className="w-full px-4 py-4 rounded-none border-2 border-text-primary bg-card text-text-primary text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary font-mono" />
              <button onClick={confirm} className="w-full bg-text-primary text-white font-medium py-4 border-2 border-text-primary hover:bg-[#c24b46] transition-colors flex items-center justify-center gap-2">確認 <Check className="w-4 h-4" /></button>
              {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3">{error}</div>}
            </div>
          )}

          {step === "import" && (
            <form onSubmit={submit} className="w-full max-w-sm mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">アカウント名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="iost_xxxxx" className="w-full pl-10 pr-4 py-4 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">秘密鍵</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input type={showKey ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="5xxxxx..." className="w-full pl-10 pr-12 py-4 rounded-none border-2 border-text-primary bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary font-mono" required />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">{showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-text-primary text-white font-medium py-4 border-2 border-text-primary hover:bg-[#c24b46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{loading ? "保存中..." : "インポート"}</button>
            </form>
          )}

          <button onClick={() => { if (step === "confirm") setStep("pin"); else if (step === "import") setStep("confirm"); else window.location.href = "/"; }} className="w-full max-w-sm mx-auto block bg-bg border-2 border-text-primary text-text-primary font-medium py-4 retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> 戻る</button>
        </main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
