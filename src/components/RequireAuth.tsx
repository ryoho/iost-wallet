"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (needsOnboarding === null) return;

    if (needsOnboarding) {
      window.location.href = "/onboarding";
      return;
    }
  }, [user, loading, needsOnboarding]);

  if (loading || needsOnboarding === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-5 h-5 border-2 border-bg border-t-text-primary rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user || needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="text-text-secondary text-sm mb-2">リダイレクト中...</div>
          <div className="w-5 h-5 border-2 border-bg border-t-text-primary rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
