"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (needsOnboarding === true) {
      router.push("/onboarding");
      return;
    }
  }, [user, loading, needsOnboarding, router]);

  if (loading || needsOnboarding === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-text-secondary">読み込み中...</div>
      </div>
    );
  }

  if (!user || needsOnboarding === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-text-secondary">リダイレクト中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
