"use client";

import { useState, useEffect, useCallback } from "react";

// CoinGecko APIからIOST/JPYレートを取得
const COINGECKO_IOST_ID = "iostoken";

let cachedRate: number | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分キャッシュ

async function fetchIostRate(): Promise<number> {
  if (cachedRate && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedRate;
  }
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IOST_ID}&vs_currencies=jpy`
    );
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    const rate = (data as Record<string, unknown>)?.iost as Record<string, unknown> | undefined;
    const jpy = rate?.jpy as number | undefined;
    if (jpy && jpy > 0) {
      cachedRate = jpy;
      cacheTime = Date.now();
    }
    return cachedRate ?? 0;
  } catch {
    return cachedRate ?? 0;
  }
}

export function useIostRate(): number {
  const [rate, setRate] = useState(cachedRate ?? 0);

  const fetchRate = useCallback(async () => {
    const r = await fetchIostRate();
    setRate(r);
  }, []);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  return rate;
}

export { fetchIostRate };
