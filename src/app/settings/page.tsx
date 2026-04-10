"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Shield, Package, User, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1 px-6 py-6 pb-24 space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">設定</h2>
          <div className="bg-card border-2 border-text-primary retro-shadow divide-y-2 divide-bg">
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center flex-shrink-0"><User className="w-6 h-6 text-text-secondary" /></div>
              <div><p className="text-xs text-text-secondary mb-1">アカウント</p><p className="text-text-primary font-medium">{user?.displayName || user?.email || "N/A"}</p>{user?.email && <p className="text-xs text-text-secondary mt-1">{user.email}</p>}</div>
            </div>
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Lock className="w-6 h-6 text-text-secondary" /></div>
              <div><p className="text-sm font-medium text-text-primary mb-1">ウォレット</p><p className="text-xs text-text-secondary">PINで解除すると残高が表示されます</p></div>
            </div>
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6 text-text-secondary" /></div>
              <div><p className="text-sm font-medium text-text-primary mb-1">セキュリティ</p><p className="text-xs text-text-secondary">AES-256で暗号化</p></div>
            </div>
            <div className="px-5 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6 text-text-secondary" /></div>
              <div><p className="text-sm font-medium text-text-primary mb-1">バージョン</p><p className="text-xs text-text-secondary">1.0.0</p></div>
            </div>
          </div>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} className="w-full py-4 rounded-none border-2 border-[#c24b46] text-[#c24b46] font-medium hover:bg-[#c24b46]/10 transition-colors flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> ログアウト</button>
          ) : (
            <div className="bg-card border-2 border-text-primary retro-shadow p-6 space-y-4">
              <p className="text-text-primary font-medium">ログアウトしますか？</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 rounded-none bg-bg border-2 border-text-primary text-text-primary font-medium hover:bg-[#e8b056]/20 transition-colors">キャンセル</button>
                <button onClick={logout} className="flex-1 py-4 rounded-none bg-[#c24b46] text-white font-medium border-2 border-text-primary hover:bg-[#a03d39] transition-colors flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> ログアウト</button>
              </div>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
