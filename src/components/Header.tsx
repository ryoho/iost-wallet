"use client";

import { useAuth } from "@/hooks/useAuth";
import PinInputDialog from "@/components/PinInputDialog";
import AccountSwitcher from "@/components/AccountSwitcher";
import { useState } from "react";
import { LogOut, Lock, Unlock, Users, ChevronDown } from "lucide-react";

export default function Header() {
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
    } else {
      setPinError("PINが正しくありません");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-sm border-b-2 border-text-primary px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sm">👤</span>
            </div>
            <div className="min-w-0">
              <p className="text-text-secondary text-[11px]">ようこそ</p>
              <p className="text-text-primary font-semibold text-sm truncate">{iostName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {wallets.length > 0 && (
              <button onClick={() => setShowSwitcher(true)} className="w-9 h-9 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center text-sm hover:bg-[#e8b056]/20 transition-colors" title="切り替え"><Users className="w-4 h-4" /></button>
            )}
            {isUnlocked ? (
              <button onClick={lock} className="w-9 h-9 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center text-sm hover:bg-[#e8b056]/20 transition-colors" title="ロック"><Lock className="w-4 h-4" /></button>
            ) : (
              <button onClick={() => { setPinError(null); setShowPinInput(true); }} className="w-9 h-9 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center text-sm hover:bg-[#e8b056]/20 transition-colors" title="解除"><Unlock className="w-4 h-4" /></button>
            )}
            <button onClick={logout} className="w-9 h-9 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center text-sm hover:bg-[#c24b46]/20 transition-colors" title="ログアウト"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      {showPinInput && activeWallet && (
        <PinInputDialog title={`${activeWallet.iostAccountName} のPIN`} onSubmit={handlePinSubmit} onCancel={() => setShowPinInput(false)} error={pinError} />
      )}
      {showSwitcher && <AccountSwitcher onClose={() => setShowSwitcher(false)} />}
    </>
  );
}
