"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, needsOnboarding } = useAuth();

  // すでにウォレットがある場合はダッシュボードへ
  useEffect(() => {
    if (needsOnboarding === false) {
      router.push("/");
    }
  }, [needsOnboarding, router]);

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12">
      {/* キャラクター */}
      <div className="mb-8">
        <Image
          src="/chan01.png"
          alt="IOSTちゃん"
          width={140}
          height={140}
          className="drop-shadow-md"
          priority
        />
      </div>

      {/* タイトル */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-700 mb-2">🎉 ようこそ！</h1>
        <p className="text-slate-400 text-sm">
          IOSTアカウントをお持ちですか？
        </p>
      </div>

      {/* 選択肢カード */}
      <div className="w-full max-w-sm space-y-4">
        {/* 新規作成 */}
        <button
          onClick={() => router.push("/create")}
          className="w-full bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-left hover:shadow-lg hover:border-sky-200 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <p className="text-slate-700 font-bold text-base">新しく作成する</p>
              <p className="text-slate-400 text-xs mt-0.5">無料で即座にアカウント作成</p>
            </div>
          </div>
        </button>

        {/* インポート */}
        <button
          onClick={() => router.push("/import")}
          className="w-full bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-left hover:shadow-lg hover:border-violet-200 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🔑
            </div>
            <div>
              <p className="text-slate-700 font-bold text-base">既存のアカウントをインポート</p>
              <p className="text-slate-400 text-xs mt-0.5">IOSTの秘密鍵を入力してください</p>
            </div>
          </div>
        </button>
      </div>

      {/* 説明 */}
      <p className="text-xs text-slate-400 mt-8 text-center leading-relaxed max-w-xs">
        作成したアカウントは暗号化されて安全に保存されます 🔒
      </p>
    </div>
  );
}
