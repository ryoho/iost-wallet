"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PinInputDialog from "@/components/PinInputDialog";
import AccountSwitcher from "@/components/AccountSwitcher";

interface HeaderProps {
  onUnlocked?: (accountId: string) => void;
}

export default function Header({ onUnlocked }: HeaderProps) {
  const { user, logout, wallets, activeWalletId, session, unlock, lock, isUnlocked } = useAuth();
  const [showPinInput, setShowPinInput] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const displayName = user?.displayName || user?.email || "ユーザー";
  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  const iostName = session?.accountId || activeWallet?.iostAccountName || displayName;

  const handlePinSubmit = async (pin: string) => {
    setPinError(null);
    const success = await unlock(pin);
    if (success) {
      setShowPinInput(false);
      onUnlocked?.(session?.accountId || "");
    } else {
      setPinError("PINが正しくありません");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b-2 border-slate-300 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-100 border-2 border-sky-200 flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold">ようこそ</p>
              <p className="text-slate-700 font-black text-sm truncate max-w-[140px]">{iostName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {wallets.length > 0 && (
              <button
                onClick={() => setShowSwitcher(true)}
                className="w-12 h-12 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                title="アカウント切り替え"
              >
                <span className="text-lg">💎</span>
              </button>
            )}
            {isUnlocked ? (
              <button
                onClick={lock}
                className="w-12 h-12 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                title="ウォレットをロック"
              >
                <span className="text-lg">🔒</span>
              </button>
            ) : (
              <button
                onClick={() => { setPinError(null); setShowPinInput(true); }}
                className="w-12 h-12 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                title="ウォレットを解除"
              >
                <span className="text-lg">🔓</span>
              </button>
            )}
            <button
              onClick={logout}
              className="w-12 h-12 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
              title="ログアウト"
            >
              <span className="text-lg">🚪</span>
            </button>
          </div>
        </div>
      </header>

      {showPinInput && activeWallet && (
        <PinInputDialog
          title={`🔐 ${activeWallet.iostAccountName} のPIN`}
          onSubmit={handlePinSubmit}
          onCancel={() => setShowPinInput(false)}
          error={pinError}
        />
      )}

      {showSwitcher && (
        <AccountSwitcher onClose={() => setShowSwitcher(false)} />
      )}
    </>
  );
}
