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
import Image from "next/image";

export default function Home() {
  const { wallets, activeWalletId, session } = useAuth();
  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  const { balance } = useIOSTBalance(activeWallet?.iostAccountName || "");
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-5 pb-24 space-y-5">
          {txResult && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 font-medium">
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
                <h3 className="text-gray-500 font-semibold text-sm px-1 mb-3">📋 最近のトランザクション</h3>
                <TxHistory />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Image src="/chan01.png" alt="IOSTちゃん" width={100} height={100} className="mb-4" />
              <div className="bg-white rounded-xl shadow-sm p-6 text-center max-w-sm w-full">
                <p className="text-gray-800 font-semibold mb-2">🔐 ウォレットを解除してください</p>
                <p className="text-gray-400 text-sm">右上の🔓をタップしてPINを入力</p>
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
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-800">📥 受け取る</h3>
                <button onClick={() => setShowReceiveModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">✕</button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-mono text-sm text-gray-700 break-all">{session.accountId}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(session.accountId)} className="w-full bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">📋 コピー</button>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
