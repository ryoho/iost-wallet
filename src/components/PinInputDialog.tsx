"use client";

import { useState, type FormEvent } from "react";
import { X, Lock } from "lucide-react";

interface PinInputDialogProps {
  title?: string;
  description?: string;
  onSubmit: (pin: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function PinInputDialog({
  title = "PINコードを入力",
  description = "秘密鍵を復号するにはPINコードが必要です",
  onSubmit, onCancel, loading = false, error = null,
}: PinInputDialogProps) {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    onSubmit(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm bg-card border-2 border-text-primary retro-shadow p-8 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-bg border-2 border-text-primary flex items-center justify-center"><Lock className="w-5 h-5 text-text-secondary" /></div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary mt-0.5">{description}</p>
            </div>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-none border-2 border-bg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" inputMode="numeric" value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="1234" maxLength={8}
            className="w-full px-4 py-4 rounded-none border-2 border-text-primary bg-bg text-text-primary text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#e8b056] focus:border-text-primary font-mono font-semibold"
            autoFocus
          />
          {error && <div className="bg-[#c24b46]/10 border-2 border-[#c24b46] text-[#c24b46] text-sm rounded-none px-4 py-3">{error}</div>}
          <div className="flex gap-3">
            {onCancel && (
              <button type="button" onClick={onCancel} className="flex-1 bg-bg border-2 border-text-primary text-text-primary font-medium py-4 rounded-none hover:bg-[#e8b056]/20 transition-colors">キャンセル</button>
            )}
            <button type="submit" disabled={loading || pin.length < 4} className="flex-1 bg-text-primary text-white font-medium py-4 rounded-none border-2 border-text-primary hover:bg-[#c24b46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? "確認中..." : "確認"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
