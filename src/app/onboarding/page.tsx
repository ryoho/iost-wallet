"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, needsOnboarding } = useAuth();
  useEffect(() => { if (needsOnboarding === false) router.push("/"); }, [needsOnboarding, router]);
  if (!user) { router.push("/login"); return null; }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="mb-8"><Image src="/chan01.png" alt="" width={120} height={120} priority /></div>
      <div className="text-center mb-8"><h1 className="text-xl font-bold text-gray-800 mb-2">🎉 ようこそ！</h1><p className="text-gray-400 text-sm">IOSTアカウントをお持ちですか？</p></div>
      <div className="w-full max-w-sm space-y-3">
        <button onClick={() => router.push("/create")} className="w-full bg-white border border-gray-200 rounded-xl p-5 text-left hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">✨</div><div><p className="text-gray-700 font-medium">新しく作成する</p><p className="text-gray-400 text-xs mt-0.5">無料で即座に作成</p></div></div>
        </button>
        <button onClick={() => router.push("/import")} className="w-full bg-white border border-gray-200 rounded-xl p-5 text-left hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-xl">🔑</div><div><p className="text-gray-700 font-medium">インポート</p><p className="text-gray-400 text-xs mt-0.5">既存のアカウントを取込</p></div></div>
        </button>
      </div>
    </div>
  );
}
