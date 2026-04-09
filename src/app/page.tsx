"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { wallets, activeWalletId, session } = useAuth();
  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  const { balance } = useIOSTBalance(activeWallet?.iostAccountName || "");

  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);

  const handleSendSuccess = (txHash: string) => {
    setShowSendModal(false);
    setTxResult(txHash);
    setTimeout(() => setTxResult(null), 3000);
  };

  const handleSendError = (_message: string) => {};

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        <main className="flex-1 px-6 py-8 pb-28 space-y-8">
          {txResult && (
            <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-600 text-sm rounded-2xl px-6 py-4 font-bold flex items-center gap-3 shadow-md">
              <span className="text-xl">✅</span>
              <span>トランザクション送信完了</span>
            </div>
          )}

          {session ? (
            <>
              <BalanceCard accountId={session.accountId} />
              <QuickActions
                onSend={() => setShowSendModal(true)}
                onReceive={() => setShowReceiveModal(true)}
                onStake={() => router.push("/staking")}
              />

              <div>
                <h3 className="text-slate-600 font-black text-base px-1 mb-4">📋 最近のトランザクション</h3>
                <TxHistory />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <Image
                src="/chan01.png"
                alt="IOSTちゃん"
                width={140}
                height={140}
                className="mb-6 drop-shadow-md"
              />
              <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md p-8 text-center max-w-sm">
                <p className="text-slate-700 font-black text-lg mb-3">
                  🔐 ウォレットを解除してください
                </p>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  右上のロックアイコンをタップして
                  <br />
                  PINコードを入力すると残高が表示されます
                </p>
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
            onSuccess={handleSendSuccess}
            onError={handleSendError}
          />
        )}

        {showReceiveModal && session && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-700">📥 IOSTを受け取る</h3>
                <button onClick={() => setShowReceiveModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-300 hover:bg-slate-50 text-slate-400 font-bold">✕</button>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-5 font-medium">以下のアドレスにIOSTを送ってください</p>
                <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 mb-5">
                  <p className="font-mono text-sm text-slate-700 font-black break-all">{session.accountId}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(session.accountId)} className="bg-white border-2 border-slate-300 text-sky-500 text-sm font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">📋 クリップボードにコピー</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
