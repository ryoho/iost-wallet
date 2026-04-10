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
import { Lock, Unlock, ArrowDownRight, Copy, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { wallets, activeWalletId, session } = useAuth();
  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  const { balance } = useIOSTBalance(activeWallet?.iostAccountName || "");
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (session?.accountId) {
      navigator.clipboard.writeText(session.accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1 px-6 py-6 pb-24 space-y-6">
          {txResult && (
            <div className="bg-[#1d8f6d]/10 border-2 border-[#1d8f6d] text-[#1d8f6d] text-sm rounded-none px-4 py-4 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> トランザクションを送信しました
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
                <h3 className="text-text-secondary font-semibold text-sm px-1 mb-4">トランザクション履歴</h3>
                <TxHistory accountId={session.accountId} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-none bg-card border-2 border-text-primary flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#2d3235]">
                <Lock className="w-10 h-10 text-[#2d3235]" />
              </div>
              <div className="bg-card border-2 border-text-primary retro-shadow p-8 text-center max-w-sm w-full space-y-3">
                <Unlock className="w-6 h-6 mx-auto text-text-secondary" />
                <p className="text-text-primary font-semibold">ウォレットを解除してください</p>
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
            <div className="w-full max-w-sm bg-card border-2 border-text-primary retro-shadow p-8">
              <div className="flex items-center justify-between mb-6 border-b-2 border-bg pb-4">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2"><ArrowDownRight className="w-5 h-5" /> 受け取る</h3>
                <button onClick={() => setShowReceiveModal(false)} className="w-10 h-10 flex items-center justify-center rounded-none text-text-secondary hover:bg-bg transition-colors border-2 border-bg">×</button>
              </div>
              <div className="bg-bg border-2 border-text-primary rounded-none p-4 mb-6">
                <p className="font-mono text-sm text-text-primary break-all">{session.accountId}</p>
              </div>
              <button onClick={handleCopy} className={`w-full border-2 border-text-primary text-text-primary text-sm font-medium py-4 rounded-none transition-all flex items-center justify-center gap-2 ${copied ? "bg-[#1d8f6d]/10 border-[#1d8f6d] text-[#1d8f6d]" : "bg-bg hover:bg-[#e8b056]/20"}`}>
                {copied ? <><CheckCircle2 className="w-4 h-4" /> コピー完了</> : <><Copy className="w-4 h-4" /> アドレスをコピー</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
