"use client";

import { Clock } from "lucide-react";

export default function TxHistory() {
  return (
    <div className="bg-card border-2 border-text-primary retro-shadow p-8 text-center text-text-secondary flex flex-col items-center gap-3">
      <Clock className="w-8 h-8" />
      <p className="text-sm">トランザクション履歴は準備中です</p>
      <p className="text-xs">今後専用のTxノードサーバーを実装予定です</p>
    </div>
  );
}
