"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Wallet, Import } from "lucide-react";

export default function OnboardingPage() {
  const { needsOnboarding } = useAuth();

  useEffect(() => { if (needsOnboarding === false) window.location.href = "/"; }, [needsOnboarding]);

  const goToCreate = () => { window.location.href = "/create"; };
  const goImport = () => { window.location.href = "/import"; };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#c24b46] drop-shadow-[2px_2px_0_#2d3235] mb-3">Welcome</h1>
        <p className="text-text-secondary text-base">IOSTアカウントをお持ちですか？</p>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <button onClick={goToCreate} className="w-full bg-card border-2 border-text-primary retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c24b46] text-white border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0px_0px_#2d3235]">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-primary font-medium">新しく作成する</p>
              <p className="text-text-secondary text-xs mt-1">無料で即座に作成</p>
            </div>
          </div>
        </button>
        <button onClick={goImport} className="w-full bg-card border-2 border-text-primary retro-shadow-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e8b056] text-[#2d3235] border-2 border-text-primary flex items-center justify-center shadow-[4px_4px_0px_0px_#2d3235]">
              <Import className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-primary font-medium">インポート</p>
              <p className="text-text-secondary text-xs mt-1">既存のアカウントを取込</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
