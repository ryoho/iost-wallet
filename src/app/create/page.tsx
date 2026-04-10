"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Sparkles, Download, Copy, ArrowLeft, AlertTriangle } from "lucide-react";

type State = "idle" | "creating" | "success" | "failed";

export default function CreatePage() {
  const [state, setState] = useState<State>("idle");
  const [acc, setAcc] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!window.confirm("アカウントを作成しますか？")) return;
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
  const goHome = () => { window.location.href = "/"; };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <div className="flex-1 px-4 py-6 space-y-6 pb-24">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text-primary flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> アカウントを作成
            </h2>
          </div>

          {state === "idle" && (
            <button onClick={create} disabled={loading} className="w-full max-w-sm mx-auto block bg-[#1d8f6d] text-white font-medium px-6 py-4 border-2 border-text-primary retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50">
              {loading ? "作成中..." : "アカウントを作成"}
            </button>
          )}

          <div className="flex justify-center">
            <div className="w-16 h-16 border-2 border-text-primary flex items-center justify-center bg-[#e8b056]/20 shadow-[4px_4px_0px_0px_#2d3235]">
              {state === "creating" && <div className="w-6 h-6 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />}
              {state === "failed" && <AlertTriangle className="w-8 h-8 text-[#c24b46]" />}
              {state === "success" && <Sparkles className="w-8 h-8 text-[#1d8f6d]" />}
              {state === "idle" && <Sparkles className="w-8 h-8 text-[#2d3235]" />}
            </div>
          </div>

          {(state !== "idle") && (
            <div className="w-full max-w-sm mx-auto bg-card border-2 border-text-primary retro-shadow p-6 text-center space-y-4">
              <div>
                <p className="text-text-secondary text-xs">アカウント</p>
                {state === "creating" && <p className="text-[#1d8f6d] font-semibold mt-1">作成中...</p>}
                {state === "success" && <p className="text-[#1d8f6d] font-semibold text-lg font-mono mt-1">{acc}</p>}
                {state === "failed" && <p className="text-[#c24b46] font-semibold mt-1">作成に失敗しました</p>}
              </div>
              <div className="bg-[#c24b46]/5 border border-[#c24b46]/20 p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#c24b46] mt-0.5 flex-shrink-0" />
                <p className="text-[#c24b46] text-xs text-left">秘密鍵は必ず保存してください。他人に教えないでください。</p>
              </div>
            </div>
          )}

          {error && <div className="w-full max-w-sm mx-auto bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3">{error}</div>}

          {state === "success" && (
            <div className="w-full max-w-sm mx-auto space-y-3">
              <button onClick={copy} className="w-full bg-bg border-2 border-text-primary text-text-primary font-medium py-4 retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> 秘密鍵をコピー</button>
              <button onClick={download} className="w-full bg-bg border-2 border-text-primary text-text-primary font-medium py-4 retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"><Download className="w-4 h-4" /> ダウンロード</button>
              <a href="/import" className="w-full block text-center bg-text-primary text-white font-medium py-4 border-2 border-text-primary hover:bg-[#c24b46] transition-colors">インポート</a>
            </div>
          )}

          <button onClick={goHome} className="w-full max-w-sm mx-auto block bg-bg border-2 border-text-primary text-text-primary font-medium py-4 retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> ホームに戻る</button>
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
