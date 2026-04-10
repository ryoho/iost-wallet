"use client";

import { RequireAuth } from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Clock } from "lucide-react";

export default function HistoryPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <div className="flex-1 px-4 py-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">トランザクション履歴</h2>
          </div>
          <div className="bg-card border-2 border-text-primary retro-shadow p-12 text-center text-text-secondary flex flex-col items-center gap-4">
            <Clock className="w-10 h-10" />
            <p className="text-sm">トランザクション履歴は準備中です</p>
            <p className="text-xs text-text-secondary/60">今後専用のTxノードサーバーを実装予定です</p>
          </div>
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
