"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { user, loading, needsOnboarding, signInWithGoogle } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (loading || !authReady) return;
    if (!user) return;
    if (needsOnboarding === null) return;

    if (needsOnboarding) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/";
    }
  }, [user, loading, needsOnboarding, authReady]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // ログイン失敗時はAuthProvider側で処理
    }
  };

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm border-2 border-text-primary p-8 retro-shadow bg-card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#c24b46] drop-shadow-[2px_2px_0_#2d3235] mb-1">
            💎 IOST Wallet
          </h1>
          <p className="text-text-secondary text-sm">シンプルで安全なウォレット</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-card border-2 border-text-primary text-text-primary font-medium px-4 py-3 retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </button>
      </div>

      <p className="text-xs text-text-secondary mt-8 text-center leading-relaxed max-w-xs">
        Google認証後、IOSTアカウントの作成またはインポートを行います 🔒
      </p>
    </div>
  );
}
