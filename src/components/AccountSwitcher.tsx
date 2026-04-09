"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { deleteWallet } from "@/lib/keystore";

interface Props { onClose: () => void; }
type Mode = "switch" | "add";

export default function AccountSwitcher({ onClose }: Props) {
  const { user, wallets, activeWalletId, setActiveWalletId } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("switch");

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteWallet(user.uid, id);
    setConfirmDelete(null);
    window.location.reload();
  };

  if (mode === "add") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-base font-semibold text-gray-800 mb-2">➕ アカウントを追加</h3>
          <button onClick={() => { onClose(); window.location.href = "/create"; }} className="w-full bg-white border border-gray-200 rounded-xl p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">✨</div><div><p className="text-gray-700 font-medium">新しく作成する</p><p className="text-gray-400 text-xs mt-0.5">無料で即座に作成</p></div></div>
          </button>
          <button onClick={() => { onClose(); window.location.href = "/import"; }} className="w-full bg-white border border-gray-200 rounded-xl p-5 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-xl">🔑</div><div><p className="text-gray-700 font-medium">インポート</p><p className="text-gray-400 text-xs mt-0.5">既存のアカウントを取込</p></div></div>
          </button>
          <button onClick={() => setMode("switch")} className="w-full text-gray-400 text-sm py-2 hover:text-gray-600">← 戻る</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-gray-800">💎 アカウント</h3><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">✕</button></div>
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {wallets.map((w) => (
            <div key={w.id} className={`flex items-center justify-between p-4 rounded-lg border ${w.id === activeWalletId ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"}`}>
              <button onClick={() => { setActiveWalletId(w.id); onClose(); }} className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${w.id === activeWalletId ? "text-blue-600" : "text-gray-700"}`}>{w.iostAccountName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{w.id === activeWalletId ? "✅ アクティブ" : "タップで切替"}</p>
              </button>
              {wallets.length > 1 && (confirmDelete === w.id ? (
                <div className="flex gap-2 ml-2"><button onClick={() => handleDelete(w.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg">削除</button><button onClick={() => setConfirmDelete(null)} className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg">取消</button></div>
              ) : <button onClick={() => setConfirmDelete(w.id)} className="text-sm text-gray-300 ml-2">🗑️</button>)}
            </div>
          ))}
        </div>
        <button onClick={() => setMode("add")} className="w-full bg-gray-50 border border-dashed border-gray-300 text-gray-500 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">➕ 追加</button>
      </div>
    </div>
  );
}
