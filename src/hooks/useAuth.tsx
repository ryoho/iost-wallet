"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getWallets } from "@/lib/keystore";
import type { Wallet } from "@/lib/keystore";

export interface IOSTSession {
  walletId: string;
  accountId: string;
  privateKey: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  wallets: Wallet[];
  activeWalletId: string | null;
  setActiveWalletId: (id: string | null) => void;
  needsOnboarding: boolean | null;
  session: IOSTSession | null;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  isUnlocked: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWalletId, setActiveWalletIdState] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [session, setSession] = useState<IOSTSession | null>(null);

  useEffect(() => {
    // デバッグ: localStorageのFirebaseauth状態を確認
    const keys = Object.keys(localStorage).filter(k => k.startsWith("firebase:authUser"));
    console.log("[Auth] localStorage keys:", keys);
    keys.forEach(k => {
      try {
        const data = JSON.parse(localStorage.getItem(k) || "{}");
        console.log("[Auth] stored user:", data.email);
      } catch {}
    });

    let authStateReceived = false;
    let minTimerDone = false;
    let redirectProcessed = false;

    const checkReady = () => {
      if (authStateReceived && minTimerDone && redirectProcessed) {
        console.log("[Auth] Ready. user =", auth.currentUser?.email || null);
        setLoading(false);
      }
    };

    // リダイレクト結果の処理を待つ
    getRedirectResult(auth)
      .then((result) => {
        redirectProcessed = true;
        console.log("[Auth] Redirect result:", result?.user?.email || "none");
      })
      .catch((err) => {
        redirectProcessed = true;
        console.log("[Auth] No redirect result:", err?.code || "unknown");
      });

    // 最小1.5秒待機
    const minTimer = setTimeout(() => {
      minTimerDone = true;
      checkReady();
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      authStateReceived = true;
      console.log("[Auth] onAuthStateChanged:", firebaseUser?.email || null);

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const walletList = await getWallets(firebaseUser.uid);
          setWallets(walletList);
          setNeedsOnboarding(walletList.length === 0);
          if (walletList.length > 0) {
            const saved = typeof window !== "undefined" ? localStorage.getItem("iost_active_wallet") : null;
            if (saved && walletList.find((w) => w.id === saved)) {
              setActiveWalletIdState(saved);
            } else {
              setActiveWalletIdState(walletList[0].id);
            }
          } else {
            setActiveWalletIdState(null);
            setSession(null);
          }
        } catch {
          setWallets([]);
          setNeedsOnboarding(true);
        }
      } else {
        setUser(null);
        setWallets([]);
        setActiveWalletIdState(null);
        setNeedsOnboarding(null);
        setSession(null);
      }
      checkReady();
    });

    return () => {
      clearTimeout(minTimer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session && session.walletId !== activeWalletId) {
      setSession(null);
    }
  }, [activeWalletId, session]);

  const setActiveWalletId = (id: string | null) => {
    setActiveWalletIdState(id);
    if (typeof window !== "undefined" && id) {
      localStorage.setItem("iost_active_wallet", id);
    }
  };

  const unlock = async (pin: string): Promise<boolean> => {
    if (!user || !activeWalletId) return false;
    try {
      const { getDecryptedPrivateKey } = await import("@/lib/keystore");
      const result = await getDecryptedPrivateKey(user.uid, activeWalletId, pin);
      if (!result) return false;
      setSession({ walletId: activeWalletId, accountId: result.iostAccountName, privateKey: result.privateKey });
      return true;
    } catch {
      return false;
    }
  };

  const lock = () => setSession(null);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    if (typeof window !== "undefined") localStorage.removeItem("iost_active_wallet");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, wallets, activeWalletId, setActiveWalletId, needsOnboarding, session, unlock, lock, isUnlocked: session !== null, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
