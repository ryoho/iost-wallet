"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { Sparkles, Download, Copy } from "lucide-react";

type State = "idle" | "creating" | "success" | "failed";

export default function CreatePage() {
  const [state, setState] = useState<State>("idle");
  const [acc, setAcc] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!window.confirm("✨ アカウントを作りますか？")) return;
    setLoading(true); setError(""); setState("creating");
    try {
      const res = await fetch("/api/create-account", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "作成に失敗しました");
      setAcc(data.accountId); setPubKey(data.publicKey); setSecKey(data.secretKey); setState("success");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "作成に失敗しました"); setState("failed"); }
    finally { setLoading(false); }
  };

  const copy = () => { if (secKey) { navigator.clipboard.writeText(secKey); alert("秘密鍵をコピーしました"); } };
  const download = () => {
    if (!secKey || state !== "success") return;
    const blob = new Blob([`アカウント: ${acc}\n公開鍵: ${pubKey}\n秘密鍵: ${secKey}`], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${acc}.txt`; a.click();
  };
  const goToLogin = () => { window.location.href = "/"; };

  return (
    <RequireAuth>
    <div className="min-h-screen bg-bg flex flex-col items-center px-6 py-8">
      <h2 className="text-lg font-semibold text-text-primary mb-6 self-start">✨ アカウントをつくる</h2>
      {state === "idle" && <button onClick={create} disabled={loading} className="w-full max-w-sm bg-[#1d8f6d] text-white font-medium px-4 py-3.5 border-2 border-text-primary retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 mb-6">{loading ? "⏳ 作成中..." : "✨ つくる"}</button>}
      <div className="mb-5 w-16 h-16 border-2 border-text-primary flex items-center justify-center bg-[#e8b056]/20 shadow-[4px_4px_0px_0px_#2d3235]">
        {state === "creating" && <span className="text-3xl">⏳</span>}
        {state === "failed" && <span className="text-3xl">❌</span>}
        {state === "success" && <span className="text-3xl">✅</span>}
        {state === "idle" && <Sparkles className="w-8 h-8 text-[#2d3235]" />}
      </div>
      {(state !== "idle") && (
        <div className="w-full max-w-sm bg-card border-2 border-text-primary retro-shadow p-5 mb-5 text-center">
          <p className="text-text-primary text-sm mb-2">✨ あなたのアカウント</p>
          {state === "creating" && <p className="text-[#1d8f6d] font-semibold">⏳ 作成中...</p>}
          {state === "success" && <p className="text-[#1d8f6d] font-semibold text-lg">{acc}</p>}
          {state === "failed" && <p className="text-[#c24b46] font-semibold">❌ 失敗</p>}
          <p className="text-[#c24b46] text-xs mt-3">⚠ 秘密鍵は必ず保存してください<br />⚠ 絶対に他人に教えないでください</p>
        </div>
      )}
      {error && <div className="w-full max-w-sm bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3 mb-5">{error}</div>}
      {state === "success" && (
        <div className="w-full max-w-sm space-y-3 mb-6">
          <button onClick={copy} className="w-full bg-bg border-2 border-text-primary text-text-primary font-medium py-3 rounded-none retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> 秘密鍵をコピー</button>
          <button onClick={download} className="w-full bg-bg border-2 border-text-primary text-text-primary font-medium py-3 rounded-none retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"><Download className="w-4 h-4" /> ダウンロード</button>
          <a href="/import" className="w-full block text-center bg-text-primary text-white font-medium py-3 border-2 border-text-primary hover:bg-[#c24b46] transition-colors">🔑 インポート</a>
        </div>
      )}
      <button onClick={goToLogin} className="text-text-secondary text-sm mt-4 hover:text-text-primary">← ホームに戻る</button>
    </div>
    </RequireAuth>
  );
}
