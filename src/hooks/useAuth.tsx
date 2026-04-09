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
  refreshWallets: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWalletId, setActiveWalletIdState] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [session, setSession] = useState<IOSTSession | null>(null);

  // 1. onAuthStateChanged でユーザー状態を追跡
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. getRedirectResult でリダイレクト後の認証結果を取得
  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      // リダイレクト結果がなくても onAuthStateChanged が処理する
    });
  }, []);

  // 3. アクティブウォレット変更時にセッションをリセット
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
    <AuthContext.Provider
      value={{
        user, loading, wallets, activeWalletId, setActiveWalletId, needsOnboarding,
        session, unlock, lock, isUnlocked: session !== null,
        signInWithGoogle, logout,
        refreshWallets: () => user ? getWallets(user.uid).then((w) => { setWallets(w); }).catch(() => {}) : Promise.resolve(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
