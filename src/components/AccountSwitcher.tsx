"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { deleteWallet } from "@/lib/keystore";
import { X, Plus, Wallet, Import, Trash2 } from "lucide-react";

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
        <div className="w-full max-w-sm bg-card border-2 border-text-primary retro-shadow p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2"><Plus className="w-4 h-4" /> アカウントを追加</h3>
          <button onClick={() => { onClose(); window.location.href = "/create"; }} className="w-full bg-card border-2 border-text-primary retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-5 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#c24b46] text-white border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0px_0px_#2d3235]"><Wallet className="w-6 h-6" /></div>
              <div><p className="text-text-primary font-medium">新しく作成する</p><p className="text-text-secondary text-xs mt-0.5">無料で即座に作成</p></div>
            </div>
          </button>
          <button onClick={() => { onClose(); window.location.href = "/import"; }} className="w-full bg-card border-2 border-text-primary retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-5 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#e8b056] text-[#2d3235] border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0px_0px_#2d3235]"><Import className="w-6 h-6" /></div>
              <div><p className="text-text-primary font-medium">インポート</p><p className="text-text-secondary text-xs mt-0.5">既存のアカウントを取込</p></div>
            </div>
          </button>
          <button onClick={() => setMode("switch")} className="w-full text-text-secondary text-sm py-2 hover:text-text-primary">← 戻る</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-card border-2 border-text-primary retro-shadow p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><Wallet className="w-4 h-4" /> アカウント</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-none text-text-secondary hover:bg-bg transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {wallets.map((w) => (
            <div key={w.id} className={`flex items-center justify-between p-4 rounded-none border-2 ${w.id === activeWalletId ? "bg-[#e8b056]/10 border-text-primary" : "bg-card border-bg"}`}>
              <button onClick={() => { setActiveWalletId(w.id); onClose(); }} className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${w.id === activeWalletId ? "text-[#c24b46]" : "text-text-primary"}`}>{w.iostAccountName}</p>
                <p className="text-[10px] text-text-secondary mt-0.5">{w.id === activeWalletId ? "✅ アクティブ" : "タップで切替"}</p>
              </button>
              {wallets.length > 1 && (confirmDelete === w.id ? (
                <div className="flex gap-2 ml-2">
                  <button onClick={() => handleDelete(w.id)} className="text-xs bg-[#c24b46] text-white px-3 py-1.5 rounded-none border border-text-primary">削除</button>
                  <button onClick={() => setConfirmDelete(null)} className="text-xs bg-bg px-3 py-1.5 rounded-none border border-text-primary">取消</button>
                </div>
              ) : <button onClick={() => setConfirmDelete(w.id)} className="text-text-secondary/40 ml-2 hover:text-[#c24b46]"><Trash2 className="w-4 h-4" /></button>)}
            </div>
          ))}
        </div>
        <button onClick={() => setMode("add")} className="w-full bg-bg border-2 border-dashed border-text-primary text-text-primary font-medium py-3 rounded-none hover:bg-[#e8b056]/20 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> 追加</button>
      </div>
    </div>
  );
}
