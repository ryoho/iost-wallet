"use client";

import { useState, type FormEvent } from "react";

interface PinInputDialogProps {
  title?: string;
  description?: string;
  onSubmit: (pin: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function PinInputDialog({
  title = "🔐 PINコードを入力",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6 space-y-5">
        <div>
          <h3 className="text-lg font-black text-slate-700">{title}</h3>
          <p className="text-sm text-slate-400 mt-1 font-medium">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" inputMode="numeric" value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="1234" maxLength={8}
            className="w-full px-4 py-5 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-700 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-300 font-mono font-black"
            autoFocus
          />

          {error && <div className="bg-rose-50 border-2 border-rose-300 text-rose-500 text-sm rounded-xl px-5 py-4 font-bold">{error}</div>}

          <div className="flex gap-4">
            {onCancel && (
              <button type="button" onClick={onCancel} className="flex-1 bg-white border-2 border-slate-300 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all">
                キャンセル
              </button>
            )}
            <button type="submit" disabled={loading || pin.length < 4} className="flex-1 bg-sky-400 border-2 border-sky-500 text-white font-bold py-4 rounded-2xl shadow-md hover:bg-sky-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "⏳ 確認中..." : "✅ 確認"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
