"use client";

import { useState, useCallback } from "react";
import { getDecryptedPrivateKey } from "@/lib/keystore";

interface IOSTSession {
  accountId: string;
  privateKey: string;
}

/**
 * PINを使用して秘密鍵を復号し、IOSTセッションを初期化する
 * 復号化された秘密鍵はメモリ上にのみ保持
 */
export function useIOSTSession() {
  const [session, setSession] = useState<IOSTSession | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const unlock = useCallback(
    async (userId: string, walletId: string, pin: string) => {
      setUnlocking(true);
      setUnlockError(null);

      try {
        const result = await getDecryptedPrivateKey(userId, walletId, pin);
        if (!result) {
          setUnlockError("PINが正しくないか、キーストアが見つかりません");
          return null;
        }

        const newSession: IOSTSession = {
          accountId: result.iostAccountName,
          privateKey: result.privateKey,
        };
        setSession(newSession);
        return newSession;
      } catch {
        setUnlockError("復号に失敗しました");
        return null;
      } finally {
        setUnlocking(false);
      }
    },
    []
  );

  const lock = useCallback(() => {
    setSession(null);
  }, []);

  return {
    session,
    unlocking,
    unlockError,
    unlock,
    lock,
    isUnlocked: session !== null,
  };
}
