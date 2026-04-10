"use client";

import { useState, useEffect } from "react";
import { getRPC } from "@/hooks/useIOST";
import type { ParsedBalance } from "@/types/iost";

// IOST/JPY レート（ハードコード - 将来的にAPIから取得）
const IOST_JPY_RATE = 140;

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
  const [balance, setBalance] = useState<ParsedBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // アカウント情報と残高を並列取得
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
      const ramInfo = (account.ram_info || {}) as Record<string, unknown>;
      const iostBalance = parseBalance((bal?.balance as string) || "0");
      const gasAmount = parseBalance((gasInfo.gas_amount as string) || "0");
      const currentGas = parseBalance((gasInfo.current_gas as string) || "0");
      const ramAvailable = parseBalance((ramInfo.available as string) || "0");
      const frozenBalance = parseBalance((account.frozen_balance as string) || "0");

      setBalance({
        iost: iostBalance,
        gas: currentGas,
        ram: ramAvailable,
        staked: frozenBalance,
        jpyEquivalent: Math.round(iostBalance * IOST_JPY_RATE),
      });
    } catch (err) {
      console.error("Failed to fetch IOST balance:", err);
      setError("残高の取得に失敗しました");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [accountId]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
