"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const COINGECKO_IOST_ID = "iostoken";

let cachedRate: number | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

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
    const jpy = (data as Record<string, unknown>)?.[COINGECKO_IOST_ID] as Record<string, unknown> | undefined;
    const rate = jpy?.jpy as number | undefined;
    if (rate && rate > 0) {
      cachedRate = rate;
      cacheTime = Date.now();
    }
    return cachedRate ?? 0;
  } catch {
    return cachedRate ?? 0;
  }
}

// モジュールレベルでRate状態を共有
let globalRate: number = cachedRate ?? 0;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function useIostRate(): number {
  const [rate, setRate] = useState(globalRate);
  const rateRef = useRef(globalRate);

  useEffect(() => {
    const listener = () => {
      if (rateRef.current !== globalRate) {
        rateRef.current = globalRate;
        setRate(globalRate);
      }
    };
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const fetchRate = useCallback(async () => {
    const r = await fetchIostRate();
    if (r !== globalRate) {
      globalRate = r;
      notifyListeners();
    }
  }, []);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  return rate;
}

export { fetchIostRate, getCachedRate };

function getCachedRate(): number {
  return cachedRate ?? 0;
}
