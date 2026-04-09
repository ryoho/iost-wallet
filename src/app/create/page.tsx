"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CreateState = "idle" | "creating" | "success" | "failed";

export default function CreatePage() {
  const router = useRouter();
  const [state, setState] = useState<CreateState>("idle");
  const [newAcc, setNewAcc] = useState("");
  const [newPubKey, setNewPubKey] = useState("");
  const [newSecKey, setNewSecKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    setState("creating");

    try {
      const res = await fetch("/api/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "アカウント作成に失敗しました");
      }

      setNewAcc(data.accountId);
      setNewPubKey(data.publicKey);
      setNewSecKey(data.secretKey);
      setState("success");
    } catch (err) {
      console.error("Create account error:", err);
      setError(err instanceof Error ? err.message : "アカウント作成に失敗しました");
      setState("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (window.confirm("🍭 アカウントを作りますか？\n\nあなたはまだアカウントを持っていませんね？")) {
      handleCreate();
    }
  };

  const copySecretKey = () => {
    if (newSecKey) {
      navigator.clipboard.writeText(newSecKey);
      alert("🍭 秘密鍵をコピーしました！\n\n必ず保管してください！");
    } else {
      alert("🍭 まだアカウントが作成出来ていません！");
    }
  };

  const downloadAccountInfo = () => {
    if (!newSecKey || state !== "success") {
      alert("🍭 まだアカウントが作成出来ていません！");
      return;
    }

    const fileName = `アカウント情報（${newAcc}）.txt`;
    const content = `【あなたのアカウント名】\n${newAcc}\n\n【あなたの公開鍵】\n${newPubKey}\n\n【あなたの秘密鍵】\n${newSecKey}\n\n⚠ 秘密鍵は必ず保存してください！\n⚠ 絶対に他人に教えないでください！`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChanImg = () => {
    switch (state) {
      case "creating": return "/chan02.png";
      case "failed": return "/chan05.png";
      case "success": return "/chan06.png";
      default: return "/chan02.png";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-6 py-8">
      {/* ページタイトル */}
      <h2 className="text-xl font-bold text-slate-700 mb-6 self-start">🍭 アカウントをつくる</h2>

      {/* 作成ボタン（初期状態） */}
      {state === "idle" && (
        <button
          onClick={handleConfirm}
          className="w-full max-w-sm bg-rose-400 text-white font-bold text-lg px-6 py-4 rounded-2xl shadow-md hover:bg-rose-500 active:scale-[0.98] transition-all mb-6"
        >
          🍭 つくる
        </button>
      )}

      {/* キャラクター画像 */}
      <div className="mb-6">
        <Image
          src={getChanImg()}
          alt={state === "creating" ? "作ってます！" : state === "failed" ? "無理だったわ" : "できたよ！"}
          width={140}
          height={140}
          className="drop-shadow-md"
        />
      </div>

      {/* 結果表示 */}
      {(state === "creating" || state === "success" || state === "failed") && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-slate-200 p-5 mb-6">
          <p className="text-sm text-slate-600 text-center">
            🍭 あなたのアカウントは
            <br />
            {state === "creating" && (
              <span className="text-lg font-bold text-sky-400">⏳ 作成中です…</span>
            )}
            {state === "success" && (
              <span className="text-lg font-bold text-teal-400">✅ {newAcc}</span>
            )}
            {state === "failed" && (
              <span className="text-lg font-bold text-rose-400">❌ 作成失敗</span>
            )}
            <br />
            <span className="text-rose-400 font-bold text-xs">
              ⚠ 秘密鍵は必ず保存してください！<br />
              ⚠ 絶対に他人に教えないでください！
            </span>
          </p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="w-full max-w-sm bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-rose-400 font-medium">{error}</p>
        </div>
      )}

      {/* 成功時のアクション */}
      {state === "success" && (
        <div className="w-full max-w-sm space-y-3 mb-6">
          <button
            onClick={copySecretKey}
            className="w-full bg-sky-400 text-white font-bold text-base px-4 py-3.5 rounded-2xl shadow-md hover:bg-sky-500 active:scale-[0.98] transition-all"
          >
            📎 秘密鍵をコピー
          </button>
          <button
            onClick={downloadAccountInfo}
            className="w-full bg-teal-400 text-white font-bold text-base px-4 py-3.5 rounded-2xl shadow-md hover:bg-teal-500 active:scale-[0.98] transition-all"
          >
            📥 まとめてダウンロード
          </button>
          <button
            onClick={() => {
              localStorage.setItem("iost_temp_account", newAcc);
              localStorage.setItem("iost_temp_secret", newSecKey);
              router.push("/login");
            }}
            className="w-full bg-violet-400 text-white font-bold text-base px-4 py-3.5 rounded-2xl shadow-md hover:bg-violet-500 active:scale-[0.98] transition-all"
          >
            🔐 ウォレットにインポート
          </button>
        </div>
      )}

      {/* 戻る */}
      <button
        onClick={() => router.push("/login")}
        className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors mt-4"
      >
        ← ログイン画面に戻る
      </button>
    </div>
  );
}
