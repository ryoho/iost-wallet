"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useIOSTBalance } from "@/hooks/useIOSTBalance";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import BalanceCard from "@/components/BalanceCard";
import QuickActions from "@/components/QuickActions";
import TxHistory from "@/components/TxHistory";
import SendModal from "@/components/SendModal";
import { Lock, LockOpen } from "lucide-react";

export default function Home() {
  const { wallets, activeWalletId, session } = useAuth();
  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  const { balance } = useIOSTBalance(activeWallet?.iostAccountName || "");
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-5 pb-24 space-y-5">
          {txResult && (
            <div className="bg-[#ecfdf5] border-2 border-text-primary text-[#1d8f6d] text-sm rounded-none px-4 py-3 font-medium">
              ✅ トランザクション送信完了
            </div>
          )}

          {session ? (
            <>
              <BalanceCard accountId={session.accountId} />
              <QuickActions
                onSend={() => setShowSendModal(true)}
                onReceive={() => setShowReceiveModal(true)}
                onStake={() => window.location.href = "/staking"}
              />
              <div>
                <h3 className="text-text-secondary font-semibold text-sm px-1 mb-3">📋 最近のトランザクション</h3>
                <TxHistory accountId={session.accountId} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#e8b056]/20 border-2 border-text-primary flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-[#2d3235]" />
              </div>
              <div className="bg-card border-2 border-text-primary retro-shadow p-6 text-center max-w-sm w-full">
                <p className="text-text-primary font-semibold mb-2">🔐 ウォレットを解除してください</p>
                <p className="text-text-secondary text-sm">右上のロックアイコンをタップしてPINを入力</p>
              </div>
            </div>
          )}
        </main>
        <BottomNav />

        {showSendModal && session && balance && (
          <SendModal
            accountId={session.accountId}
            privateKey={session.privateKey}
            balance={balance.iost}
            onClose={() => setShowSendModal(false)}
            onSuccess={(txHash) => { setShowSendModal(false); setTxResult(txHash); setTimeout(() => setTxResult(null), 3000); }}
            onError={() => {}}
          />
        )}

        {showReceiveModal && session && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-sm bg-card border-2 border-text-primary retro-shadow p-6">
              <div className="flex items-center justify-between mb-5 border-b-2 border-bg pb-4">
                <h3 className="text-base font-semibold text-text-primary">📥 受け取る</h3>
                <button onClick={() => setShowReceiveModal(false)} className="w-8 h-8 flex items-center justify-center rounded-none text-text-secondary hover:bg-bg transition-colors">✕</button>
              </div>
              <div className="bg-bg border-2 border-text-primary rounded-none p-4 mb-4">
                <p className="font-mono text-sm text-text-primary break-all">{session.accountId}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(session.accountId)} className="w-full bg-bg border-2 border-text-primary text-text-primary text-sm font-medium py-3 rounded-none hover:bg-[#e8b056] transition-colors">📋 コピー</button>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
