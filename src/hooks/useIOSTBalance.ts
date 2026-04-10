"use client";

import { useState, useEffect, useCallback } from "react";
import { getRPC } from "@/hooks/useIOST";
import { useIostRate } from "@/hooks/useIostRate";
import type { ParsedBalance } from "@/types/iost";

interface UseIOSTBalanceReturn {
  balance: ParsedBalance | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function parseBalance(rawBalance: string): number {
  const num = parseFloat(rawBalance || "0");
  return isNaN(num) ? 0 : Math.floor(num * 1e8) / 1e8;
}

export function useIOSTBalance(accountId: string): UseIOSTBalanceReturn {
  const rate = useIostRate();
  const [balance, setBalance] = useState<ParsedBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // レート更新時にJPY換算を再計算
  useEffect(() => {
    if (balance && rate > 0) {
      setBalance((prev) => prev ? { ...prev, jpyEquivalent: Math.round(prev.iost * rate) } : null);
    }
  }, [rate]);

  const fetchBalance = useCallback(async () => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [accountRes, balanceRes] = await Promise.all([
        getRPC().blockchain.getAccountInfo(accountId, false) as Promise<Record<string, unknown>>,
        getRPC().blockchain.getBalance(accountId, "iost", 0) as Promise<Record<string, unknown>>,
      ]);

      const account = (accountRes?.result || accountRes) as Record<string, unknown> | null;
      const bal = (balanceRes?.result || balanceRes) as Record<string, unknown> | null;

      if (!account) {
        setError("アカウントが見つかりません");
        setBalance(null);
        return;
      }

      const gasInfo = (account.gasInfo || {}) as Record<string, unknown>;
      const ramInfo = (account.ram_info || account.ramInfo || {}) as Record<string, unknown>;
      const iostBalance = parseBalance((bal?.balance as string) || "0");
      const gasCurrent = parseBalance((gasInfo.current_gas as string) || "0");
      const gasTotal = parseBalance((gasInfo.gas_amount as string) || "0");
      const ramAvailable = parseBalance((ramInfo.available as string) || "0");
      const ramTotalRaw = (ramInfo.total as string | undefined);
      const ramTotal = ramTotalRaw ? parseBalance(ramTotalRaw) : ramAvailable;
      const frozenBalance = parseBalance((account.frozen_balance as string) || "0");

      setBalance({
        iost: iostBalance,
        gas: gasCurrent,
        gasTotal,
        ram: ramAvailable,
        ramTotal,
        staked: frozenBalance,
        jpyEquivalent: rate > 0 ? Math.round(iostBalance * rate) : 0,
      });
    } catch {
      setError("残高の取得に失敗しました");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
