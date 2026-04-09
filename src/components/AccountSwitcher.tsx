"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { deleteWallet } from "@/lib/keystore";

interface AccountSwitcherProps {
  onClose: () => void;
}

type AddMode = "switch" | "add";

export default function AccountSwitcher({ onClose }: AccountSwitcherProps) {
  const { user, wallets, activeWalletId, setActiveWalletId, refreshWallets } = useAuth();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<AddMode>("switch");

  const handleSwitch = (id: string) => {
    setActiveWalletId(id);
    onClose();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteWallet(user.uid, id);
    setConfirmDelete(null);
    await refreshWallets();
  };

  const handleCreate = () => { onClose(); router.push("/create"); };
  const handleImport = () => { onClose(); router.push("/import"); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-700">
            {mode === "switch" ? "💎 アカウント切り替え" : "➕ アカウントを追加"}
          </h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-400 font-bold">✕</button>
        </div>

        {mode === "switch" ? (
          <>
            <div className="space-y-3 mb-5">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                    w.id === activeWalletId
                      ? "bg-sky-50 border-sky-300"
                      : "bg-white border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <button onClick={() => handleSwitch(w.id)} className="flex-1 text-left">
                    <p className={`text-sm font-black ${w.id === activeWalletId ? "text-sky-500" : "text-slate-700"}`}>
                      {w.iostAccountName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                      {w.id === activeWalletId ? "✅ アクティブ" : "タップで切り替え"}
                    </p>
                  </button>

                  {wallets.length > 1 && (
                    confirmDelete === w.id ? (
                      <div className="flex gap-2 ml-3">
                        <button onClick={() => handleDelete(w.id)} className="text-xs bg-rose-400 border-2 border-rose-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-rose-500">削除</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs bg-white border-2 border-slate-300 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-50">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(w.id)} className="text-lg text-slate-300 hover:text-rose-400 ml-3">🗑️</button>
                    )
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setMode("add")}
              className="w-full bg-white border-2 border-dashed border-slate-300 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all"
            >
              ➕ アカウントを追加
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleCreate}
              className="w-full bg-white border-2 border-slate-300 rounded-2xl p-6 text-left hover:border-sky-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-sky-100 border-2 border-sky-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">✨</div>
                <div>
                  <p className="text-slate-700 font-black">新しく作成する</p>
                  <p className="text-slate-400 text-xs mt-1 font-bold">無料で即座にアカウント作成</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleImport}
              className="w-full bg-white border-2 border-slate-300 rounded-2xl p-6 text-left hover:border-violet-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔑</div>
                <div>
                  <p className="text-slate-700 font-black">既存のアカウントをインポート</p>
                  <p className="text-slate-400 text-xs mt-1 font-bold">IOSTの秘密鍵を入力してください</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("switch")}
              className="w-full text-slate-400 text-sm font-bold py-3 hover:text-slate-600 transition-colors"
            >
              ← 切り替え画面に戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
