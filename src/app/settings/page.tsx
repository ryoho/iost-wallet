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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-5 pb-24 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">⚙️ 設定</h2>
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
            <div className="px-4 py-4"><p className="text-xs text-gray-400 mb-0.5">👤 アカウント</p><p className="text-gray-800 font-medium">{user?.displayName || user?.email || "N/A"}</p>{user?.email && <p className="text-xs text-gray-400 mt-1">{user.email}</p>}</div>
            <div className="px-4 py-4"><p className="text-sm font-medium text-gray-800 mb-0.5">🔐 ウォレット</p><p className="text-xs text-gray-400">PINで解除すると残高が表示されます</p></div>
            <div className="px-4 py-4"><p className="text-sm font-medium text-gray-800 mb-0.5">📦 バージョン</p><p className="text-xs text-gray-400">1.0.0</p></div>
          </div>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} className="w-full py-3 rounded-lg border border-red-200 text-red-400 font-medium hover:bg-red-50 transition-colors">🚪 ログアウト</button>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <p className="text-gray-800 font-medium">ログアウトしますか？</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 transition-colors">キャンセル</button>
                <button onClick={logout} className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">ログアウト</button>
              </div>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
