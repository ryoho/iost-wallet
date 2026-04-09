"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        <main className="flex-1 px-6 py-8 pb-28 space-y-8">
          <h2 className="text-xl font-black text-slate-700">⚙️ 設定</h2>

          <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md divide-y-2 divide-slate-200">
            <div className="px-6 py-5">
              <p className="text-xs text-slate-400 font-black mb-2">👤 ログイン中のアカウント</p>
              <p className="text-slate-700 font-black text-base">{user?.displayName || user?.email || "N/A"}</p>
              {user?.email && <p className="text-xs text-slate-400 mt-2 font-medium">{user.email}</p>}
            </div>
            <div className="px-6 py-5">
              <p className="text-sm font-black text-slate-700 mb-2">🔐 ウォレット</p>
              <p className="text-xs text-slate-400 font-medium">PINコードでウォレットを解除すると残高が表示されます</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm font-black text-slate-700 mb-2">📦 バージョン</p>
              <p className="text-xs text-slate-400 font-medium">1.0.0 (Phase 4)</p>
            </div>
          </div>

          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} className="w-full py-4 rounded-2xl border-2 border-rose-300 bg-white text-rose-500 font-black text-base hover:bg-rose-50 transition-colors shadow-md">
              🚪 ログアウト
            </button>
          ) : (
            <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-6 space-y-5">
              <p className="text-slate-700 font-black text-base">ログアウトしますか？</p>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 rounded-2xl bg-white border-2 border-slate-300 text-slate-600 font-bold hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm">キャンセル</button>
                <button onClick={logout} className="flex-1 py-4 rounded-2xl bg-rose-400 border-2 border-rose-500 text-white font-bold hover:bg-rose-500 active:scale-[0.98] transition-all shadow-md">ログアウト</button>
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </RequireAuth>
  );
}
