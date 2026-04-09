"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type State = "idle" | "creating" | "success" | "failed";

export default function CreatePage() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [acc, setAcc] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [secKey, setSecKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!window.confirm("🍭 アカウントを作りますか？")) return;
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 self-start">🍭 アカウントをつくる</h2>
      {state === "idle" && <button onClick={create} disabled={loading} className="w-full max-w-sm bg-blue-500 text-white font-medium px-4 py-3.5 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors mb-6">{loading ? "⏳ 作成中..." : "🍭 つくる"}</button>}
      <div className="mb-5"><Image src={state === "creating" ? "/chan02.png" : state === "failed" ? "/chan05.png" : "/chan06.png"} alt="" width={120} height={120} /></div>
      {(state !== "idle") && (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-5 mb-5 text-center">
          <p className="text-gray-600 text-sm mb-2">🍭 あなたのアカウント</p>
          {state === "creating" && <p className="text-blue-500 font-semibold">⏳ 作成中...</p>}
          {state === "success" && <p className="text-green-600 font-semibold text-lg">{acc}</p>}
          {state === "failed" && <p className="text-red-500 font-semibold">❌ 失敗</p>}
          <p className="text-red-400 text-xs mt-3">⚠ 秘密鍵は必ず保存してください<br />⚠ 絶対に他人に教えないでください</p>
        </div>
      )}
      {error && <div className="w-full max-w-sm bg-red-50 text-red-500 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}
      {state === "success" && (
        <div className="w-full max-w-sm space-y-3 mb-6">
          <button onClick={copy} className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">📎 秘密鍵をコピー</button>
          <button onClick={download} className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">📥 ダウンロード</button>
          <button onClick={() => router.push("/login")} className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors">🔐 インポート</button>
        </div>
      )}
      <button onClick={() => router.push("/login")} className="text-gray-400 text-sm mt-4 hover:text-gray-600">← ログインに戻る</button>
    </div>
  );
}
