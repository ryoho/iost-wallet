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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" inputMode="numeric" value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="1234" maxLength={8}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono font-semibold"
            autoFocus
          />
          {error && <div className="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-3">{error}</div>}
          <div className="flex gap-3">
            {onCancel && (
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-50 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">キャンセル</button>
            )}
            <button type="submit" disabled={loading || pin.length < 4} className="flex-1 bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? "確認中..." : "確認"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
